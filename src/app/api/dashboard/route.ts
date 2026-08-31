import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  try {
    const [[equipmentStats], [borrowingStats], [recentRows]] = await Promise.all([
      db.query(`SELECT
        COALESCE(SUM(status <> 'disposed'), 0) AS equipment,
        COALESCE(SUM(status = 'available'), 0) AS available,
        COALESCE(SUM(status = 'maintenance'), 0) AS maintenance,
        COALESCE(SUM(CASE WHEN status <> 'disposed' THEN purchase_price * quantity ELSE 0 END), 0) AS value
        FROM equipment`),
      db.query("SELECT COALESCE(SUM(status IN ('borrowed', 'approved')), 0) AS borrowings FROM equipment_borrowings"),
      db.query("SELECT b.id, e.name AS equipment_name, u.name AS borrower_name, b.borrow_date, b.status FROM equipment_borrowings b JOIN equipment e ON e.id=b.equipment_id JOIN users u ON u.id=b.user_id ORDER BY b.created_at DESC LIMIT 5"),
    ]);
    const stats = (equipmentStats as { equipment: number; available: number; maintenance: number; value: number }[])[0];
    const borrowing = (borrowingStats as { borrowings: number }[])[0];
    return NextResponse.json({
      stats: { equipment: Number(stats?.equipment ?? 0), available: Number(stats?.available ?? 0), borrowings: Number(borrowing?.borrowings ?? 0), maintenance: Number(stats?.maintenance ?? 0), value: Number(stats?.value ?? 0) },
      recent: recentRows as unknown[],
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Dashboard database query failed", error);
    return NextResponse.json({ error: "ไม่สามารถอ่านข้อมูลจากฐานข้อมูลได้" }, { status: 500 });
  }
}
