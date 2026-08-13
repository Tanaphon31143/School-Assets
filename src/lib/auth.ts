import crypto from "node:crypto";
import { cookies } from "next/headers";

const secret = process.env.AUTH_SECRET ?? "change-this-auth-secret";
const cookieName = "school_assets_session";

export type SessionUser = { id: number; name: string; email: string; role: string };

function sign(value: string) { return crypto.createHmac("sha256", secret).update(value).digest("hex"); }
export function createSession(user: SessionUser) { const value = Buffer.from(JSON.stringify(user)).toString("base64url"); return `${value}.${sign(value)}`; }
export function readSession(value?: string): SessionUser | null {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(sign(payload)))) return null;
  try { return JSON.parse(Buffer.from(payload, "base64url").toString("utf8")); } catch { return null; }
}
export async function currentUser() { return readSession((await cookies()).get(cookieName)?.value); }
export { cookieName };
