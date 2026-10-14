require("dotenv").config();
const readline = require("readline");
const bcrypt = require("bcryptjs");
const {pool} = require("./db");

function parseArgs() {
  const args = process.argv.slice(2);
  const values = {};
  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--email" || arg === "--password") {
      const next = args[index + 1];
      if (!next) {
        throw new Error(`Missing value for ${arg}.`);
      }
      values[arg.replace(/^--/, "")] = next;
      index += 1;
    }
  }
  return values;
}

function ask(question) {
  const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve =>
    terminal.question(question, answer => {
      terminal.close();
      resolve(answer.trim());
    })
  );
}

function askPassword(prompt) {
  return new Promise((resolve, reject) => {
    if (
      !process.stdin.isTTY ||
      typeof process.stdin.setRawMode !== "function"
    ) {
      reject(
        new Error(
          "Run this setup from an interactive terminal so the password can be hidden, or provide ADMIN_EMAIL and ADMIN_PASSWORD environment variables."
        )
      );
      return;
    }

    process.stdout.write(prompt);
    let password = "";
    const onData = buffer => {
      const character = buffer.toString();
      if (character === "\u0003") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        reject(new Error("Admin setup cancelled."));
      } else if (character === "\r" || character === "\n") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(password);
      } else if (character === "\u007f" || character === "\b") {
        password = password.slice(0, -1);
      } else if (character >= " ") {
        password += character;
      }
    };

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", onData);
  });
}

async function createAdmin() {
  const cliValues = parseArgs();
  const configuredEmail =
    process.env.ADMIN_EMAIL || cliValues.email || "";
  const configuredPassword =
    process.env.ADMIN_PASSWORD || cliValues.password || "";

  let email = configuredEmail.trim().toLowerCase();
  let password = configuredPassword;

  if (!email) {
    email = (await ask("Admin email: ")).toLowerCase();
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Enter a valid admin email address.");
  }

  if (!password) {
    if (
      !process.stdin.isTTY ||
      typeof process.stdin.setRawMode !== "function"
    ) {
      throw new Error(
        "Supply ADMIN_PASSWORD or pass --password so the first admin account can be created non-interactively."
      );
    }

    password = await askPassword("Password (minimum 12 characters): ");
    const confirmation = await askPassword("Confirm password: ");
    if (
      password.length < 12 ||
      Buffer.byteLength(password, "utf8") > 72 ||
      password !== confirmation
    ) {
      throw new Error(
        "Passwords must match, contain at least 12 characters, and use no more than 72 UTF-8 bytes."
      );
    }
  }

  if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
    throw new Error(
      "Password must be at least 12 characters and no more than 72 UTF-8 bytes."
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);
  try {
    await pool.execute(
      "INSERT INTO admin_users (email, password_hash) VALUES (?, ?)",
      [email, passwordHash]
    );
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error(
        "An admin account already exists for that email. No account was changed."
      );
    }
    throw error;
  }
  console.log(`Admin account configured for ${email}.`);
}

createAdmin()
  .catch(error => {
    console.error("Admin setup failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
