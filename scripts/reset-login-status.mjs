import fs from "node:fs";
import mysql from "mysql2/promise";

const line = fs.readFileSync(".env.local", "utf8").split(/\r?\n/).find((entry) => entry.startsWith("DATABASE_URL="));
if (!line) throw new Error("DATABASE_URL not found");

const url = new URL(line.slice("DATABASE_URL=".length).trim().replace(/^\"|\"$/g, ""));
const db = await mysql.createConnection({ host: url.hostname, port: url.port || 3306, user: decodeURIComponent(url.username), password: decodeURIComponent(url.password), database: url.pathname.slice(1), ssl: { rejectUnauthorized: false } });
await db.query("UPDATE users SET status='inactive', updated_at=NOW()");
console.log("All existing users have been marked as logged out.");
await db.end();
