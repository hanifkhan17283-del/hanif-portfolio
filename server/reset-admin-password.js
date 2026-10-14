require("dotenv").config({
  path: "D:/developerFolio-master/.env"
});

const bcrypt = require("bcryptjs");
const readline = require("readline");
const { pool } = require("./db");

const email = "hanifkhan17283@gmail.com";

function ask(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve =>
    rl.question(question, answer => {
      rl.close();
      resolve(answer.trim());
    })
  );
}

function askPassword(prompt) {
  return new Promise((resolve, reject) => {
    if (!process.stdin.isTTY || !process.stdin.setRawMode) {
      reject(new Error("Run this script in an interactive PowerShell terminal."));
      return;
    }

    let password = "";
    process.stdout.write(prompt);

    const onData = buffer => {
      const ch = buffer.toString();

      if (ch === "\u0003") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener("data", onData);
        reject(new Error("Cancelled."));
      } else if (ch === "\r" || ch === "\n") {
        process.stdin.setRawMode(false);
        process.stdin.pause();
        process.stdin.removeListener("data", onData);
        process.stdout.write("\n");
        resolve(password);
      } else if (ch === "\u007f" || ch === "\b") {
        password = password.slice(0, -1);
      } else if (ch >= " ") {
        password += ch;
      }
    };

    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", onData);
  });
}

async function main() {
  const [rows] = await pool.execute(
    "SELECT id FROM admin_users WHERE email = ? LIMIT 1",
    [email]
  );

  if (!rows.length) {
    throw new Error("Admin account not found. No changes made.");
  }

  const password = await askPassword("Enter new password (12+ characters): ");
  const confirmation = await askPassword("Confirm new password: ");

  if (
    password.length < 12 ||
    Buffer.byteLength(password, "utf8") > 72 ||
    password !== confirmation
  ) {
    throw new Error("Passwords must match, be at least 12 characters, and be no more than 72 UTF-8 bytes.");
  }

  const hash = await bcrypt.hash(password, 12);

  await pool.execute(
    "UPDATE admin_users SET password_hash = ? WHERE email = ?",
    [hash, email]
  );

  console.log("Admin password reset successfully.");
}

main()
  .catch(error => {
    console.error("Password reset failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
