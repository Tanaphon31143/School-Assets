"use client";
import { useEffect, useMemo, useState } from "react";
import Swal from "sweetalert2";
import styles from "./notifications.module.css";
import {
  NotificationItem,
  type AppNotification,
} from "@/components/notifications/NotificationItem";
import { NotificationEmptyState } from "@/components/notifications/NotificationEmptyState";
import { NotificationSettingsModal } from "@/components/notifications/NotificationSettingsModal";
type ApiNotice = {
  id: string;
  type: string;
  data: { message?: string; href?: string };
  read_at: string | null;
  created_at: string;
};
function mapNotice(x: ApiNotice): AppNotification {
  const maintenance = x.type === "maintenance_report";
  return {
    id: x.id,
    category: maintenance ? "maintenance" : "borrowing",
    tone: maintenance ? "pending" : "info",
    title: maintenance ? "มีรายการแจ้งซ่อมใหม่" : "มีคำขอยืมครุภัณฑ์ใหม่",
    detail: x.data?.message ?? "มีรายการใหม่ในระบบ",
    href: x.data?.href ?? (maintenance ? "/maintenance" : "/borrowings"),
    created_at: x.created_at,
    read_at: x.read_at,
  };
}
export default function NotificationsPage() {
  const [items, setItems] = useState<AppNotification[]>([]),
    [tab, setTab] = useState("all"),
    [type, setType] = useState("all"),
    [selected, setSelected] = useState<string[]>([]),
    [settingsOpen, setSettingsOpen] = useState(false),
    [settings, setSettings] = useState<
      Record<AppNotification["category"], boolean>
    >({
      borrowing: true,
      maintenance: true,
      asset: true,
      user: true,
    });
  useEffect(() => {
    fetch("/api/notifications", { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data: unknown) =>
        setItems(Array.isArray(data) ? data.map(mapNotice) : []),
      )
      .catch(() => setItems([]));
  }, []);
  const unread = items.filter((x) => !x.read_at).length,
    shown = useMemo(
      () =>
        items.filter(
          (x) =>
            (tab === "all" || tab === "unread" ? !x.read_at : !!x.read_at) &&
            (type === "all" || x.category === type) &&
            settings[x.category],
        ),
      [items, tab, type, settings],
    );
  const read = (ids: string[]) =>
    setItems((xs) =>
      xs.map((x) =>
        ids.includes(x.id) ? { ...x, read_at: new Date().toISOString() } : x,
      ),
    );
  const del = (ids: string[]) => {
    setItems((xs) => xs.filter((x) => !ids.includes(x.id)));
    setSelected([]);
  };
  async function confirmDelete(ids: string[]) {
    const answer = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบหรือไม่?",
      text:
        ids.length > 1
          ? `รายการแจ้งเตือน ${ids.length} รายการจะถูกลบ`
          : "รายการแจ้งเตือนนี้จะถูกลบ",
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#dc2626",
      reverseButtons: true,
    });
    if (answer.isConfirmed) {
      del(ids);
      await Swal.fire({
        icon: "success",
        title: "ลบรายการแล้ว",
        timer: 1200,
        showConfirmButton: false,
      });
    }
  }
  const open = (item: AppNotification) => {
    read([item.id]);
    window.parent.postMessage(
      { type: "school-assets:navigate", href: item.href },
      window.location.origin,
    );
  };
  return (
    <main className={`content ${styles.page}`}>
      <header className={styles.header}>
        <div>
          <p className="eyebrow">ศูนย์การแจ้งเตือน</p>
          <h1>การแจ้งเตือน</h1>
          <p className="sub">ติดตามเหตุการณ์สำคัญของครุภัณฑ์และระบบ</p>
        </div>
        <div>
          <button
            className={styles.settings}
            onClick={() => setSettingsOpen(true)}
            aria-label="ตั้งค่าการแจ้งเตือน"
          >
            ⚙
          </button>
          <button
            className="primary"
            onClick={() => read(items.map((x) => x.id))}
          >
            ทำเครื่องหมายอ่านทั้งหมด
          </button>
        </div>
      </header>
      <section className={styles.toolbar}>
        <div className={styles.tabs}>
          {[
            ["all", "ทั้งหมด"],
            ["unread", `ยังไม่อ่าน (${unread})`],
            ["read", "อ่านแล้ว"],
          ].map(([key, label]) => (
            <button
              key={key}
              className={tab === key ? styles.active : ""}
              onClick={() => setTab(key)}
            >
              {label}
            </button>
          ))}
        </div>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          aria-label="กรองประเภท"
        >
          <option value="all">ทุกประเภท</option>
          <option value="borrowing">ยืม-คืน</option>
          <option value="maintenance">แจ้งซ่อม</option>
          <option value="asset">ครุภัณฑ์</option>
          <option value="user">ผู้ใช้งาน</option>
        </select>
      </section>
      {selected.length > 0 && (
        <div className={styles.bulk}>
          <b>เลือกแล้ว {selected.length} รายการ</b>
          <button onClick={() => read(selected)}>ทำเครื่องหมายอ่าน</button>
          <button onClick={() => void confirmDelete(selected)}>
            ลบที่เลือก
          </button>
        </div>
      )}
      <section className={styles.list}>
        {shown.map((item) => (
          <NotificationItem
            key={item.id}
            item={item}
            selected={selected.includes(item.id)}
            onToggle={() =>
              setSelected((xs) =>
                xs.includes(item.id)
                  ? xs.filter((id) => id !== item.id)
                  : [...xs, item.id],
              )
            }
            onRead={() => read([item.id])}
            onDelete={() => void confirmDelete([item.id])}
            onOpen={() => open(item)}
          />
        ))}
      </section>
      {!shown.length && <NotificationEmptyState />}
      <NotificationSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        settings={settings}
        onChange={(key) =>
          setSettings((current) => {
            const category = key as AppNotification["category"];
            return { ...current, [category]: !current[category] };
          })
        }
      />
    </main>
  );
}
