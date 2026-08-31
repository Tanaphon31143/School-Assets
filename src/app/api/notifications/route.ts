import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

type Notice = {
  id: string;
  type: string;
  data: { message: string; user?: string; href?: string };
  read_at: string | null;
  created_at: string;
};

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  const [borrowingRows, maintenanceRows] = await Promise.all([
    db.query("SELECT b.id,e.name AS equipment_name,u.name AS requester,b.created_at FROM equipment_borrowings b JOIN equipment e ON e.id=b.equipment_id JOIN users u ON u.id=b.user_id WHERE b.status='pending' AND (?='admin' OR b.user_id=?) ORDER BY b.created_at DESC LIMIT 10", [user.role, user.id]),
    db.query("SELECT m.id,e.name AS equipment_name,u.name AS reporter,m.created_at FROM equipment_maintenances m JOIN equipment e ON e.id=m.equipment_id JOIN users u ON u.id=m.reported_by WHERE m.status IN ('reported','in_progress') AND (?='admin' OR m.reported_by=?) ORDER BY m.created_at DESC LIMIT 10", [user.role, user.id]),
  ]);
  const notices: Notice[] = [
    ...(borrowingRows[0] as Array<{ id: number; equipment_name: string; requester: string; created_at: string }>).map((row) => ({
      id: `borrow-${row.id}`,
      type: "borrow_request",
      data: { message: `มีคำขอยืมครุภัณฑ์ใหม่: ${row.equipment_name}`, user: row.requester, href: `/borrowings#borrow-${row.id}` },
      read_at: null,
      created_at: row.created_at,
    })),
    ...(maintenanceRows[0] as Array<{ id: number; equipment_name: string; reporter: string; created_at: string }>).map((row) => ({
      id: `maintenance-${row.id}`,
      type: "maintenance_report",
      data: { message: `มีรายการแจ้งซ่อมใหม่: ${row.equipment_name}`, user: row.reporter, href: `/maintenance#maintenance-${row.id}` },
      read_at: null,
      created_at: row.created_at,
    })),
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return NextResponse.json(notices);
}

export async function PATCH() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  await db.query("UPDATE notifications SET read_at=NOW() WHERE notifiable_id=? AND notifiable_type LIKE '%User' AND read_at IS NULL", [user.id]);
  return NextResponse.json({ ok: true });
}
