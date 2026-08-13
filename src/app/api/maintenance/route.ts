import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

const names = [
  "คอมพิวเตอร์ตั้งโต๊ะ", "โน้ตบุ๊ก", "เครื่องพิมพ์", "ลูกฟุตบอล", "โต๊ะเรียน",
  "เก้าอี้นักเรียน", "กล้องจุลทรรศน์", "ชุดทดลองไฟฟ้า", "โปรเจกเตอร์", "กระดานไวท์บอร์ด",
  "คอมพิวเตอร์ตั้งโต๊ะ", "โน้ตบุ๊ก", "เครื่องพิมพ์", "ลูกฟุตบอล", "โต๊ะเรียน",
  "เก้าอี้นักเรียน", "กล้องจุลทรรศน์", "ชุดทดลองไฟฟ้า", "โปรเจกเตอร์", "กระดานไวท์บอร์ด",
];

async function repairNames() {
  for (let i = 0; i < names.length; i += 1) {
    await db.query("UPDATE equipment SET name=? WHERE code=?", [names[i], `EQ-${String(i + 1).padStart(4, "0")}`]);
  }
}

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });

  await repairNames();
  const [rows] = await db.query(
    "SELECT m.*,e.name AS equipment_name,e.code AS equipment_code,u.name AS reporter_name FROM equipment_maintenances m JOIN equipment e ON e.id=m.equipment_id JOIN users u ON u.id=m.reported_by ORDER BY m.created_at DESC",
  );
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบก่อนแจ้งซ่อม" }, { status: 401 });

  let body: { equipment_id?: unknown; issue_description?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "ข้อมูลแบบฟอร์มไม่ถูกต้อง" }, { status: 400 });
  }

  const equipmentId = Number(body.equipment_id);
  const issue = String(body.issue_description ?? "").trim();
  if (!Number.isInteger(equipmentId) || equipmentId <= 0 || !issue) {
    return NextResponse.json({ error: "กรุณาเลือกครุภัณฑ์และระบุอาการเสีย" }, { status: 400 });
  }

  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const [equipmentRows] = await connection.query("SELECT id FROM equipment WHERE id=? LIMIT 1", [equipmentId]);
    if (!(equipmentRows as Array<{ id: number }>).length) {
      await connection.rollback();
      return NextResponse.json({ error: "ไม่พบครุภัณฑ์รายการนี้" }, { status: 404 });
    }

    const [userRows] = await connection.query("SELECT id FROM users WHERE id=? LIMIT 1", [user.id]);
    if (!(userRows as Array<{ id: number }>).length) {
      await connection.rollback();
      return NextResponse.json({ error: "ไม่พบบัญชีผู้แจ้งในระบบ กรุณาเข้าสู่ระบบใหม่" }, { status: 401 });
    }

    const [result] = await connection.query(
      "INSERT INTO equipment_maintenances(equipment_id,reported_by,reported_date,issue_description,status,created_at,updated_at) VALUES(?,?,CURDATE(),?,?,NOW(),NOW())",
      [equipmentId, user.id, issue, "reported"],
    );
    await connection.query("UPDATE equipment SET status='maintenance' WHERE id=?", [equipmentId]);
    await connection.commit();

    return NextResponse.json({ id: (result as { insertId: number }).insertId }, { status: 201 });
  } catch (error) {
    await connection.rollback();
    console.error("maintenance POST failed", error);
    return NextResponse.json(
      { error: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : "บันทึกแจ้งซ่อมไม่สำเร็จ กรุณาลองใหม่" },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}
