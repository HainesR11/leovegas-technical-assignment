import pg from "pg";
const { Pool } = pg;

export const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB_NAME,
  user: process.env.POSTGRES_USERNAME,
  password: process.env.POSTGRES_PASSWORD,
  port: Number.parseInt(process.env.POSTGRES_PORT ?? ""),
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle client", err);
});

export default pool;
