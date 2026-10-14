const test = require("node:test");
const assert = require("node:assert/strict");
const MySQLSessionStore = require("./mysql-session-store");

test("persists and retrieves JSON sessions with parameterized SQL", async () => {
  const storedSession = {
    adminId: 7,
    cookie: {expires: new Date("2026-12-01T12:00:00.000Z")}
  };
  const calls = [];
  const pool = {
    execute: async (sql, values) => {
      calls.push({sql, values});
      if (sql.startsWith("SELECT sess")) {
        return [[{sess: JSON.stringify(storedSession)}], []];
      }
      return [{affectedRows: 1}, []];
    }
  };
  const store = new MySQLSessionStore(pool);

  try {
    await new Promise((resolve, reject) =>
      store.set("session-id", storedSession, error =>
        error ? reject(error) : resolve()
      )
    );
    const loaded = await new Promise((resolve, reject) =>
      store.get("session-id", (error, value) =>
        error ? reject(error) : resolve(value)
      )
    );

    assert.deepEqual(loaded, storedSession);
    assert.match(calls[0].sql, /INSERT INTO admin_sessions/);
    assert.deepEqual(calls[0].values, [
      "session-id",
      new Date("2026-12-01T12:00:00.000Z"),
      JSON.stringify(storedSession)
    ]);
    assert.deepEqual(calls[1].values, ["session-id"]);
  } finally {
    store.close();
  }
});
