"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { Toaster, toast } from "sonner";
import styles from "./maintenance.module.css";
import {
  repairStatusLabels,
  type RepairPriority,
  type RepairStatus,
} from "@/lib/repair-types";

type Asset = {
  id: number;
  code: string;
  name: string;
  category_name: string | null;
};
type Repair = {
  id: number;
  equipment_id: number;
  equipment_name: string;
  equipment_code: string;
  category_name: string | null;
  reporter_name: string;
  issue_description: string;
  priority: RepairPriority;
  status: RepairStatus;
  reported_date: string;
  created_at: string;
};
type Summary = { status: RepairStatus; total: number | string };
type RepairPayload = { summary: Summary[]; items: Repair[] };

const fetcher = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url, { cache: "no-store" });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? "ไม่สามารถโหลดข้อมูลได้");
  return body as T;
};

const priorityLabels: Record<RepairPriority, string> = {
  normal: "ทั่วไป",
  medium: "ปานกลาง",
  urgent: "เร่งด่วน",
};
const iconFor = (category?: string | null) =>
  /คอม|โน้ต|เครื่องพิมพ์|โปรเจกเตอร์|กล้อง/i.test(category ?? "")
    ? "▣"
    : /โต๊ะ|เก้าอี้/i.test(category ?? "")
      ? "▤"
      : "⚒";
const formatDate = (value: string) =>
  new Date(value).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

function StatusBadge({ status }: { status: RepairStatus }) {
  return (
    <span className={`${styles.badge} ${styles[`status${status}`]}`}>
      {repairStatusLabels[status]}
    </span>
  );
}

function CustomDropdown({
  name,
  value,
  placeholder,
  options,
  onChange,
  required = false,
}: {
  name: string;
  value: string;
  placeholder: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  required?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  return (
    <div className={styles.customSelect} ref={rootRef}>
      <input
        name={name}
        value={value}
        required={required}
        readOnly
        tabIndex={-1}
        aria-hidden="true"
      />
      <button
        type="button"
        className={`${styles.selectTrigger} ${open ? styles.selectTriggerOpen : ""}`}
        onClick={() => setOpen((current) => !current)}
        role="combobox"
        aria-controls={`${name}-options`}
        aria-expanded={open}
      >
        <span className={!selected ? styles.placeholder : undefined}>
          {selected?.label ?? placeholder}
        </span>
        <svg
          className={`${styles.chevron} ${open ? styles.chevronOpen : ""}`}
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path d="m5 7.5 5 5 5-5" />
        </svg>
      </button>
      {open && (
        <div
          id={`${name}-options`}
          className={styles.selectMenu}
          role="listbox"
        >
          {options.map((option) => (
            <button
              type="button"
              role="option"
              aria-selected={option.value === value}
              className={`${styles.selectOption} ${option.value === value ? styles.selectOptionActive : ""}`}
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

export default function MaintenancePage() {
  const { data, error, isLoading, mutate } = useSWR<RepairPayload>(
    "/api/repairs",
    fetcher,
    { revalidateOnFocus: true },
  );
  const { data: assets = [] } = useSWR<Asset[]>("/api/assets", fetcher);
  const [role, setRole] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [equipmentId, setEquipmentId] = useState("");
  const [priority, setPriority] = useState<RepairPriority>("normal");

  useEffect(() => {
    void fetcher<{ user?: { role?: string } }>("/api/auth/me")
      .then((result) => setRole(result.user?.role ?? ""))
      .catch(() => setRole(""));
  }, []);
  const count = (status: RepairStatus) =>
    Number(data?.summary.find((item) => item.status === status)?.total ?? 0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    if (!String(payload.issue_description ?? "").trim()) {
      toast.error("กรุณาอธิบายอาการหรือปัญหา");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/repairs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "ส่งแจ้งซ่อมไม่สำเร็จ");
      form.reset();
      setEquipmentId("");
      setPriority("normal");
      toast.success("ส่งแจ้งซ่อมเรียบร้อยแล้ว");
      await mutate();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "ส่งแจ้งซ่อมไม่สำเร็จ",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function updateStatus(repair: Repair, status: RepairStatus) {
    if (status === repair.status) return;
    const previous = data;
    setUpdatingId(repair.id);
    await mutate(
      (current) =>
        current
          ? {
              ...current,
              items: current.items.map((item) =>
                item.id === repair.id ? { ...item, status } : item,
              ),
            }
          : current,
      false,
    );
    try {
      const response = await fetch(`/api/repairs/${repair.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error ?? "อัปเดตสถานะไม่สำเร็จ");
      toast.success("อัปเดตสถานะแล้ว");
      await mutate();
    } catch (error) {
      await mutate(previous, false);
      toast.error(
        error instanceof Error ? error.message : "อัปเดตสถานะไม่สำเร็จ",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <main className={`content ${styles.page}`}>
      <Toaster position="top-right" richColors />
      <header className={styles.header}>
        <div>
          <p className="eyebrow">การดูแลครุภัณฑ์</p>
          <h1>แจ้งซ่อมและบำรุงรักษา</h1>
          <p className="sub">แจ้งปัญหา ติดตาม และอัปเดตการซ่อมครุภัณฑ์</p>
        </div>
      </header>
      <section className={styles.summary} aria-label="สรุปสถานะการซ่อม">
        <article className={`${styles.summaryCard} ${styles.pending}`}>
          <span>รอดำเนินการ</span>
          <strong>{count("reported")}</strong>
          <small>รายการแจ้งซ่อมใหม่</small>
        </article>
        <article className={`${styles.summaryCard} ${styles.progress}`}>
          <span>กำลังซ่อม</span>
          <strong>{count("in_progress")}</strong>
          <small>รายการที่กำลังดำเนินการ</small>
        </article>
        <article className={`${styles.summaryCard} ${styles.done}`}>
          <span>ซ่อมเสร็จแล้ว</span>
          <strong>{count("completed")}</strong>
          <small>รายการที่ดำเนินการเสร็จ</small>
        </article>
      </section>
      <section className={`card ${styles.reportCard}`}>
        <div>
          <h2>แจ้งปัญหาใหม่</h2>
          <p className="sub">
            ระบุครุภัณฑ์ ระดับความเร่งด่วน และรายละเอียดปัญหา
          </p>
        </div>
        <form className={styles.form} onSubmit={submit}>
          <label>
            ครุภัณฑ์
            <CustomDropdown
              name="equipment_id"
              value={equipmentId}
              placeholder="เลือกครุภัณฑ์"
              required
              onChange={setEquipmentId}
              options={assets.map((asset) => ({
                value: String(asset.id),
                label: `${asset.code} — ${asset.name}`,
              }))}
            />
          </label>
          <label>
            ระดับความเร่งด่วน
            <CustomDropdown
              name="priority"
              value={priority}
              placeholder="เลือกระดับความเร่งด่วน"
              onChange={(value) => setPriority(value as RepairPriority)}
              options={(Object.keys(priorityLabels) as RepairPriority[]).map(
                (item) => ({ value: item, label: priorityLabels[item] }),
              )}
            />
          </label>
          <label className={styles.description}>
            อธิบายอาการหรือปัญหา
            <textarea
              name="issue_description"
              required
              placeholder="เช่น เครื่องพิมพ์ดึงกระดาษไม่เข้า"
            />
          </label>
          <button className="primary" disabled={submitting}>
            {submitting ? "กำลังส่ง..." : "ส่งแจ้งซ่อม"}
          </button>
        </form>
      </section>
      <section className={styles.recent}>
        <div className={styles.recentHeading}>
          <div>
            <h2>รายการแจ้งซ่อมล่าสุด</h2>
            <p className="sub">อัปเดตสถานะได้ทันทีโดยผู้ดูแลระบบ</p>
          </div>
          {role !== "admin" && (
            <span className={styles.readOnly}>ดูข้อมูลอย่างเดียว</span>
          )}
        </div>
        {isLoading && (
          <p className={styles.empty}>กำลังโหลดรายการแจ้งซ่อม...</p>
        )}
        {error && <p className={styles.error}>{error.message}</p>}
        {!isLoading && !error && !data?.items.length && (
          <p className={styles.empty}>ยังไม่มีรายการแจ้งซ่อม</p>
        )}
        <div className={styles.list}>
          {data?.items.map((repair) => (
            <article className={styles.repairCard} key={repair.id}>
              <div className={styles.icon} aria-hidden="true">
                {iconFor(repair.category_name)}
              </div>
              <div className={styles.repairInfo}>
                <div className={styles.titleLine}>
                  <h3>{repair.equipment_name}</h3>
                  <small>{repair.equipment_code}</small>
                </div>
                <p>{repair.issue_description}</p>
                <span>
                  ผู้แจ้ง {repair.reporter_name} ·{" "}
                  {formatDate(repair.reported_date || repair.created_at)} ·
                  ความเร่งด่วน: {priorityLabels[repair.priority] ?? "ทั่วไป"}
                </span>
              </div>
              <div className={styles.statusControl}>
                <StatusBadge status={repair.status} />
                {role === "admin" ? (
                  <select
                    aria-label={`เปลี่ยนสถานะ ${repair.equipment_name}`}
                    value={repair.status}
                    disabled={updatingId === repair.id}
                    onChange={(event) =>
                      void updateStatus(
                        repair,
                        event.target.value as RepairStatus,
                      )
                    }
                  >
                    {(Object.keys(repairStatusLabels) as RepairStatus[]).map(
                      (status) => (
                        <option key={status} value={status}>
                          {repairStatusLabels[status]}
                        </option>
                      ),
                    )}
                  </select>
                ) : (
                  <span className={styles.readOnly}>ผู้ดูแลระบบเท่านั้น</span>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
