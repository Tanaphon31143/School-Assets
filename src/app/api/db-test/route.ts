import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query("SELECT 1 AS connected, DATABASE() AS database_name");
    return NextResponse.json({ ok: true, result: rows });
  } catch (error) {
    console.error("TiDB connection failed", error);
    return NextResponse.json({ ok: false, error: "เชื่อมต่อฐานข้อมูลไม่สำเร็จ" }, { status: 500 });
  }
}
