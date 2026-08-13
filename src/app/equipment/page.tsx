"use client";
import { FormEvent, useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

type Item = Record<string, unknown>;
const statusLabels: Record<string, string> = { available: "พร้อมใช้งาน", borrowed: "กำลังถูกยืม", maintenance: "กำลังซ่อม", damaged: "ชำรุด", disposed: "จำหน่ายแล้ว" };
const statusClass: Record<string, string> = { available: "success", borrowed: "info", maintenance: "warning", damaged: "warning", disposed: "warning" };

export default function Equipment() {
  const [data, setData] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const load = () => {
    fetch(`/api/equipment?search=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((x) => {
        if (Array.isArray(x)) setData(x);
        setCurrentPage(1);
      });
  };

  useEffect(() => {
    load();
    fetch("/api/categories").then((r) => r.json()).then((x) => Array.isArray(x) && setCategories(x));
    fetch("/api/locations").then((r) => r.json()).then((x) => Array.isArray(x) && setLocations(x));
    fetch("/api/auth/me").then((r) => r.json()).then((x) => setRole(x.user?.role ?? ""));
  }, []);

  async function remove(id: unknown) {
    const choice = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "การลบรายการจะลบประวัติที่เกี่ยวข้องทั้งหมดและไม่สามารถยกเลิกได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบรายการ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc3545"
    });
    if (!choice.isConfirmed) return;
    try {
      const response = await fetch(`/api/equipment/${id}`, { method: "DELETE" });
      if (response.ok) {
        await Swal.fire({ title: "ลบเรียบร้อย", icon: "success", timer: 1200, showConfirmButton: false });
        load();
      } else {
        const result = await response.json().catch(() => ({}));
        await Swal.fire({ icon: "error", title: "ลบไม่สำเร็จ", text: String(result.error ?? "เกิดข้อผิดพลาดในการลบรายการ") });
      }
    } catch {
      await Swal.fire({ icon: "error", title: "เกิดข้อผิดพลาด", text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์" });
    }
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      await Swal.fire({ icon: "error", title: "เพิ่มครุภัณฑ์ไม่สำเร็จ", text: String(result.error ?? "กรุณาตรวจสอบข้อมูล") });
      return;
    }
    setShowCreate(false);
    await Swal.fire({ icon: "success", title: "เพิ่มครุภัณฑ์แล้ว", timer: 1200, showConfirmButton: false });
    load();
    fetch("/api/categories").then((r) => r.json()).then((x) => Array.isArray(x) && setCategories(x));
    fetch("/api/locations").then((r) => r.json()).then((x) => Array.isArray(x) && setLocations(x));
  }

  const isAdmin = role === "admin";
  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const pageData = data.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <main className="content">
      <header>
        <div>
          <p className="eyebrow">รายละเอียดครุภัณฑ์</p>
          <h1>รายการครุภัณฑ์</h1>
          <p className="sub">ตรวจสอบรายละเอียดครุภัณฑ์ในระบบ</p>
        </div>
        <div className="header-actions">
          {isAdmin && (
            <button className="primary" onClick={() => setShowCreate(!showCreate)}>
              ＋ เพิ่มครุภัณฑ์
            </button>
          )}
          <button className="primary" onClick={() => (window.parent.location.href = "/")}>
            กลับ Dashboard
          </button>
        </div>
      </header>

      {showCreate && (
        <form className="card" onSubmit={create}>
          <h2>เพิ่มครุภัณฑ์</h2>
          <div className="form-grid">
            <input name="code" placeholder="รหัสครุภัณฑ์" required />
            <input name="name" placeholder="ชื่อครุภัณฑ์" required />
            <select name="equipment_category_id" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} required>
              <option value="">เลือกประเภท</option>
              {categories.map((c) => (
                <option key={String(c.id)} value={String(c.id)}>
                  {String(c.name)}
                </option>
              ))}
              <option value="custom">เพิ่มเติม...</option>
            </select>
            {selectedCategory === "custom" && <input name="custom_category" placeholder="ระบุประเภทเพิ่มเติม..." required autoFocus />}
            <select name="equipment_location_id" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
              <option value="">เลือกสถานที่ (ไม่ระบุ)</option>
              {locations.map((l) => (
                <option key={String(l.id)} value={String(l.id)}>
                  {String(l.name)}
                </option>
              ))}
              <option value="custom">เพิ่มเติม...</option>
            </select>
            {selectedLocation === "custom" && <input name="custom_location" placeholder="ระบุสถานที่เพิ่มเติม..." required autoFocus />}
            <input name="quantity" type="number" min="1" defaultValue="1" required />
            <input name="unit" defaultValue="ชิ้น" required />
            <select name="status" defaultValue="available">
              <option value="available">พร้อมใช้งาน</option>
              <option value="maintenance">กำลังซ่อม</option>
              <option value="damaged">ชำรุด</option>
            </select>
          </div>
          <button className="primary">บันทึกครุภัณฑ์</button>
        </form>
      )}

      <div className="card equipment-card">
        <div className="card-heading">
          <h2>รายการครุภัณฑ์ ({data.length} รายการ)</h2>
          <div className="header-actions">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              placeholder="ค้นหาชื่อหรือรหัส"
            />
            <button className="primary" onClick={load}>
              ค้นหา
            </button>
          </div>
        </div>

        <div className="equipment-table">
          <div className="equipment-head">
            <span>รหัส</span>
            <span>ชื่อครุภัณฑ์</span>
            <span>ประเภท</span>
            <span>สถานที่</span>
            <span>สถานะ</span>
            <span>รายละเอียด</span>
          </div>
          {pageData.map((x) => (
            <div className="equipment-row" key={String(x.id)}>
              <span>{String(x.code)}</span>
              <b>{String(x.name)}</b>
              <span>{String(x.category_name ?? "ไม่ระบุ")}</span>
              <span>{String(x.location_name ?? "ไม่ระบุ")}</span>
              <span>
                <em className={`status ${statusClass[String(x.status)] ?? "info"}`}>
                  {statusLabels[String(x.status)] ?? String(x.status)}
                </em>
              </span>
              <span className="action-buttons">
                <a className="detail-button" href={`/scan/equipment/${x.id}`}>
                  ดูรายละเอียด
                </a>
                {isAdmin && (
                  <>
                    <a className="detail-button edit-button" href={`/equipment/${x.id}?edit=1`}>
                      แก้ไข
                    </a>
                    <button className="detail-button delete-button" onClick={() => remove(x.id)}>
                      ลบ
                    </button>
                  </>
                )}
              </span>
            </div>
          ))}
          {data.length === 0 && (
            <div className="empty-state">ไม่พบข้อมูลครุภัณฑ์</div>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button
              className="page-button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            >
              ◄ ก่อนหน้า
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`page-button ${p === currentPage ? "current" : ""}`}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="page-button"
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            >
              ถัดไป ►
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
