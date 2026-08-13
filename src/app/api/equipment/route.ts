import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

export async function GET(request: Request) {
  const url = new URL(request.url); const search = url.searchParams.get("search") ?? ""; const status = url.searchParams.get("status");
  const [rows] = await db.query("SELECT e.*, c.name AS category_name, l.name AS location_name FROM equipment e JOIN equipment_categories c ON c.id=e.equipment_category_id LEFT JOIN equipment_locations l ON l.id=e.equipment_location_id WHERE (e.name LIKE ? OR e.code LIKE ?) AND (? = '' OR e.status = ?) ORDER BY e.code ASC", [`%${search}%`, `%${search}%`, status ?? "", status ?? ""]);
  return NextResponse.json(rows);
}
export async function POST(request: Request) {
  const user = await currentUser(); if (!user || user.role !== "admin") return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  const body = await request.json();

  let categoryId = body.equipment_category_id;
  if ((body.equipment_category_id === "custom" || !categoryId) && body.custom_category && body.custom_category.trim()) {
    const customCatName = body.custom_category.trim();
    const [existingCat] = await db.query("SELECT id FROM equipment_categories WHERE name=?", [customCatName]);
    const foundCat = (existingCat as { id: number }[])[0];
    if (foundCat) {
      categoryId = foundCat.id;
    } else {
      const catCode = "CAT-" + Date.now().toString(36).toUpperCase();
      const [insertedCat] = await db.query("INSERT INTO equipment_categories (name, code, created_at, updated_at) VALUES (?, ?, NOW(), NOW())", [customCatName, catCode]);
      categoryId = (insertedCat as { insertId: number }).insertId;
    }
  }

  let locationId = body.equipment_location_id || null;
  if ((body.equipment_location_id === "custom" || !locationId) && body.custom_location && body.custom_location.trim()) {
    const customName = body.custom_location.trim();
    const [existing] = await db.query("SELECT id FROM equipment_locations WHERE name=?", [customName]);
    const found = (existing as { id: number }[])[0];
    if (found) {
      locationId = found.id;
    } else {
      const [inserted] = await db.query("INSERT INTO equipment_locations (name, created_at, updated_at) VALUES (?, NOW(), NOW())", [customName]);
      locationId = (inserted as { insertId: number }).insertId;
    }
  } else if (body.equipment_location_id === "custom") {
    locationId = null;
  }
  const [result] = await db.query("INSERT INTO equipment (code,name,equipment_category_id,equipment_location_id,brand,model,serial_number,purchase_date,purchase_price,quantity,unit,status,`condition`,notes,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())", [body.code, body.name, categoryId, locationId, body.brand || null, body.model || null, body.serial_number || null, body.purchase_date || null, body.purchase_price || null, body.quantity ?? 1, body.unit ?? "ชิ้น", body.status ?? "available", body.condition ?? "good", body.notes || null, user.id]);
  return NextResponse.json({ id: (result as { insertId: number }).insertId }, { status: 201 });
}
