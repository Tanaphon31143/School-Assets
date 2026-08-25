import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

type RegisterBody = { name?: string; email?: string; password?: string; role?: string };

export async function POST(request: Request) {
  const body = await request.json() as RegisterBody;
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const role = body.role ?? "student";

  if (!name || !email || !body.password) {
    return NextResponse.json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" }, { status: 422 });
  }
  if (name.length < 2 || body.password.length < 8) {
    return NextResponse.json({ error: "ชื่อผู้ใช้งานต้องมีอย่างน้อย 2 ตัวอักษร และรหัสผ่านอย่างน้อย 8 ตัวอักษร" }, { status: 422 });
  }
  if (role !== "teacher" && role !== "student") {
    return NextResponse.json({ error: "กรุณาเลือกประเภทผู้ใช้งาน" }, { status: 422 });
  }

  const [existingRows] = await db.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]);
  if ((existingRows as { id: number }[]).length > 0) {
    return NextResponse.json({ error: "อีเมลนี้ถูกใช้งานแล้ว" }, { status: 409 });
  }

  const [roleRows] = await db.query("SELECT id FROM roles WHERE name = ? LIMIT 1", [role]);
  const selectedRole = (roleRows as { id: number }[])[0];
  if (!selectedRole) {
    return NextResponse.json({ error: "ไม่พบประเภทผู้ใช้งานในระบบ" }, { status: 500 });
  }

  const [result] = await db.query(
    "INSERT INTO users(name,email,password,status,created_at,updated_at) VALUES(?,?,?,?,NOW(),NOW())",
    [name, email, await bcrypt.hash(body.password, 10), "inactive"],
  );
  const userId = (result as { insertId: number }).insertId;
  await db.query(
    "INSERT INTO model_has_roles(role_id,model_type,model_id) VALUES(?,?,?)",
    [selectedRole.id, "App\\Models\\User", userId],
  );

  return NextResponse.json({ id: userId }, { status: 201 });
}
