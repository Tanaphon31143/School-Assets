import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET() {
  const user = await currentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  const [rows] = await db.query("SELECT d.*, e.code AS equipment_code, e.name AS equipment_name, u.name AS approver_name FROM equipment_disposals d JOIN equipment e ON e.id=d.equipment_id LEFT JOIN users u ON u.id=d.approved_by ORDER BY d.disposal_date DESC, d.id DESC");
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  const body = await request.json();
  if (!body.equipment_id || !body.reason || !body.disposal_method) return NextResponse.json({ error: "กรอกข้อมูลไม่ครบ" }, { status: 400 });
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    const [result] = await connection.query("INSERT INTO equipment_disposals (equipment_id,disposal_date,reason,approved_by,disposal_method,notes,created_at,updated_at) VALUES (?,?,?,?,?,?,NOW(),NOW())", [body.equipment_id, body.disposal_date || new Date().toISOString().slice(0, 10), body.reason, user.id, body.disposal_method, body.notes || null]);
    await connection.query("UPDATE equipment SET status='disposed', updated_at=NOW() WHERE id=?", [body.equipment_id]);
    await connection.commit();
    return NextResponse.json({ id: (result as { insertId: number }).insertId }, { status: 201 });
  } catch (error) { await connection.rollback(); return NextResponse.json({ error: "บันทึกไม่สำเร็จ" }, { status: 500 }); } finally { connection.release(); }
}
