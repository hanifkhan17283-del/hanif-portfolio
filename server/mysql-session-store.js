const session = require("express-session");

const SESSION_LIFETIME_MS = 8 * 60 * 60 * 1000;

class MySQLSessionStore extends session.Store {
  constructor(pool) {
    super();
    this.pool = pool;
    this.cleanupTimer = setInterval(() => {
      this.pool
        .execute("DELETE FROM admin_sessions WHERE expires_at <= UTC_TIMESTAMP(3)")
        .catch(error => {
          console.error(
            "Expired session cleanup failed:",
            error.code || "database_error"
          );
        });
    }, 15 * 60 * 1000);
    this.cleanupTimer.unref();
  }

  get(sid, callback) {
    this.pool
      .execute(
        "SELECT sess FROM admin_sessions WHERE sid = ? AND expires_at > UTC_TIMESTAMP(3)",
        [sid]
      )
      .then(([rows]) => {
        if (!rows.length) {
          callback(null, null);
          return;
        }
        try {
          callback(null, JSON.parse(rows[0].sess));
        } catch (error) {
          callback(error);
        }
      })
      .catch(callback);
  }

  set(sid, sess, callback = () => {}) {
    const expiresAt = this.getExpiry(sess);
    this.pool
      .execute(
        `INSERT INTO admin_sessions (sid, expires_at, sess)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE expires_at = VALUES(expires_at), sess = VALUES(sess)`,
        [sid, expiresAt, JSON.stringify(sess)]
      )
      .then(() => callback(null))
      .catch(callback);
  }

  touch(sid, sess, callback = () => {}) {
    this.pool
      .execute(
        "UPDATE admin_sessions SET expires_at = ? WHERE sid = ?",
        [this.getExpiry(sess), sid]
      )
      .then(() => callback(null))
      .catch(callback);
  }

  destroy(sid, callback = () => {}) {
    this.pool
      .execute("DELETE FROM admin_sessions WHERE sid = ?", [sid])
      .then(() => callback(null))
      .catch(callback);
  }

  close() {
    clearInterval(this.cleanupTimer);
  }

  getExpiry(sess) {
    const cookieExpiry = sess.cookie && sess.cookie.expires;
    const expiry = cookieExpiry ? new Date(cookieExpiry) : null;
    return expiry && !Number.isNaN(expiry.getTime())
      ? expiry
      : new Date(Date.now() + SESSION_LIFETIME_MS);
  }
}

module.exports = MySQLSessionStore;
