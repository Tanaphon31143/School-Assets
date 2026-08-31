"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import styles from "./CreateBorrowRequestModal.module.css";

type Equipment = { id: number; code: string; name: string; status: string };
type Props = { isOpen: boolean; onClose: () => void; onSuccess: () => void };
type Errors = Partial<
  Record<
    "equipment" | "borrower" | "borrowDate" | "returnDate" | "purpose",
    string
  >
>;

export function CreateBorrowRequestModal({
  isOpen,
  onClose,
  onSuccess,
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const equipmentPickerRef = useRef<HTMLDivElement>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [saving, setSaving] = useState(false);
  const [equipmentOpen, setEquipmentOpen] = useState(false);
  const [equipmentId, setEquipmentId] = useState("");

  const close = () => {
    setErrors({});
    onClose();
  };
  useEffect(() => {
    if (!isOpen) return;
    void fetch("/api/equipment")
      .then((r) => r.json())
      .then((items) => setEquipment(Array.isArray(items) ? items : []));
    dialogRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen]);

  useEffect(() => {
    if (!equipmentOpen) return;
    const closePicker = (event: MouseEvent) => {
      if (!equipmentPickerRef.current?.contains(event.target as Node)) {
        setEquipmentOpen(false);
      }
    };
    document.addEventListener("mousedown", closePicker);
    return () => document.removeEventListener("mousedown", closePicker);
  }, [equipmentOpen]);
  if (!isOpen) return null;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const next: Errors = {};
    if (!data.equipment_id) next.equipment = "กรุณาเลือกครุภัณฑ์";
    if (!String(data.borrower_name ?? "").trim())
      next.borrower = "กรุณาระบุชื่อผู้ยืม";
    if (!data.borrow_date) next.borrowDate = "กรุณาเลือกวันที่ยืม";
    if (!data.expected_return_date) next.returnDate = "กรุณาเลือกกำหนดคืน";
    if (
      data.borrow_date &&
      data.expected_return_date &&
      String(data.expected_return_date) <= String(data.borrow_date)
    )
      next.returnDate = "กำหนดคืนต้องอยู่หลังวันที่ยืม";
    if (!String(data.purpose ?? "").trim())
      next.purpose = "กรุณาระบุวัตถุประสงค์";
    setErrors(next);
    if (Object.keys(next).length) return;
    setSaving(true);
    try {
      const response = await fetch("/api/borrowings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error ?? "ส่งคำขอยืมไม่สำเร็จ");
      toast.success("ส่งคำขอยืมแล้ว");
      form.reset();
      onSuccess();
      close();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "ส่งคำขอยืมไม่สำเร็จ",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      style={overlay}
      onMouseDown={(e) => e.target === e.currentTarget && close()}
    >
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-borrow-title"
        style={dialog}
      >
        <header style={header}>
          <h2 id="create-borrow-title">สร้างคำขอยืม</h2>
          <button
            type="button"
            onClick={close}
            style={closeButton}
            aria-label="ปิด"
          >
            ×
          </button>
        </header>
        <form onSubmit={submit} style={formStyle}>
          <Field label="ครุภัณฑ์" error={errors.equipment}>
            <div ref={equipmentPickerRef} className={styles.picker}>
              <input type="hidden" name="equipment_id" value={equipmentId} />
              <button
                type="button"
                onClick={() => setEquipmentOpen((open) => !open)}
                className={`${styles.trigger} ${equipmentOpen ? styles.triggerOpen : ""}`}
                role="combobox"
                aria-expanded={equipmentOpen}
                aria-controls="equipment-options"
              >
                {equipment.find((item) => String(item.id) === equipmentId)
                  ? `${equipment.find((item) => String(item.id) === equipmentId)?.code} — ${equipment.find((item) => String(item.id) === equipmentId)?.name}`
                  : "เลือกครุภัณฑ์"}
                <svg
                  className={`${styles.chevron} ${equipmentOpen ? styles.chevronOpen : ""}`}
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="m5 7.5 5 5 5-5" />
                </svg>
              </button>
              {equipmentOpen && (
                <div
                  id="equipment-options"
                  className={styles.menu}
                  role="listbox"
                >
                  {equipment
                    .filter((item) => item.status === "available")
                    .map((item) => (
                      <button
                        type="button"
                        key={item.id}
                        role="option"
                        aria-selected={String(item.id) === equipmentId}
                        className={`${styles.option} ${String(item.id) === equipmentId ? styles.optionSelected : ""}`}
                        onClick={() => {
                          setEquipmentId(String(item.id));
                          setEquipmentOpen(false);
                          setErrors((current) => ({
                            ...current,
                            equipment: undefined,
                          }));
                        }}
                      >
                        {item.code} — {item.name}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </Field>
          <Field label="ผู้ยืม" error={errors.borrower}>
            <input name="borrower_name" placeholder="ชื่อผู้ยืม" />
          </Field>
          <div style={dates}>
            <Field label="วันที่ยืม" error={errors.borrowDate}>
              <input name="borrow_date" type="date" />
            </Field>
            <Field label="กำหนดคืน" error={errors.returnDate}>
              <input name="expected_return_date" type="date" />
            </Field>
          </div>
          <Field label="วัตถุประสงค์การยืม" error={errors.purpose}>
            <input name="purpose" placeholder="เช่น ใช้สอนวิชาคอมพิวเตอร์" />
          </Field>
          <footer style={footer}>
            <button type="submit" disabled={saving} style={primary}>
              {saving ? "กำลังส่ง..." : "ส่งคำขอ"}
            </button>
            <button type="button" onClick={close} style={secondary}>
              ยกเลิก
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label style={labelStyle}>
      <span>{label}</span>
      {children}
      {error && <small style={{ color: "#dc2626" }}>{error}</small>}
    </label>
  );
}
const overlay: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 90,
  background: "rgba(0,0,0,.45)",
  display: "grid",
  placeItems: "start center",
  padding: "52px 16px 16px",
};
const dialog: React.CSSProperties = {
  width: "min(460px,100%)",
  background: "#fff",
  borderRadius: 12,
  outline: "none",
  overflow: "hidden",
};
const header: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "18px 24px",
  borderBottom: "1px solid #e5e7eb",
};
const closeButton: React.CSSProperties = {
  border: 0,
  background: "transparent",
  fontSize: 26,
  cursor: "pointer",
  color: "#475569",
};
const formStyle: React.CSSProperties = {
  padding: "10px 24px 24px",
  display: "grid",
  gap: 12,
};
const dates: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
};
const labelStyle: React.CSSProperties = {
  display: "grid",
  gap: 6,
  fontSize: 12,
  color: "#475569",
  fontWeight: 600,
};
const footer: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 10,
  marginTop: 10,
};
const primary: React.CSSProperties = {
  height: 42,
  border: 0,
  borderRadius: 8,
  background: "#2563eb",
  color: "#fff",
  cursor: "pointer",
  fontWeight: 600,
};
const secondary: React.CSSProperties = {
  height: 42,
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  background: "#fff",
  color: "#475569",
  cursor: "pointer",
  fontWeight: 600,
};
