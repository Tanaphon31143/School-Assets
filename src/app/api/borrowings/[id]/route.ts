import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
type C = { params: Promise<{ id: string }> };
export async function GET(_request: Request, { params }: C) {
    const u = await currentUser(); if (!u) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    const { id } = await params;
    const [rows] = await db.query("SELECT b.*,e.name AS equipment_name,e.code AS equipment_code,e.`condition`,l.name AS location_name,c.name AS category_name,usr.name AS borrower_name FROM equipment_borrowings b JOIN equipment e ON e.id=b.equipment_id JOIN users usr ON usr.id=b.user_id LEFT JOIN equipment_locations l ON l.id=e.equipment_location_id LEFT JOIN equipment_categories c ON c.id=e.equipment_category_id WHERE b.id=? AND (b.user_id=? OR ? IN ('admin','teacher'))", [id, u.id, u.role]);
    const item = (rows as unknown[])[0]; if (!item) return NextResponse.json({ error: "ไม่พบรายการยืม" }, { status: 404 }); return NextResponse.json(item);
}
export async function PATCH(request: Request, { params }: C) {
    const u = await currentUser(); if (!u)
        return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
    const { id } = await params;
    const { action, approval_notes } = await request.json();
    if (["approve", "reject"].includes(action) && u.role !== "admin")
        return NextResponse.json({ error: "ไม่มีสิทธิ์อนุมัติ" }, { status: 403 });
    if (action === "remind") return NextResponse.json({ ok: true, message: "บันทึกการแจ้งเตือนแล้ว" });
    const status = action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : action === 'return' ? 'returned' : null;
    if (!status) return NextResponse.json({ error: "action ไม่ถูกต้อง" }, { status: 422 });
    const sql = status === 'returned' ? "UPDATE equipment_borrowings SET status=?,actual_return_date=CURDATE(),updated_at=NOW() WHERE id=? AND (user_id=? OR ?='admin')" : "UPDATE equipment_borrowings SET status=?,approved_by=?,approval_notes=?,updated_at=NOW() WHERE id=?";
    const args = status === 'returned' ? [status, id, u.id, u.role] : [status, u.id, approval_notes || null, id];
    await db.query(sql, args);
    if (status === 'approved') await db.query("UPDATE equipment e JOIN equipment_borrowings b ON b.equipment_id=e.id SET e.status='borrowed' WHERE b.id=?", [id]);
    if (status === 'returned') await db.query("UPDATE equipment e JOIN equipment_borrowings b ON b.equipment_id=e.id SET e.status='available' WHERE b.id=?", [id]);
    return NextResponse.json({ ok: true });
}
