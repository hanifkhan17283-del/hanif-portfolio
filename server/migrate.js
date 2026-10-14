require("dotenv").config();
const fs = require("fs");
const path = require("path");
const {pool} = require("./db");

async function migrate() {
  if (!process.argv.includes("--confirm-backup")) {
    throw new Error(
      "Refusing schema changes without backup confirmation. Run `npm run db:backup`, verify the backup file, then run `npm run db:migrate -- --confirm-backup`."
    );
  }

  const migration = fs.readFileSync(
    path.join(__dirname, "migrations", "001_initial.sql"),
    "utf8"
  );
  const statements = migration
    .split(";")
    .map(statement => statement.trim())
    .filter(Boolean);

  const connection = await pool.getConnection();
  try {
    for (const statement of statements) {
      await connection.query(statement);
    }
  } finally {
    connection.release();
  }
  console.log("MySQL contact/admin schema is ready.");
}

migrate()
  .catch(error => {
    console.error("Database schema setup failed:", error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
