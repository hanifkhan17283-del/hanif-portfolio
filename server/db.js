const mysql = require("mysql2/promise");

const required = ["DB_NAME", "DB_USER", "DB_PASSWORD"];
const missing = required.filter(
  key =>
    process.env[key] === undefined ||
    (key !== "DB_PASSWORD" && !process.env[key].trim())
);
if (missing.length) {
  throw new Error(`Configure ${missing.join(", ")} in the project .env file.`);
}

const config = {
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
};

if (!Number.isInteger(config.port) || config.port < 1 || config.port > 65535) {
  throw new Error("DB_PORT must be a valid TCP port.");
}

const pool = mysql.createPool({
  ...config,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: "Z",
  charset: "utf8mb4"
});

pool.on("error", error => {
  console.error("Unexpected MySQL pool error:", error.code || "database_error");
});

module.exports = {config, pool};
