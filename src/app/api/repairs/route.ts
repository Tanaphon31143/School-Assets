import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureRepairSchema, isRepairPriority } from "@/lib/repairs";

export async function GET() {
  try {
    if (!await currentUser()) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    await ensureRepairSchema();
    const [[summaryRows], [items]] = await Promise.all([
      db.query("SELECT status, COUNT(*) AS total FROM equipment_maintenances GROUP BY status"),
      db.query(`SELECT m.id, m.equipment_id, m.issue_description, m.priority, m.status, m.reported_date, m.created_at,
        e.name AS equipment_name, e.code AS equipment_code, c.name AS category_name, u.name AS reporter_name
        FROM equipment_maintenances m
        JOIN equipment e ON e.id = m.equipment_id
        JOIN users u ON u.id = m.reported_by
        LEFT JOIN equipment_categories c ON c.id = e.equipment_category_id
        ORDER BY m.created_at DESC LIMIT 30`),
    ]);
    return NextResponse.json({ summary: summaryRows, items });
  } catch (error) {
    console.error("repairs GET failed", error);
    return NextResponse.json({ error: "ไม่สามารถโหลดรายการแจ้งซ่อมได้" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนแจ้งซ่อม" }, { status: 401 });
    const body = await request.json();
    const equipmentId = Number(body.equipment_id);
    const description = String(body.issue_description ?? "").trim();
    if (!Number.isInteger(equipmentId) || equipmentId <= 0 || !description) return NextResponse.json({ error: "กรุณาเลือกครุภัณฑ์และอธิบายปัญหา" }, { status: 422 });
    if (!isRepairPriority(body.priority)) return NextResponse.json({ error: "กรุณาเลือกระดับความเร่งด่วน" }, { status: 422 });
    await ensureRepairSchema();
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [assets] = await connection.query("SELECT id FROM equipment WHERE id=? AND status <> 'disposed' FOR UPDATE", [equipmentId]);
      if (!(assets as { id: number }[]).length) {
        await connection.rollback();
        return NextResponse.json({ error: "ไม่พบครุภัณฑ์ที่เลือก หรือรายการถูกจำหน่ายแล้ว" }, { status: 404 });
      }
      const [result] = await connection.query(`INSERT INTO equipment_maintenances
        (equipment_id, reported_by, reported_date, issue_description, priority, status, created_at, updated_at)
        VALUES (?, ?, CURDATE(), ?, ?, 'reported', NOW(), NOW())`, [equipmentId, user.id, description, body.priority]);
      await connection.query("UPDATE equipment SET status='maintenance', updated_at=NOW() WHERE id=?", [equipmentId]);
      await connection.commit();
      return NextResponse.json({ id: (result as { insertId: number }).insertId }, { status: 201 });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("repairs POST failed", error);
    return NextResponse.json({ error: "บันทึกแจ้งซ่อมไม่สำเร็จ กรุณาลองใหม่" }, { status: 500 });
  }
}
