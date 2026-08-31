import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

const allowedTypes = new Set(["image/jpeg", "image/png"]);
const maxBytes = 5 * 1024 * 1024;

export async function POST(request: Request) {
  const user = await currentUser(); if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  const form = await request.formData(); const file = form.get("avatar");
  if (!(file instanceof File)) return NextResponse.json({ error: "กรุณาเลือกรูปภาพ" }, { status: 422 });
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "รองรับเฉพาะไฟล์ JPG และ PNG" }, { status: 422 });
  if (file.size > maxBytes) return NextResponse.json({ error: "รูปภาพต้องมีขนาดไม่เกิน 5 MB" }, { status: 422 });
  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64"); const avatarUrl = `data:${file.type};base64,${base64}`;
  await db.query("UPDATE users SET avatar_url=?,updated_at=NOW() WHERE id=?", [avatarUrl, user.id]);
  return NextResponse.json({ avatarUrl });
}

export async function DELETE() {
  const user = await currentUser(); if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  await db.query("UPDATE users SET avatar_url=NULL,updated_at=NOW() WHERE id=?", [user.id]);
  return NextResponse.json({ ok: true });
}
