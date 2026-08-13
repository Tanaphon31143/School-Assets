import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { cookieName, createSession } from "@/lib/auth";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  if (!email || !password) return NextResponse.json({ error: "กรุณากรอกอีเมลและรหัสผ่าน" }, { status: 422 });
  const [rows] = await db.query("SELECT u.id, u.name, u.email, u.password, COALESCE(r.name, 'user') AS role FROM users u LEFT JOIN model_has_roles m ON m.model_id = u.id AND m.model_type LIKE '%User' LEFT JOIN roles r ON r.id = m.role_id WHERE u.email = ? LIMIT 1", [email]);
  const user = (rows as { id: number; name: string; email: string; password: string; role: string }[])[0];
  if (!user || !(await bcrypt.compare(password, user.password))) return NextResponse.json({ error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" }, { status: 401 });
  const response = NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role } });
  response.cookies.set(cookieName, createSession({ id: user.id, name: user.name, email: user.email, role: user.role }), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 8 });
  return response;
}
