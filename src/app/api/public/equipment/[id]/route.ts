import { NextResponse } from "next/server";
import { db } from "@/lib/db";

type Context = { params: Promise<{ id: string }> };

export async function GET(_: Request, { params }: Context) {
  const { id } = await params;
  await db.query("ALTER TABLE equipment ADD COLUMN IF NOT EXISTS image_url LONGTEXT NULL");
  const [rows] = await db.query("SELECT e.id,e.code,e.name,e.status,e.`condition`,e.brand,e.model,e.quantity,e.purchase_price,e.image_url,NULL AS warranty_expiry,c.name AS category,l.name AS location FROM equipment e JOIN equipment_categories c ON c.id=e.equipment_category_id LEFT JOIN equipment_locations l ON l.id=e.equipment_location_id WHERE e.id=?", [id]);
  const item = (rows as unknown[])[0];
  return NextResponse.json(item ?? { error: "ไม่พบครุภัณฑ์" }, { status: item ? 200 : 404 });
}
