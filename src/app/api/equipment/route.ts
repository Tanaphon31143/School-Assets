import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

const CODE_PREFIX = "EQ-";

async function reserveEquipmentCode() {
  const connection = await db.getConnection();

  try {
    // This persistent counter intentionally does not go backwards after a deletion.
    // The first insert initializes it from the largest existing EQ number.
    // DDL commits automatically in MySQL, so it must happen before the transaction.
    await connection.query(
      `CREATE TABLE IF NOT EXISTS equipment_code_sequences (
        sequence_key VARCHAR(50) PRIMARY KEY,
        next_number BIGINT UNSIGNED NOT NULL
      )`
    );
    await connection.beginTransaction();
    await connection.query(
      `INSERT INTO equipment_code_sequences (sequence_key, next_number)
       SELECT 'equipment', COALESCE(MAX(CAST(SUBSTRING(code, 4) AS UNSIGNED)), 0) + 2
       FROM equipment
       ON DUPLICATE KEY UPDATE next_number = next_number + 1`
    );
    const [rows] = await connection.query(
      "SELECT next_number FROM equipment_code_sequences WHERE sequence_key = 'equipment' FOR UPDATE"
    );
    const nextNumber = Number((rows as { next_number: number }[])[0].next_number) - 1;
    const code = `${CODE_PREFIX}${String(nextNumber).padStart(4, "0")}`;

    return { connection, code };
  } catch (error) {
    await connection.rollback();
    connection.release();
    throw error;
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url); const search = url.searchParams.get("search") ?? ""; const status = url.searchParams.get("status");
  const [rows] = await db.query("SELECT e.*, c.name AS category_name, l.name AS location_name FROM equipment e JOIN equipment_categories c ON c.id=e.equipment_category_id LEFT JOIN equipment_locations l ON l.id=e.equipment_location_id WHERE (e.name LIKE ? OR e.code LIKE ?) AND (? = '' OR e.status = ?) ORDER BY CAST(SUBSTRING(e.code, 4) AS UNSIGNED) ASC, e.code ASC", [`%${search}%`, `%${search}%`, status ?? "", status ?? ""]);
  return NextResponse.json(rows);
}
export async function POST(request: Request) {
  const user = await currentUser(); if (!user || user.role !== "admin") return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  const body = await request.json();

  let reservation: Awaited<ReturnType<typeof reserveEquipmentCode>> | undefined;
  try {
    reservation = await reserveEquipmentCode();
    const { connection, code } = reservation;

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
    const [result] = await connection.query("INSERT INTO equipment (code,name,equipment_category_id,equipment_location_id,brand,model,serial_number,purchase_date,purchase_price,quantity,unit,status,`condition`,notes,created_by,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,NOW(),NOW())", [code, body.name, categoryId, locationId, body.brand || null, body.model || null, body.serial_number || null, body.purchase_date || null, body.purchase_price || null, body.quantity ?? 1, body.unit ?? "ชิ้น", body.status ?? "available", body.condition ?? "good", body.notes || null, user.id]);
    await connection.commit();
    return NextResponse.json({ id: (result as { insertId: number }).insertId, code }, { status: 201 });
  } catch (error) {
    if (reservation) await reservation.connection.rollback();
    console.error("Failed to create equipment", error);
    return NextResponse.json({ error: "ไม่สามารถสร้างรหัสครุภัณฑ์ได้" }, { status: 500 });
  } finally {
    reservation?.connection.release();
  }
}
