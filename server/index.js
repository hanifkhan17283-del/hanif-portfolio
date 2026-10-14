const path = require("path");
require("dotenv").config({
  path: path.resolve(__dirname, "../.env")
});
const crypto = require("crypto");
const express = require("express");
const session = require("express-session");
const bcrypt = require("bcryptjs");
const helmet = require("helmet");
const {rateLimit} = require("express-rate-limit");
const {pool} = require("./db");
const MySQLSessionStore = require("./mysql-session-store");
const {validateContact} = require("./contact-validation");
const {getEmailConfigurationStatus, sendNotification} = require("./email");

const app = express();
const production = process.env.NODE_ENV === "production";
const sessionSecret = process.env.SESSION_SECRET;

if (
  !sessionSecret ||
  sessionSecret.length < 32 ||
  sessionSecret.startsWith("replace_with_")
) {
  throw new Error("SESSION_SECRET must contain at least 32 characters.");
}
if (production && process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}

app.disable("x-powered-by");
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: [
          "'self'",
          "https://platform.twitter.com",
          "https://www.googletagmanager.com",
          "'sha256-yC/o1mA4BmHfjTSHVS4zXBuZsAcHhtqgJ+p64pLvU7U='"
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"],
        imgSrc: ["'self'", "data:", "https:"],
        fontSrc: ["'self'", "data:", "https://cdn.jsdelivr.net"],
        connectSrc: [
          "'self'",
          "https://www.google-analytics.com",
          "https://region1.google-analytics.com",
          "https://stats.g.doubleclick.net",
          "https://cdn.syndication.twitter.com",
          "https://syndication.twitter.com"
        ],
        frameSrc: [
          "'self'",
          "https://platform.twitter.com",
          "https://syndication.twitter.com"
        ],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        frameAncestors: ["'none'"]
      }
    }
  })
);
app.use(express.json({limit: "20kb"}));
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

const sessionStore = new MySQLSessionStore(pool);
app.use(
  session({
    name: "portfolio_admin",
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      sameSite: "strict",
      secure: production,
      maxAge: 1000 * 60 * 60 * 8
    }
  })
);

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  skipFailedRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {error: "Too many messages. Please try again later."}
});
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 7,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {error: "Too many sign-in attempts. Please try again later."}
});
const retryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {error: "Please wait before retrying notifications."}
});

function issueCsrfToken(req, res) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
  }
  res.json({csrfToken: req.session.csrfToken});
}

function verifyCsrf(req, res, next) {
  const token = req.get("x-csrf-token");
  const expected = req.session.csrfToken;
  if (
    !token ||
    !expected ||
    token.length !== expected.length ||
    !crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  ) {
    return res
      .status(403)
      .json({error: "Your session has expired. Refresh and try again."});
  }
  return next();
}

function requireAdmin(req, res, next) {
  if (!req.session.adminId) {
    return res.status(401).json({error: "Authentication required."});
  }
  return next();
}

function asyncRoute(handler) {
  return (req, res, next) =>
    Promise.resolve(handler(req, res, next)).catch(next);
}

async function updateEmailDelivery(id, message) {
  const [claim] = await pool.execute(
    `UPDATE contact_messages
     SET email_status = 'sending', email_attempts = email_attempts + 1,
         updated_at = UTC_TIMESTAMP(3)
     WHERE id = ? AND email_status IN ('pending', 'failed')`,
    [id]
  );
  if (!claim.affectedRows) {
    return {sent: false, error: "already_processing", processing: true};
  }

  const result = await sendNotification(message);
  if (result.sent) {
    await pool.execute(
      `UPDATE contact_messages
       SET email_status = 'sent', email_error = NULL,
           email_sent_at = UTC_TIMESTAMP(3), updated_at = UTC_TIMESTAMP(3)
       WHERE id = ?`,
      [id]
    );
  } else {
    await pool.execute(
      `UPDATE contact_messages
       SET email_status = 'failed', email_error = ?,
           updated_at = UTC_TIMESTAMP(3)
       WHERE id = ?`,
      [result.error, id]
    );
  }
}

app.get("/api/admin/csrf", issueCsrfToken);

app.post(
  "/api/contact",
  contactLimiter,
  asyncRoute(async (req, res) => {
    if (typeof req.body.website === "string" && req.body.website.trim()) {
      return res
        .status(400)
        .json({error: "Please check your contact form and try again."});
    }
    const validation = validateContact(req.body);
    const submissionKey = req.get("idempotency-key");
    if (
      validation.error ||
      typeof submissionKey !== "string" ||
      !/^[a-zA-Z0-9-]{8,80}$/.test(submissionKey)
    ) {
      return res
        .status(400)
        .json({error: "Please check your contact form and try again."});
    }

    const {name, email, subject, projectType, message} = validation.value;
    const [existingMessages] = await pool.execute(
      "SELECT id FROM contact_messages WHERE submission_key = ?",
      [submissionKey]
    );
    if (existingMessages.length) {
      return res.status(200).json({received: true, id: existingMessages[0].id});
    }

    const id = crypto.randomUUID();
    try {
      await pool.execute(
        `INSERT INTO contact_messages
           (id, name, email, subject, project_type, message, submission_key)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, name, email, subject, projectType, message, submissionKey]
      );
    } catch (error) {
      if (error.code !== "ER_DUP_ENTRY") {
        throw error;
      }
      const [duplicates] = await pool.execute(
        "SELECT id FROM contact_messages WHERE submission_key = ?",
        [submissionKey]
      );
      if (duplicates.length) {
        return res.status(200).json({received: true, id: duplicates[0].id});
      }
      throw error;
    }

    const [savedMessages] = await pool.execute(
      `SELECT id, name, email, subject, project_type, message, created_at
       FROM contact_messages WHERE id = ?`,
      [id]
    );
    const savedMessage = savedMessages[0];
    try {
      await updateEmailDelivery(id, savedMessage);
    } catch (error) {
      console.error(
        "Could not record inquiry email status:",
        error.code || "database_error"
      );
      return res.status(503).json({
        error:
          "Your message was saved, but its notification status could not be confirmed. Please contact the administrator directly."
      });
    }
    return res.status(201).json({received: true, id});
  })
);

app.post(
  "/api/admin/login",
  loginLimiter,
  verifyCsrf,
  asyncRoute(async (req, res) => {
    const email =
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "";
    const password =
      typeof req.body.password === "string" ? req.body.password : "";
    if (!email || !password || password.length > 200) {
      return res.status(401).json({error: "Invalid email or password."});
    }

    const [users] = await pool.execute(
      "SELECT id, email, password_hash FROM admin_users WHERE email = ? LIMIT 1",
      [email]
    );
    const user = users[0];
    const validPassword = user
      ? await bcrypt.compare(password, user.password_hash)
      : await bcrypt.compare(
          password,
          "$2a$12$C6UzMDM.H6dfI/f/IKcEe.5fWjN6c8O6kTQOB9Qq1A4cQfQW4x3eK"
        );
    if (!user || !validPassword) {
      return res.status(401).json({error: "Invalid email or password."});
    }

    await new Promise((resolve, reject) => {
      req.session.regenerate(error => (error ? reject(error) : resolve()));
    });
    req.session.adminId = user.id;
    req.session.adminEmail = user.email;
    req.session.csrfToken = crypto.randomBytes(32).toString("hex");
    await pool.execute(
      "UPDATE admin_users SET last_login_at = UTC_TIMESTAMP(3) WHERE id = ?",
      [user.id]
    );
    return res.json({
      authenticated: true,
      email: user.email,
      csrfToken: req.session.csrfToken
    });
  })
);

app.get("/api/admin/session", (req, res) => {
  if (!req.session.adminId) {
    return res.json({authenticated: false});
  }
  return res.json({authenticated: true, email: req.session.adminEmail});
});

app.post(
  "/api/admin/logout",
  requireAdmin,
  verifyCsrf,
  asyncRoute(async (req, res) => {
    await new Promise((resolve, reject) => {
      req.session.destroy(error => (error ? reject(error) : resolve()));
    });
    res.clearCookie("portfolio_admin", {
      httpOnly: true,
      sameSite: "strict",
      secure: production
    });
    return res.json({loggedOut: true});
  })
);

app.get(
  "/api/admin/stats",
  requireAdmin,
  asyncRoute(async (req, res) => {
    const [rows] = await pool.execute(`
      SELECT COUNT(*) AS total,
             COALESCE(SUM(status = 'unread'), 0) AS unread,
             COALESCE(SUM(status = 'read'), 0) AS \`read\`,
             COALESCE(SUM(replied_at IS NOT NULL), 0) AS replied,
             COALESCE(SUM(email_status = 'failed'), 0) AS email_failures
      FROM contact_messages
    `);
    const stats = Object.fromEntries(
      Object.entries(rows[0]).map(([key, value]) => [key, Number(value)])
    );
    return res.json(stats);
  })
);

app.get(
  "/api/admin/messages",
  requireAdmin,
  asyncRoute(async (req, res) => {
    const conditions = [];
    const values = [];
    const search =
      typeof req.query.search === "string"
        ? req.query.search.trim().slice(0, 100).toLowerCase()
        : "";
    if (search) {
      conditions.push(
        "(LOCATE(?, LOWER(name)) > 0 OR LOCATE(?, LOWER(email)) > 0 OR LOCATE(?, LOWER(subject)) > 0)"
      );
      values.push(search, search, search);
    }
    if (["unread", "read"].includes(req.query.status)) {
      conditions.push("status = ?");
      values.push(req.query.status);
    } else if (req.query.status === "replied") {
      conditions.push("replied_at IS NOT NULL");
    } else if (req.query.status === "email-failed") {
      conditions.push("email_status = 'failed'");
    } else if (req.query.status === "email-pending") {
      conditions.push("email_status = 'pending'");
    }
    if (typeof req.query.projectType === "string" && req.query.projectType) {
      conditions.push("project_type = ?");
      values.push(req.query.projectType.slice(0, 50));
    }
    const order = req.query.sort === "oldest" ? "ASC" : "DESC";
    const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
    const limit = Math.min(
      Math.max(Number.parseInt(req.query.limit, 10) || 50, 1),
      100
    );
    const offset = Math.max(Number.parseInt(req.query.offset, 10) || 0, 0);
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM contact_messages ${where}`,
      values
    );
    const [messages] = await pool.execute(
      `SELECT id, name, email, subject, project_type,
              LEFT(message, 220) AS preview, status, email_status,
              email_attempts, created_at, updated_at, read_at, replied_at
       FROM contact_messages ${where}
       ORDER BY created_at ${order}
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );
    return res.json({
      messages,
      total: Number(countRows[0].total)
    });
  })
);

app.get(
  "/api/admin/messages/:id",
  requireAdmin,
  asyncRoute(async (req, res) => {
    const [messages] = await pool.execute(
      `SELECT id, name, email, subject, project_type, message, status,
              email_status, email_error, email_attempts, email_sent_at,
              created_at, updated_at, read_at, replied_at
       FROM contact_messages WHERE id = ?`,
      [req.params.id]
    );
    if (!messages.length) {
      return res.status(404).json({error: "Message not found."});
    }
    return res.json({message: messages[0]});
  })
);

app.patch(
  "/api/admin/messages/:id",
  requireAdmin,
  verifyCsrf,
  asyncRoute(async (req, res) => {
    const updates = [];
    const values = [];
    if (req.body.status === "read" || req.body.status === "unread") {
      updates.push("status = ?");
      values.push(req.body.status);
      updates.push(
        req.body.status === "read"
          ? "read_at = COALESCE(read_at, UTC_TIMESTAMP(3))"
          : "read_at = NULL"
      );
    }
    if (typeof req.body.replied === "boolean") {
      updates.push(
        req.body.replied
          ? "replied_at = COALESCE(replied_at, UTC_TIMESTAMP(3))"
          : "replied_at = NULL"
      );
    }
    if (!updates.length) {
      return res
        .status(400)
        .json({error: "No valid message update was provided."});
    }
    updates.push("updated_at = UTC_TIMESTAMP(3)");
    values.push(req.params.id);
    const [result] = await pool.execute(
      `UPDATE contact_messages SET ${updates.join(", ")} WHERE id = ?`,
      values
    );
    if (!result.affectedRows) {
      const [messages] = await pool.execute(
        "SELECT id FROM contact_messages WHERE id = ?",
        [req.params.id]
      );
      if (!messages.length) {
        return res.status(404).json({error: "Message not found."});
      }
    }
    return res.json({updated: true});
  })
);

app.delete(
  "/api/admin/messages/:id",
  requireAdmin,
  verifyCsrf,
  asyncRoute(async (req, res) => {
    const [result] = await pool.execute(
      "DELETE FROM contact_messages WHERE id = ?",
      [req.params.id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({error: "Message not found."});
    }
    return res.json({deleted: true});
  })
);

app.post(
  "/api/admin/messages/:id/retry-email",
  requireAdmin,
  verifyCsrf,
  retryLimiter,
  asyncRoute(async (req, res) => {
    const [messages] = await pool.execute(
      `SELECT id, name, email, subject, project_type, message, created_at
       FROM contact_messages
       WHERE id = ? AND email_status IN ('failed', 'pending')`,
      [req.params.id]
    );
    if (!messages.length) {
      return res
        .status(404)
        .json({error: "No failed notification was found for this message."});
    }
    const result = await updateEmailDelivery(req.params.id, messages[0]);
    if (result.processing) {
      return res.status(409).json({
        error:
          "A notification attempt is already in progress. Refresh the inquiry shortly."
      });
    }
    return res.json({retried: true});
  })
);

if (production) {
  const buildPath = path.resolve(
    process.env.PORTFOLIO_BUILD_DIR || path.join(process.cwd(), "build")
  );
  app.use(express.static(buildPath, {index: false}));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/")) {
      return next();
    }
    return res.sendFile(path.join(buildPath, "index.html"));
  });
}

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }
  console.error(
    "Request failed:",
    JSON.stringify({
      method: req.method,
      path: req.path,
      name: error.name,
      code: error.code || null,
      errno: error.errno || null,
      sqlState: error.sqlState || null
    })
  );
  return res
    .status(500)
    .json({error: "The request could not be completed. Please try again."});
});

const port = Number(process.env.PORT || (production ? 3000 : 4000));
if (require.main === module) {
  const emailConfiguration = getEmailConfigurationStatus();
  if (emailConfiguration.missing.length) {
    console.warn(
      `Email notifications are not configured; inquiry storage remains enabled. Set: ${emailConfiguration.missing.join(
        ", "
      )}`
    );
  }
  if (emailConfiguration.invalid.length) {
    console.warn(
      `Email notification settings are invalid: ${emailConfiguration.invalid.join(
        ", "
      )}`
    );
  }
  pool
    .getConnection()
    .then(connection => {
      connection.release();
      app.listen(port, () =>
        console.log(`Portfolio server listening on port ${port}`)
      );
    })
    .catch(error => {
      console.error(
        "Could not connect to the configured MySQL database:",
        error.code || "connection_error"
      );
      process.exitCode = 1;
      pool.end();
    });
}

module.exports = app;
