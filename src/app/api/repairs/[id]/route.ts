import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ensureRepairSchema, isRepairStatus } from "@/lib/repairs";

type Context = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Context) {
  try {
    const user = await currentUser();
    if (!user || user.role !== "admin") return NextResponse.json({ error: "เฉพาะผู้ดูแลระบบเท่านั้นที่เปลี่ยนสถานะได้" }, { status: 403 });
    const { id } = await params;
    const repairId = Number(id);
    const { status } = await request.json();
    if (!Number.isInteger(repairId) || repairId <= 0 || !isRepairStatus(status)) return NextResponse.json({ error: "สถานะหรือรหัสรายการไม่ถูกต้อง" }, { status: 422 });
    await ensureRepairSchema();
    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();
      const [rows] = await connection.query("SELECT status, equipment_id FROM equipment_maintenances WHERE id=? FOR UPDATE", [repairId]);
      const repair = (rows as { status: string; equipment_id: number }[])[0];
      if (!repair) {
        await connection.rollback();
        return NextResponse.json({ error: "ไม่พบรายการแจ้งซ่อม" }, { status: 404 });
      }
      if (repair.status !== status) {
        await connection.query("UPDATE equipment_maintenances SET status=?, repaired_date=IF(?='completed', CURDATE(), NULL), updated_at=NOW() WHERE id=?", [status, status, repairId]);
        await connection.query("INSERT INTO repair_logs (repair_id, user_id, old_status, new_status, created_at) VALUES (?, ?, ?, ?, NOW())", [repairId, user.id, repair.status, status]);
        const equipmentStatus = status === "completed" ? "available" : status === "cannot_repair" ? "damaged" : "maintenance";
        await connection.query("UPDATE equipment SET status=?, updated_at=NOW() WHERE id=?", [equipmentStatus, repair.equipment_id]);
      }
      await connection.commit();
      return NextResponse.json({ ok: true, status });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("repairs PATCH failed", error);
    return NextResponse.json({ error: "อัปเดตสถานะไม่สำเร็จ กรุณาลองใหม่" }, { status: 500 });
  }
}
