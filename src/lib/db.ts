import mysql from "mysql2/promise";

const globalForDb = globalThis as unknown as { dbPool?: mysql.Pool };

if (!process.env.DATABASE_URL) {
  console.error("[DB] ❌ DATABASE_URL is not set!");
} else {
  console.log("[DB] ✅ DATABASE_URL found, connecting to database...");
}

const connectionUrl = new URL(process.env.DATABASE_URL ?? "");

export const db = globalForDb.dbPool ?? mysql.createPool({
  host: connectionUrl.hostname,
  port: Number(connectionUrl.port || 4000),
  user: decodeURIComponent(connectionUrl.username),
  password: decodeURIComponent(connectionUrl.password),
  database: connectionUrl.pathname.replace(/^\//, ""),
  ssl: { rejectUnauthorized: true },
  waitForConnections: true,
  connectionLimit: 5,
  enableKeepAlive: true,
});
if (process.env.NODE_ENV !== "production") globalForDb.dbPool = db;
