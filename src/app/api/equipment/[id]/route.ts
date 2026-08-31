import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";
type Context = { params: Promise<{ id: string }> };
export async function GET(_: Request, { params }: Context) {
  const { id } = await params;
  const [rows] = await db.query(
    "SELECT e.*, c.name AS category_name, l.name AS location_name FROM equipment e JOIN equipment_categories c ON c.id=e.equipment_category_id LEFT JOIN equipment_locations l ON l.id=e.equipment_location_id WHERE e.id=?",
    [id],
  );
  return NextResponse.json((rows as unknown[])[0] ?? null, {
    status: (rows as unknown[]).length ? 200 : 404,
  });
}
export async function PATCH(request: Request, { params }: Context) {
  const user = await currentUser();
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  const { id } = await params;
  try {
    const form = await request.formData();
    const b = Object.fromEntries(form) as Record<string, FormDataEntryValue>;
    const text = (value: FormDataEntryValue | undefined) =>
      typeof value === "string" ? value : "";
    const image = form.get("image");
    let imageUrl: string | undefined;
    if (image instanceof File && image.size > 0) {
      if (!new Set(["image/jpeg", "image/png", "image/webp"]).has(image.type))
        return NextResponse.json(
          { error: "รองรับเฉพาะไฟล์ JPG, PNG หรือ WEBP" },
          { status: 422 },
        );
      if (image.size > 5 * 1024 * 1024)
        return NextResponse.json(
          { error: "รูปภาพต้องมีขนาดไม่เกิน 5 MB" },
          { status: 422 },
        );
      imageUrl = `data:${image.type};base64,${Buffer.from(await image.arrayBuffer()).toString("base64")}`;
      await db.query(
        "ALTER TABLE equipment ADD COLUMN IF NOT EXISTS image_url LONGTEXT NULL",
      );
    }
    let categoryId: string | number = text(b.equipment_category_id);
    const customCategory = text(b.custom_category).trim();
    if (
      (b.equipment_category_id === "custom" || !categoryId) &&
      customCategory
    ) {
      const customCatName = customCategory;
      const [existingCat] = await db.query(
        "SELECT id FROM equipment_categories WHERE name=?",
        [customCatName],
      );
      const foundCat = (existingCat as { id: number }[])[0];
      if (foundCat) {
        categoryId = foundCat.id;
      } else {
        const catCode = "CAT-" + Date.now().toString(36).toUpperCase();
        const [insertedCat] = await db.query(
          "INSERT INTO equipment_categories (name, code, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
          [customCatName, catCode],
        );
        categoryId = (insertedCat as { insertId: number }).insertId;
      }
    }

    let locationId: string | number | null =
      text(b.equipment_location_id) || null;
    const customLocation = text(b.custom_location).trim();
    if (
      (b.equipment_location_id === "custom" || !locationId) &&
      customLocation
    ) {
      const customName = customLocation;
      const [existing] = await db.query(
        "SELECT id FROM equipment_locations WHERE name=?",
        [customName],
      );
      const found = (existing as { id: number }[])[0];
      if (found) {
        locationId = found.id;
      } else {
        const [inserted] = await db.query(
          "INSERT INTO equipment_locations (name, created_at, updated_at) VALUES (?, NOW(), NOW())",
          [customName],
        );
        locationId = (inserted as { insertId: number }).insertId;
      }
    } else if (b.equipment_location_id === "custom") {
      locationId = null;
    }

    await db.query(
      "UPDATE equipment SET name=?,equipment_category_id=?,equipment_location_id=?,brand=?,model=?,serial_number=?,purchase_date=?,purchase_price=?,quantity=?,unit=?,status=?,`condition`=?,notes=?,image_url=COALESCE(?, image_url),updated_at=NOW() WHERE id=?",
      [
        b.name,
        categoryId,
        locationId,
        b.brand || null,
        b.model || null,
        b.serial_number || null,
        b.purchase_date || null,
        b.purchase_price !== "" &&
        b.purchase_price !== undefined &&
        b.purchase_price !== null
          ? b.purchase_price
          : null,
        b.quantity ?? 1,
        b.unit ?? "ชิ้น",
        b.status ?? "available",
        b.condition ?? "good",
        b.notes || null,
        imageUrl ?? null,
        id,
      ],
    );
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || "บันทึกการแก้ไขไม่สำเร็จ" },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, { params }: Context) {
  const user = await currentUser();
  if (!user || user.role !== "admin")
    return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  const { id } = await params;
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();
    await connection.query(
      "DELETE FROM equipment_borrowings WHERE equipment_id=?",
      [id],
    );
    await connection.query(
      "DELETE FROM equipment_maintenances WHERE equipment_id=?",
      [id],
    );
    await connection.query(
      "DELETE FROM equipment_disposals WHERE equipment_id=?",
      [id],
    );
    await connection.query("DELETE FROM equipment WHERE id=?", [id]);
    await connection.commit();
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    await connection.rollback();
    const error = err as Error;
    return NextResponse.json(
      { error: error.message || "ลบรายการไม่สำเร็จ" },
      { status: 500 },
    );
  } finally {
    connection.release();
  }
}
