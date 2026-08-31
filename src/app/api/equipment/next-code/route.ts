import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET() {
  const user = await currentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });

  const [sequence] = await db.query(
    "SELECT next_number FROM equipment_code_sequences WHERE sequence_key = 'equipment'"
  ).catch(() => [[]]);
  const savedNext = (sequence as { next_number: number }[])[0]?.next_number;
  if (savedNext) return NextResponse.json({ code: `EQ-${String(savedNext).padStart(4, "0")}` });

  const [rows] = await db.query(
    "SELECT COALESCE(MAX(CAST(SUBSTRING(code, 4) AS UNSIGNED)), 0) + 1 AS next_number FROM equipment WHERE code REGEXP '^EQ-[0-9]+$'"
  );
  const nextNumber = Number((rows as { next_number: number }[])[0].next_number);
  return NextResponse.json({ code: `EQ-${String(nextNumber).padStart(4, "0")}` });
}
