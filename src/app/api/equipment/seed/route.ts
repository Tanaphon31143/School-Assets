import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { currentUser } from "@/lib/auth";

const seedItems = [
  { code: "EQ-0001", name: "คอมพิวเตอร์ตั้งโต๊ะ All-in-One", category: "คอมพิวเตอร์", location: "ห้อง Lab คอมพิวเตอร์", brand: "Lenovo", model: "IdeaCentre AIO 3", price: 21500, quantity: 10, unit: "เครื่อง", status: "available", condition: "good" },
  { code: "EQ-0002", name: "โน้ตบุ๊กประมวลผลสูง", category: "คอมพิวเตอร์", location: "ห้องวิชาการ", brand: "ASUS", model: "ExpertBook B1", price: 24900, quantity: 5, unit: "เครื่อง", status: "available", condition: "good" },
  { code: "EQ-0003", name: "เครื่องพิมพ์มัลติฟังก์ชัน Laser", category: "คอมพิวเตอร์", location: "ห้องธุรการ", brand: "HP", model: "LaserJet Pro MFP", price: 12800, quantity: 2, unit: "เครื่อง", status: "available", condition: "good" },
  { code: "EQ-0004", name: "โปรเจกเตอร์ 4K EPSON", category: "สื่อการสอน", location: "ห้องประชุมใหญ่", brand: "Epson", model: "EB-FH52", price: 32000, quantity: 2, unit: "เครื่อง", status: "available", condition: "good" },
  { code: "EQ-0005", name: "กระดานไวท์บอร์ดมีล้อเลื่อน", category: "สื่อการสอน", location: "อาคารเรียน 1", brand: "Whiteboard Pro", model: "WB-120x240", price: 4500, quantity: 6, unit: "ชุด", status: "available", condition: "good" },
  { code: "EQ-0006", name: "ชุดเครื่องเสียงและไมโครโฟนไร้สาย", category: "อุปกรณ์ไฟฟ้า", location: "หอประชุมโรงเรียน", brand: "TOA", model: "WA-1822", price: 18500, quantity: 2, unit: "ชุด", status: "available", condition: "good" },
  { code: "EQ-0007", name: "ตู้เก็บเอกสารเหล็ก 4 ลิ้นชัก", category: "เฟอร์นิเจอร์", location: "ห้องธุรการ", brand: "Lucky World", model: "K-4D", price: 5800, quantity: 4, unit: "ตู้", status: "available", condition: "good" },
  { code: "EQ-0008", name: "โต๊ะทำงานครูพร้อมเก้าอี้หมุน", category: "เฟอร์นิเจอร์", location: "ห้องพักครู", brand: "Index", model: "T-Teacher 120", price: 6200, quantity: 15, unit: "ชุด", status: "available", condition: "good" },
  { code: "EQ-0009", name: "ชุดโต๊ะเก้าอี้นักเรียนไม้สัก", category: "เฟอร์นิเจอร์", location: "ห้องเรียน ม.1/1", brand: "Siam Furniture", model: "STU-Wood-01", price: 2800, quantity: 40, unit: "ชุด", status: "available", condition: "good" },
  { code: "EQ-0010", name: "กล้องจุลทรรศน์เลนส์คู่", category: "อุปกรณ์วิทยาศาสตร์", location: "ห้องปฏิบัติการวิทยาศาสตร์", brand: "Olympus", model: "CX23", price: 16500, quantity: 12, unit: "เครื่อง", status: "available", condition: "good" },
  { code: "EQ-0011", name: "ชุดทดลองฟิสิกส์และวงจรไฟฟ้า", category: "อุปกรณ์วิทยาศาสตร์", location: "ห้องปฏิบัติการวิทยาศาสตร์", brand: "SciTech", model: "PHY-Kit-2024", price: 8900, quantity: 8, unit: "ชุด", status: "available", condition: "good" },
  { code: "EQ-0012", name: "หุ่นจำลองโครงร่างมนุษย์", category: "อุปกรณ์วิทยาศาสตร์", location: "ห้องหมวดชีววิทยา", brand: "3B Scientific", model: "A10 Skeleton", price: 14500, quantity: 2, unit: "ตัว", status: "available", condition: "good" },
  { code: "EQ-0013", name: "ลูกฟุตบอลหนังเย็บแข่งขัน", category: "อุปกรณ์กีฬา", location: "อาคารยิมเนเซียม", brand: "Molten", model: "F5A5000", price: 1850, quantity: 20, unit: "ลูก", status: "available", condition: "good" },
  { code: "EQ-0014", name: "แป้นบาสเกตบอลไฮดรอลิก", category: "อุปกรณ์กีฬา", location: "โดมเอนกประสงค์", brand: "Grand Sport", model: "BS-Hydraulic", price: 85000, quantity: 2, unit: "ชุด", status: "available", condition: "good" },
  { code: "EQ-0015", name: "โต๊ะเทเบิลเทนนิสพร้อมตาข่าย", category: "อุปกรณ์กีฬา", location: "อาคารยิมเนเซียม", brand: "Butterfly", model: "Centrefold 25", price: 26000, quantity: 3, unit: "ตัว", status: "available", condition: "good" },
  { code: "EQ-0016", name: "เปียโนไฟฟ้า 88 คีย์", category: "อุปกรณ์ดนตรี", location: "ห้องดนตรีสากล", brand: "Yamaha", model: "P-125", price: 28900, quantity: 2, unit: "เครื่อง", status: "available", condition: "good" },
  { code: "EQ-0017", name: "ชุดระนาดเอกและฆ้องวง", category: "อุปกรณ์ดนตรี", location: "ห้องดนตรีไทย", brand: "ช่างดนตรีไทยเอก", model: "Thai-Music-Set", price: 35000, quantity: 1, unit: "ชุด", status: "available", condition: "good" },
  { code: "EQ-0018", name: "กล้องถ่ายภาพ DSLR พร้อมเลนส์", category: "สื่อการสอน", location: "ห้องโสตทัศนศึกษา", brand: "Canon", model: "EOS 850D", price: 27900, quantity: 3, unit: "กล้อง", status: "available", condition: "good" },
  { code: "EQ-0019", name: "เครื่องขยายเสียงเคลื่อนย้ายได้ (ลำโพงลาก)", category: "อุปกรณ์ไฟฟ้า", location: "ห้องพัสดุ", brand: "Sherman", model: "APS-115", price: 7900, quantity: 4, unit: "เครื่อง", status: "available", condition: "good" },
  { code: "EQ-0020", name: "เครื่องสำรองไฟ UPS 1000VA", category: "อุปกรณ์ไฟฟ้า", location: "ห้อง Server Center", brand: "APC", model: "BX1000L-MS", price: 4200, quantity: 6, unit: "เครื่อง", status: "available", condition: "good" }
];

export async function POST() {
  const user = await currentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "ไม่มีสิทธิ์" }, { status: 403 });
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    await connection.query("DELETE FROM equipment_borrowings");
    await connection.query("DELETE FROM equipment_maintenances");
    await connection.query("DELETE FROM equipment_disposals");
    await connection.query("DELETE FROM equipment");

    const categoriesMap: Record<string, number> = {};
    for (const item of seedItems) {
      if (!categoriesMap[item.category]) {
        const catCode = "CAT-" + Date.now().toString(36).toUpperCase() + Math.floor(Math.random() * 100);
        await connection.query("INSERT INTO equipment_categories (name, code, created_at, updated_at) VALUES (?, ?, NOW(), NOW()) ON DUPLICATE KEY UPDATE name=name", [item.category, catCode]);
        const [rows] = await connection.query("SELECT id FROM equipment_categories WHERE name=?", [item.category]);
        categoriesMap[item.category] = (rows as { id: number }[])[0].id;
      }
    }

    const locationsMap: Record<string, number> = {};
    for (const item of seedItems) {
      if (!locationsMap[item.location]) {
        await connection.query("INSERT INTO equipment_locations (name, created_at, updated_at) VALUES (?, NOW(), NOW()) ON DUPLICATE KEY UPDATE name=name", [item.location]);
        const [rows] = await connection.query("SELECT id FROM equipment_locations WHERE name=?", [item.location]);
        locationsMap[item.location] = (rows as { id: number }[])[0].id;
      }
    }

    for (const item of seedItems) {
      const catId = categoriesMap[item.category];
      const locId = locationsMap[item.location];
      await connection.query(
        "INSERT INTO equipment (code, name, equipment_category_id, equipment_location_id, brand, model, purchase_price, quantity, unit, status, `condition`, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())",
        [item.code, item.name, catId, locId, item.brand, item.model, item.price, item.quantity, item.unit, item.status, item.condition]
      );
    }

    await connection.commit();
    return NextResponse.json({ ok: true, count: seedItems.length });
  } catch (err: unknown) {
    await connection.rollback();
    const error = err as Error;
    return NextResponse.json({ error: error.message || "สร้างรายการไม่สำเร็จ" }, { status: 500 });
  } finally {
    connection.release();
  }
}
