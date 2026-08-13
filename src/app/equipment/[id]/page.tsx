"use client";
import { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import styles from "./edit.module.css";

type Item = Record<string, unknown>;

export default function EditEquipment() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [item, setItem] = useState<Item | null>(null);
  const [categories, setCategories] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then(({ user }) => {
        const allowed = user?.role === "admin";
        setIsAdmin(allowed);
        if (!allowed) {
          router.replace(`/scan/equipment/${id}`);
          return;
        }
        Promise.all([fetch(`/api/equipment/${id}`).then((r) => r.json()), fetch("/api/categories").then((r) => r.json()), fetch("/api/locations").then((r) => r.json())]).then(([equipment, categoryList, locationList]) => {
          setItem(equipment);
          if (equipment && equipment.equipment_category_id) setSelectedCategory(String(equipment.equipment_category_id));
          if (equipment && equipment.equipment_location_id) setSelectedLocation(String(equipment.equipment_location_id));
          if (Array.isArray(categoryList)) setCategories(categoryList);
          if (Array.isArray(locationList)) setLocations(locationList);
        });
      });
  }, [id, router]);

  if (isAdmin !== true) return <main className={styles.page} />;

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    const values = Object.fromEntries(new FormData(event.currentTarget)); delete values.image;
    const response = await fetch(`/api/equipment/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    setSaving(false);
    if (!response.ok) { const result = await response.json().catch(() => ({})); await Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ", text: String(result.error ?? "กรุณาตรวจสอบข้อมูลแล้วลองใหม่") }); return; }
    await Swal.fire({ icon: "success", title: "บันทึกการแก้ไขแล้ว", timer: 1400, showConfirmButton: false });
    router.push("/equipment");
  }

  if (!item) return <main className={styles.page}><p>กำลังโหลดข้อมูล...</p></main>;
  return <main className={styles.page}><header className={styles.heading}><h1>แก้ไขครุภัณฑ์</h1></header><form className={styles.card} onSubmit={save}>
    <div className={styles.grid}><label>รหัสครุภัณฑ์<input name="code" defaultValue={String(item.code ?? "")} required /></label><label>ชื่อครุภัณฑ์<input name="name" defaultValue={String(item.name ?? "")} required /></label>
      <label>ประเภท<select name="equipment_category_id" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required><option value="">เลือกประเภท</option>{categories.map((category) => <option key={String(category.id)} value={String(category.id)}>{String(category.name)}</option>)}<option value="custom">เพิ่มเติม...</option></select></label>
      {selectedCategory === "custom" && <label>ระบุประเภทเพิ่มเติม<input name="custom_category" placeholder="กรอกชื่อประเภท เช่น เครื่องดนตรี" required autoFocus /></label>}
      <label>สถานที่<select name="equipment_location_id" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}><option value="">ไม่ระบุ</option>{locations.map((location) => <option key={String(location.id)} value={String(location.id)}>{String(location.name)}</option>)}<option value="custom">เพิ่มเติม...</option></select></label>
      {selectedLocation === "custom" && <label>ระบุสถานที่เพิ่มเติม<input name="custom_location" placeholder="กรอกชื่อสถานที่ เช่น ห้อง 301, อาคาร 2" required autoFocus /></label>}
      <label>ยี่ห้อ<input name="brand" defaultValue={String(item.brand ?? "")} /></label><label>รุ่น<input name="model" defaultValue={String(item.model ?? "")} /></label><label>Serial Number<input name="serial_number" defaultValue={String(item.serial_number ?? "")} /></label><label>วันที่ซื้อ<input type="date" name="purchase_date" defaultValue={String(item.purchase_date ?? "").slice(0, 10)} /></label>
      <label>ราคาซื้อ<input type="number" step="0.01" name="purchase_price" defaultValue={String(item.purchase_price ?? "")} /></label><label>จำนวน<input type="number" min="1" name="quantity" defaultValue={String(item.quantity ?? 1)} /></label><label>หน่วย<input name="unit" defaultValue={String(item.unit ?? "ชิ้น")} /></label><label>สถานะ<select name="status" defaultValue={String(item.status ?? "available")}><option value="available">available</option><option value="borrowed">borrowed</option><option value="maintenance">maintenance</option><option value="damaged">damaged</option><option value="disposed">disposed</option></select></label>
      <label>สภาพ<select name="condition" defaultValue={String(item.condition ?? "good")}><option value="good">good</option><option value="fair">fair</option><option value="poor">poor</option></select></label><label>หมดประกัน<input type="date" name="warranty_expiry" defaultValue="" /></label>
    </div><label>รูปภาพ<input type="file" name="image" accept="image/*" /></label><label>หมายเหตุ<textarea name="notes" defaultValue={String(item.notes ?? "")} rows={3} /></label><button className={styles.submit} disabled={saving}>{saving ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}</button>
  </form></main>;
}
