const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const path = require("path");

test("migration only creates the contact and admin tables and indexes", () => {
  const migration = fs.readFileSync(
    path.join(__dirname, "migrations", "001_initial.sql"),
    "utf8"
  );
  const tables = [...migration.matchAll(/CREATE TABLE IF NOT EXISTS (\w+)/g)].map(
    match => match[1]
  );

  assert.deepEqual(tables.sort(), [
    "admin_sessions",
    "admin_users",
    "contact_messages"
  ]);
  assert.doesNotMatch(migration, /\b(DROP|TRUNCATE|ALTER)\s+(TABLE|DATABASE)\b/i);
});
