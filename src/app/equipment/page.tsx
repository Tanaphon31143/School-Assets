"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import { AddEquipmentModal } from "@/components/equipment/AddEquipmentModal";
import styles from "./equipment-filters.module.css";

type Item = Record<string, unknown>;
const statusLabels: Record<string, string> = {
  available: "พร้อมใช้งาน",
  borrowed: "กำลังถูกยืม",
  maintenance: "กำลังซ่อม",
  damaged: "ชำรุด",
  disposed: "จำหน่ายแล้ว",
};
const statusClass: Record<string, string> = {
  available: "success",
  borrowed: "info",
  maintenance: "warning",
  damaged: "warning",
  disposed: "warning",
};

function FilterDropdown({
  value,
  placeholder,
  options,
  onChange,
  ariaLabel,
}: {
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const uniqueOptions = Array.from(
    new Map(options.map((option) => [option.value, option])).values(),
  );
  const selected = uniqueOptions.find((option) => option.value === value);
  const menuId = `${ariaLabel.replace(/\s/g, "-")}-options`;

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className={styles.dropdown} ref={rootRef}>
      <button
        type="button"
        className={`${styles.trigger} ${open ? styles.triggerOpen : ""}`}
        onClick={() => setOpen((current) => !current)}
        role="combobox"
        aria-label={ariaLabel}
        aria-controls={menuId}
        aria-expanded={open}
      >
        <span>{selected?.label ?? placeholder}</span>
        <svg
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="m5 7.5 5 5 5-5" />
        </svg>
      </button>
      {open && (
        <div className={styles.menu} id={menuId} role="listbox">
          <button
            type="button"
            role="option"
            aria-selected={!value}
            className={`${styles.option} ${!value ? styles.active : ""}`}
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
          >
            {placeholder}
          </button>
          {uniqueOptions.map((option) => (
            <button
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`${styles.option} ${option.value === value ? styles.active : ""}`}
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Equipment() {
  const [data, setData] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Item[]>([]);
  const [locations, setLocations] = useState<Item[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [nextCode, setNextCode] = useState("");
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
    fetch("/api/categories")
      .then((r) => r.json())
      .then((x) => Array.isArray(x) && setCategories(x));
    fetch("/api/locations")
      .then((r) => r.json())
      .then((x) => Array.isArray(x) && setLocations(x));
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((x) => setRole(x.user?.role ?? ""));
  }, []);

  async function remove(id: unknown) {
    const choice = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "การลบรายการจะลบประวัติที่เกี่ยวข้องทั้งหมดและไม่สามารถยกเลิกได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบรายการ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc3545",
    });
    if (!choice.isConfirmed) return;
    try {
      const response = await fetch(`/api/equipment/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await Swal.fire({
          title: "ลบเรียบร้อย",
          icon: "success",
          timer: 1200,
          showConfirmButton: false,
        });
        load();
      } else {
        const result = await response.json().catch(() => ({}));
        await Swal.fire({
          icon: "error",
          title: "ลบไม่สำเร็จ",
          text: String(result.error ?? "เกิดข้อผิดพลาดในการลบรายการ"),
        });
      }
    } catch {
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์",
      });
    }
  }

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const confirmation = await Swal.fire({
      icon: "question",
      title: "ยืนยันการเพิ่มครุภัณฑ์?",
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
    });
    if (!confirmation.isConfirmed) return;
    const response = await fetch("/api/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    if (!response.ok) {
      const result = await response.json().catch(() => ({}));
      await Swal.fire({
        icon: "error",
        title: "เพิ่มครุภัณฑ์ไม่สำเร็จ",
        text: String(result.error ?? "กรุณาตรวจสอบข้อมูล"),
      });
      return;
    }
    setShowCreate(false);
    setNextCode("");
    await Swal.fire({
      icon: "success",
      title: "เพิ่มครุภัณฑ์แล้ว",
      timer: 1200,
      showConfirmButton: false,
    });
    load();
    fetch("/api/categories")
      .then((r) => r.json())
      .then((x) => Array.isArray(x) && setCategories(x));
    fetch("/api/locations")
      .then((r) => r.json())
      .then((x) => Array.isArray(x) && setLocations(x));
  }

  function openCreate() {
    setShowCreate(true);
    fetch("/api/equipment/next-code")
      .then((response) => response.json())
      .then((result) => setNextCode(String(result.code ?? "")));
  }

  const isAdmin = role === "admin";
  const filteredData = data.filter(
    (item) =>
      (!filterCategory || String(item.category_name) === filterCategory) &&
      (!filterStatus || String(item.status) === filterStatus),
  );
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const pageData = filteredData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const count = (status: string) =>
    data.filter((item) => String(item.status) === status).length;

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
            <button
              className="primary"
              onClick={() => (showCreate ? setShowCreate(false) : openCreate())}
            >
              ＋ เพิ่มครุภัณฑ์
            </button>
          )}
          <button
            className="primary"
            onClick={() => (window.parent.location.href = "/")}
          >
            กลับ Dashboard
          </button>
        </div>
      </header>

      <section className="equipment-summary" aria-label="สรุปครุภัณฑ์">
        <article>
          <span>ทั้งหมด</span>
          <strong>{data.length}</strong>
          <small>รายการในระบบ</small>
        </article>
        <article className="available">
          <span>พร้อมใช้งาน</span>
          <strong>{count("available")}</strong>
          <small>พร้อมให้ยืม</small>
        </article>
        <article className="borrowed">
          <span>ถูกยืมอยู่</span>
          <strong>{count("borrowed")}</strong>
          <small>อยู่ระหว่างใช้งาน</small>
        </article>
        <article className="maintenance">
          <span>ซ่อมบำรุง</span>
          <strong>{count("maintenance")}</strong>
          <small>รอดำเนินการซ่อม</small>
        </article>
      </section>

      {false && showCreate && (
        <form className="card" onSubmit={create}>
          <h2>เพิ่มครุภัณฑ์</h2>
          <div className="form-grid">
            <input
              name="code"
              value={nextCode}
              placeholder="กำลังสร้างรหัส..."
              readOnly
              aria-label="รหัสครุภัณฑ์ที่ระบบกำหนด"
            />
            <input name="name" placeholder="ชื่อครุภัณฑ์" required />
            <select
              name="equipment_category_id"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              required
            >
              <option value="">เลือกประเภท</option>
              {categories.map((c) => (
                <option key={String(c.id)} value={String(c.id)}>
                  {String(c.name)}
                </option>
              ))}
              <option value="custom">เพิ่มเติม...</option>
            </select>
            {selectedCategory === "custom" && (
              <input
                name="custom_category"
                placeholder="ระบุประเภทเพิ่มเติม..."
                required
                autoFocus
              />
            )}
            <select
              name="equipment_location_id"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              <option value="">เลือกสถานที่ (ไม่ระบุ)</option>
              {locations.map((l) => (
                <option key={String(l.id)} value={String(l.id)}>
                  {String(l.name)}
                </option>
              ))}
              <option value="custom">เพิ่มเติม...</option>
            </select>
            {selectedLocation === "custom" && (
              <input
                name="custom_location"
                placeholder="ระบุสถานที่เพิ่มเติม..."
                required
                autoFocus
              />
            )}
            <input
              name="quantity"
              type="number"
              min="1"
              defaultValue="1"
              required
            />
            <input name="unit" defaultValue="ชิ้น" required />
            <select name="status" defaultValue="available">
              <option value="available">พร้อมใช้งาน</option>
              <option value="maintenance">กำลังซ่อม</option>
              <option value="damaged">ชำรุด</option>
            </select>
          </div>
          <div className="header-actions">
            <button className="primary">บันทึกครุภัณฑ์</button>
            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowCreate(false)}
            >
              ยกเลิก
            </button>
          </div>
        </form>
      )}

      <AddEquipmentModal
        isOpen={showCreate}
        onClose={() => {
          setShowCreate(false);
          setNextCode("");
        }}
        onSuccess={load}
        categories={categories.map((item) => ({
          id: String(item.id),
          name: String(item.name),
        }))}
        locations={locations.map((item) => ({
          id: String(item.id),
          name: String(item.name),
        }))}
        nextCode={nextCode}
      />

      <div className="card equipment-card">
        <div className="card-heading">
          <h2>รายการครุภัณฑ์ ({data.length} รายการ)</h2>
          <div className="equipment-filters">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && load()}
              placeholder="ค้นหาชื่อหรือรหัส"
            />
            <FilterDropdown
              ariaLabel="กรองตามประเภท"
              value={filterCategory}
              placeholder="ทุกประเภท"
              options={categories.map((category) => ({
                value: String(category.name),
                label: String(category.name),
              }))}
              onChange={(value) => {
                setFilterCategory(value);
                setCurrentPage(1);
              }}
            />
            <FilterDropdown
              ariaLabel="กรองตามสถานะ"
              value={filterStatus}
              placeholder="ทุกสถานะ"
              options={[
                { value: "available", label: "พร้อมใช้งาน" },
                { value: "borrowed", label: "ถูกยืมอยู่" },
                { value: "maintenance", label: "ซ่อมบำรุง" },
              ]}
              onChange={(value) => {
                setFilterStatus(value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        <div className="equipment-table">
          <div className="equipment-head">
            <span>รหัส</span>
            <span>ชื่อครุภัณฑ์</span>
            <span>ประเภท</span>
            <span>สถานที่</span>
            <span>สถานะ</span>
            <span aria-label="การทำงาน" />
          </div>
          {pageData.map((x) => (
            <div className="equipment-row" key={String(x.id)}>
              <span>{String(x.code)}</span>
              <b>{String(x.name)}</b>
              <span>{String(x.category_name ?? "ไม่ระบุ")}</span>
              <span>{String(x.location_name ?? "ไม่ระบุ")}</span>
              <span>
                <em
                  className={`status ${statusClass[String(x.status)] ?? "info"}`}
                >
                  {statusLabels[String(x.status)] ?? String(x.status)}
                </em>
              </span>
              <span className="action-buttons">
                <a
                  className="detail-button equipment-icon-action"
                  href={`/scan/equipment/${x.id}`}
                  aria-label={`ดูรายละเอียด ${String(x.name)}`}
                  title="ดูรายละเอียด"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z" />
                    <circle cx="12" cy="12" r="2.5" />
                  </svg>
                </a>
                {isAdmin && (
                  <>
                    <a
                      className="detail-button edit-button equipment-icon-action"
                      href={`/equipment/${x.id}?edit=1`}
                      aria-label={`แก้ไข ${String(x.name)}`}
                      title="แก้ไข"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="m4 16.5-.8 4.3 4.3-.8L19.4 8.1l-3.5-3.5L4 16.5Z" />
                        <path d="m13.8 6.7 3.5 3.5" />
                      </svg>
                    </a>
                    <button
                      className="detail-button delete-button equipment-icon-action"
                      onClick={() => remove(x.id)}
                      aria-label={`ลบ ${String(x.name)}`}
                      title="ลบ"
                    >
                      <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 7h16M9 7V4h6v3m-9 0 1 13h10l1-13M10 11v5m4-5v5" />
                      </svg>
                    </button>
                  </>
                )}
              </span>
            </div>
          ))}
          {filteredData.length === 0 && (
            <div className="empty-state">ไม่พบข้อมูลครุภัณฑ์</div>
          )}
        </div>

        <div className="equipment-pagination">
          <span>
            แสดง {filteredData.length ? (currentPage - 1) * pageSize + 1 : 0}-
            {Math.min(currentPage * pageSize, filteredData.length)} จาก{" "}
            {filteredData.length} รายการ
          </span>
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
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
              >
                ถัดไป ►
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
