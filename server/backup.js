require("dotenv").config();
const fs = require("fs");
const os = require("os");
const path = require("path");
const {spawn} = require("child_process");
const {finished} = require("stream/promises");
const {config} = require("./db");

async function backup() {
  const dumpPath =
    process.env.MYSQLDUMP_PATH ||
    "D:\\Web Setup\\xampp1\\mysql\\bin\\mysqldump.exe";
  if (!fs.existsSync(dumpPath)) {
    throw new Error(
      "mysqldump was not found. Set MYSQLDUMP_PATH to the verified XAMPP mysqldump.exe location."
    );
  }

  const backupDirectory =
    process.env.DB_BACKUP_DIR ||
    path.join(os.homedir(), "portfolio-database-backups");
  fs.mkdirSync(backupDirectory, {recursive: true});
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupFile = path.join(
    backupDirectory,
    `${config.database}-${timestamp}.sql`
  );
  const output = fs.createWriteStream(backupFile, {flags: "wx"});
  const outputFinished = finished(output);

  try {
    const child = spawn(
      dumpPath,
      [
        "--host",
        config.host,
        "--port",
        String(config.port),
        "--user",
        config.user,
        "-p",
        "--single-transaction",
        "--routines",
        "--triggers",
        "--databases",
        config.database
      ],
      {stdio: ["inherit", output, "inherit"]}
    );

    await new Promise((resolve, reject) => {
      child.once("error", reject);
      child.once("close", code => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`mysqldump exited with status ${code}.`));
        }
      });
    });
    await outputFinished;
    console.log(`Database backup created: ${backupFile}`);
  } catch (error) {
    output.destroy();
    try {
      fs.rmSync(backupFile, {force: true});
    } catch (cleanupError) {
      console.error(
        "Could not remove the incomplete backup:",
        cleanupError.message
      );
    }
    throw error;
  }
}

backup()
  .catch(error => {
    console.error("Database backup failed:", error.message);
    process.exitCode = 1;
  });
