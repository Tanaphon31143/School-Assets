import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  try {
    const [[equipment], [available], [borrowings], [maintenance], [value]] = await Promise.all([
      db.query("SELECT COUNT(*) AS total FROM equipment WHERE status <> 'disposed'"),
      db.query("SELECT COUNT(*) AS total FROM equipment WHERE status = 'available'"),
      db.query("SELECT COUNT(*) AS total FROM equipment_borrowings WHERE status IN ('borrowed','approved')"),
      db.query("SELECT COUNT(*) AS total FROM equipment WHERE status = 'maintenance'"),
      db.query("SELECT COALESCE(SUM(purchase_price * quantity), 0) AS total FROM equipment WHERE status <> 'disposed'"),
    ]);
    let recent: unknown[] = [];
    try {
      const [recentRows] = await db.query("SELECT b.id, e.name AS equipment_name, u.name AS borrower_name, b.borrow_date, b.status FROM equipment_borrowings b JOIN equipment e ON e.id=b.equipment_id JOIN users u ON u.id=b.user_id ORDER BY b.created_at DESC LIMIT 5");
      recent = recentRows as unknown[];
    } catch (error) {
      console.error("Dashboard recent borrowings query failed", error);
    }
    return NextResponse.json({
      stats: { equipment: Number((equipment as { total: number }[])[0]?.total ?? 0), available: Number((available as { total: number }[])[0]?.total ?? 0), borrowings: Number((borrowings as { total: number }[])[0]?.total ?? 0), maintenance: Number((maintenance as { total: number }[])[0]?.total ?? 0), value: Number((value as { total: number }[])[0]?.total ?? 0) },
      recent,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Dashboard database query failed", error);
    return NextResponse.json({ error: "ไม่สามารถอ่านข้อมูลจากฐานข้อมูลได้" }, { status: 500 });
  }
}
