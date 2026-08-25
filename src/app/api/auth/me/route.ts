import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ user: null }, { status: 401 });
  await db.query("UPDATE users SET status='active', updated_at=NOW() WHERE id=?", [user.id]);
  return NextResponse.json({ user });
}
