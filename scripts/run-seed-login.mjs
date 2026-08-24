import fs from "node:fs";
import mysql from "mysql2/promise";

const line = fs.readFileSync(".env.local", "utf8").split(/\r?\n/).find((x) => x.startsWith("DATABASE_URL="));
if (!line) throw new Error("DATABASE_URL not found");
const url = new URL(line.slice("DATABASE_URL=".length).trim().replace(/^"|"$/g, ""));
const db = await mysql.createConnection({ host: url.hostname, port: url.port || 3306, user: decodeURIComponent(url.username), password: decodeURIComponent(url.password), database: url.pathname.slice(1), ssl: { rejectUnauthorized: false } });
const sql = fs.readFileSync("scripts/seed-login-users.sql", "utf8").replace(/--.*$/gm, "");
for (const statement of sql.split(";").map((x) => x.trim()).filter(Boolean)) await db.query(statement);
console.log("Login accounts seeded successfully");
await db.end();

