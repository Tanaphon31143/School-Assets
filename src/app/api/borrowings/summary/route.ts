import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET() {
  const user = await currentUser(); if (!user) return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  const [rows] = await db.query("SELECT COALESCE(SUM(status IN ('approved','borrowed')),0) borrowed,COALESCE(SUM(status IN ('approved','borrowed') AND DATE(expected_return_date)<CURDATE()),0) overdue,COALESCE(SUM(status='pending'),0) pending,COALESCE(SUM(status='returned'),0) returned FROM equipment_borrowings WHERE user_id=? OR ? IN ('admin','teacher')", [user.id, user.role]);
  return NextResponse.json((rows as unknown[])[0] ?? { borrowed: 0, overdue: 0, pending: 0, returned: 0 });
}
