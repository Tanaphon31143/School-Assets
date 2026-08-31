import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  try {
    if (!await currentUser()) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    const [rows] = await db.query(`SELECT e.id, e.code, e.name, e.status, c.name AS category_name
      FROM equipment e LEFT JOIN equipment_categories c ON c.id = e.equipment_category_id
      WHERE e.status <> 'disposed' ORDER BY e.code ASC`);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("assets GET failed", error);
    return NextResponse.json({ error: "ไม่สามารถโหลดรายการครุภัณฑ์ได้" }, { status: 500 });
  }
}
