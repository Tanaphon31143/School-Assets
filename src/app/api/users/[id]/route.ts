import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

type Context = { params: Promise<{ id: string }> };
async function admin() { const user = await currentUser(); return user?.role === "admin" ? user : null; }

export async function PATCH(request: Request, { params }: Context) {
  const actor = await admin(); if (!actor) return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  const { id } = await params; const body = await request.json();
  await db.query("UPDATE users SET name=?,email=?,updated_at=NOW() WHERE id=?", [body.name, body.email, id]);
  if (body.password) await db.query("UPDATE users SET password=? WHERE id=?", [await bcrypt.hash(body.password, 10), id]);
  const [role] = await db.query("SELECT id FROM roles WHERE name=? LIMIT 1", [body.role ?? "student"]);
  const roleId = (role as { id: number }[])[0]?.id;
  if (roleId) { await db.query("DELETE FROM model_has_roles WHERE model_id=? AND model_type LIKE '%User'", [id]); await db.query("INSERT INTO model_has_roles(role_id,model_type,model_id) VALUES(?,?,?)", [roleId, "App\\Models\\User", id]); }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, { params }: Context) {
  const actor = await admin(); if (!actor) return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  const { id } = await params; if (Number(id) === actor.id) return NextResponse.json({ error: "ไม่สามารถลบบัญชีที่กำลังใช้งานได้" }, { status: 400 });
  const userId = Number(id); if (!Number.isInteger(userId) || userId < 1) return NextResponse.json({ error: "ไม่พบผู้ใช้งาน" }, { status: 404 });
  const [result] = await db.query("UPDATE users SET name='ลบบัญชีแล้ว', email=CONCAT('deleted-', id, '@deleted.local'), password=?, status='deleted', updated_at=NOW() WHERE id=? AND status <> 'deleted'", [await bcrypt.hash(crypto.randomUUID(), 10), userId]);
  if ((result as { affectedRows: number }).affectedRows === 0) return NextResponse.json({ error: "ไม่พบผู้ใช้งาน" }, { status: 404 });
  await db.query("DELETE FROM model_has_roles WHERE model_id=? AND model_type LIKE '%User'", [userId]);
  return NextResponse.json({ ok: true });
}
