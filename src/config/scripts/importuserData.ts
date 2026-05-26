import { readFileSync } from "fs";
import { resolve } from "path";
import pool from "../../services/postgresDatabase";

const SQL_FILE = resolve(__dirname, "../config/scripts/importCsv.sql");
const CSV_FILE = resolve(__dirname, "../config/mock_user_data.csv");

async function importCsv(): Promise<void> {
  let sql = readFileSync(SQL_FILE, "utf-8");
  // COPY FROM path is resolved by the Postgres server — must be absolute
  sql = sql.replace("'../mock_user_data.csv'", `'${CSV_FILE}'`);

  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log("Import complete.");
  } catch (err) {
    console.error("Import failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

importCsv();
