import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

type Activity = { id: string | number; log_name: string; description: string; causer_name: string; created_at: string };

export async function GET() {
  const user = await currentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  const result: Activity[] = [];
  const queries = [
    db.query("SELECT a.id,a.log_name,a.description,a.created_at,u.name AS causer_name FROM activity_log a LEFT JOIN users u ON u.id=a.causer_id ORDER BY a.created_at DESC LIMIT 200"),
    db.query("SELECT CONCAT('borrow-',b.id) AS id,'การยืมคืน' AS log_name,CONCAT('สร้างรายการยืม: ',e.name) AS description,b.created_at,u.name AS causer_name FROM equipment_borrowings b JOIN equipment e ON e.id=b.equipment_id JOIN users u ON u.id=b.user_id ORDER BY b.created_at DESC LIMIT 50"),
    db.query("SELECT CONCAT('repair-',m.id) AS id,'การแจ้งซ่อม' AS log_name,CONCAT('แจ้งซ่อม: ',e.name) AS description,m.created_at,u.name AS causer_name FROM equipment_maintenances m JOIN equipment e ON e.id=m.equipment_id JOIN users u ON u.id=m.reported_by ORDER BY m.created_at DESC LIMIT 50"),
    db.query("SELECT CONCAT('disposal-',d.id) AS id,'การตัดจำหน่าย' AS log_name,CONCAT('ตัดจำหน่าย: ',e.name) AS description,d.created_at,u.name AS causer_name FROM equipment_disposals d JOIN equipment e ON e.id=d.equipment_id LEFT JOIN users u ON u.id=d.approved_by ORDER BY d.created_at DESC LIMIT 50"),
  ];
  const responses = await Promise.allSettled(queries);
  for (const response of responses) if (response.status === "fulfilled") result.push(...(response.value[0] as Activity[]));
  result.sort((a, b) => new Date(String(b.created_at)).getTime() - new Date(String(a.created_at)).getTime());
  return NextResponse.json(result.slice(0, 200), { headers: { "Cache-Control": "no-store" } });
}
