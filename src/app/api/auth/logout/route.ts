import { NextResponse } from "next/server";
import { cookieName, currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST() {
  const user = await currentUser();
  if (user) await db.query("UPDATE users SET status='inactive', updated_at=NOW() WHERE id=?", [user.id]);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookieName, "", { httpOnly: true, expires: new Date(0), sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/" });
  return response;
}
