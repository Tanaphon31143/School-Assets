"use client";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { MaintenanceStatusBadge, MaintenanceStatusSelect } from "@/components/MaintenanceStatus";

type Item = Record<string, unknown>;
const names: Record<string, string> = {
  "EQ-0001": "คอมพิวเตอร์ตั้งโต๊ะ", "EQ-0002": "โน้ตบุ๊ก", "EQ-0003": "เครื่องพิมพ์",
  "EQ-0004": "ลูกฟุตบอล", "EQ-0005": "โต๊ะเรียน", "EQ-0006": "เก้าอี้นักเรียน",
  "EQ-0007": "กล้องจุลทรรศน์", "EQ-0008": "ชุดทดลองไฟฟ้า", "EQ-0009": "โปรเจกเตอร์",
  "EQ-0010": "กระดานไวท์บอร์ด", "EQ-0011": "คอมพิวเตอร์ตั้งโต๊ะ", "EQ-0012": "โน้ตบุ๊ก",
  "EQ-0013": "เครื่องพิมพ์", "EQ-0014": "ลูกฟุตบอล", "EQ-0015": "โต๊ะเรียน",
  "EQ-0016": "เก้าอี้นักเรียน", "EQ-0017": "กล้องจุลทรรศน์", "EQ-0018": "ชุดทดลองไฟฟ้า",
  "EQ-0019": "โปรเจกเตอร์", "EQ-0020": "กระดานไวท์บอร์ด"
};

export default function Maintenance() {
  const [data, setData] = useState<Item[]>([]);
  const [equipment, setEquipment] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState("");
  const load = async () => {
    const response = await fetch("/api/maintenance", { cache: "no-store" });
    const result = await response.json();
    if (response.ok && Array.isArray(result)) setData(result);
  };
  useEffect(() => {
    fetch("/api/auth/me").then((r) => r.json()).then((x) => setRole(x.user?.role ?? ""));
    fetch("/api/equipment/repair", { method: "POST" }).finally(() => {
      load(); fetch("/api/equipment").then((r) => r.json()).then((x) => Array.isArray(x) && setEquipment(x));
    });
  }, []);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = event.currentTarget;
    setLoading(true);
    try {
      const response = await fetch("/api/maintenance",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(new FormData(form)))
        });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(String(result.error ?? "ส่งแจ้งซ่อมไม่สำเร็จ"));
      form.reset();
      await load();
      await Swal.fire({ icon: "success", title: "ส่งแจ้งซ่อมสำเร็จ", timer: 1400, showConfirmButton: false });
    }
    catch (error) {
      await Swal.fire({ icon: "error", title: "ส่งแจ้งซ่อมไม่สำเร็จ", text: error instanceof Error ? error.message : "กรุณาลองใหม่" });
    }
    finally {
      setLoading(false);
    }
  }
  async function update(event: React.FormEvent<HTMLFormElement>, id: unknown) {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch(`/api/maintenance/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (response.ok) {
      await load();
      await Swal.fire({ icon: "success", title: "บันทึกการอัปเดตแล้ว", timer: 1200, showConfirmButton: false });
    } else Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ" });
  }
  async function remove(id: unknown) {
    const result = await Swal.fire({
      title: "ลบรายการแจ้งซ่อม?",
      text: "ไม่สามารถกู้คืนรายการนี้ได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบรายการ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc3545"
    });
    if (!result.isConfirmed) return;
    try {
      const response = await fetch(`/api/maintenance/${id}`, { method: "DELETE" });
      if (response.ok) {
        await load();
        await Swal.fire({ icon: "success", title: "ลบรายการแล้ว", timer: 1200, showConfirmButton: false });
      } else {
        const resultData = await response.json().catch(() => ({}));
        await Swal.fire({ icon: "error", title: "ลบไม่สำเร็จ", text: String(resultData.error ?? "เกิดข้อผิดพลาดในการลบรายการ") });
      }
    } catch {
      await Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์" });
    }
  }
  return <main className="content maintenance-page">
    <header><div><p className="eyebrow">การดูแลครุภัณฑ์</p><h1>แจ้งซ่อมและบำรุงรักษา</h1>
      <p className="sub">แจ้งปัญหาและติดตามความคืบหน้าการซ่อมครุภัณฑ์</p></div></header>
    <section className="card maintenance-create"><h2>แจ้งปัญหาใหม่</h2>
      <form onSubmit={submit}><div className="maintenance-form">
        <select name="equipment_id" required>
          <option value="">เลือกครุภัณฑ์</option>{equipment.map((item) => <option key={String(item.id)} value={String(item.id)}>{String(item.code)} — {names[String(item.code)] ?? String(item.name)}</option>)}
        </select>
        <input name="issue_description" placeholder="อธิบายอาการหรือปัญหา" required />
        <button className="primary" disabled={loading}>{loading ? "กำลังบันทึก..." : "ส่งแจ้งซ่อม"}</button></div></form></section>
    <div className="maintenance-list">{data.map((item) => {
      const status = String(item.status);
      return <article className="card maintenance-item" key={String(item.id)}>
        <div className="maintenance-item-head"><div>
          <h2>{names[String(item.equipment_code)] ?? String(item.equipment_name)} <small>{String(item.equipment_code)}</small></h2>
          <p>{String(item.issue_description)}</p><small>ผู้แจ้ง {String(item.reporter_name ?? "ผู้ใช้งาน")} · {String(item.reported_date)}</small></div>
          <MaintenanceStatusBadge status={status} />
        </div>{role === "admin" && <form className="maintenance-update" onSubmit={(event) => update(event, item.id)}>
          <MaintenanceStatusSelect status={status} />
          <input name="repair_cost" defaultValue={item.repair_cost == null ? "" : String(item.repair_cost)} placeholder="ค่าใช้จ่าย" inputMode="decimal" />
          <input name="notes" defaultValue={String(item.notes ?? "")} placeholder="หมายเหตุ" />
          <div className="maintenance-actions">
            <button className="secondary-button">บันทึกการอัปเดต</button>
            <button type="button" className="delete-button" onClick={() => remove(item.id)}>ลบรายการ</button></div></form>}
      </article>;
    })}
    </div>
  </main>;
}
