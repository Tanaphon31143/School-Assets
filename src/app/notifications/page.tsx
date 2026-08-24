"use client";
import { useEffect, useState } from "react";
import styles from "./notifications.module.css";

type Notification = { id: string | number; type: string; data: unknown; read_at: string | null; created_at: string };
const typeNames: Record<string, string> = { borrow_request: "มีคำขอยืมครุภัณฑ์ใหม่", maintenance_report: "มีรายการแจ้งซ่อมใหม่", disposal: "มีรายการตัดจำหน่ายใหม่" };
function relative(date: string) {
  const days = Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  return days <= 0 ? "วันนี้" : `${days} วันที่แล้ว`;
}
function content(data: unknown) {
  if (typeof data === "string")
    return data; if (data && typeof data === "object")
    return Object.values(data as Record<string, unknown>).filter(Boolean).join(" · ");
  return "มีรายการใหม่ในระบบ";
}

export default function Notifications() {
  const [items, setItems] = useState<Notification[]>([]);
  const load = () => fetch("/api/notifications", { cache: "no-store" }).then((r) => r.json()).then((x) => Array.isArray(x) && setItems(x));
  useEffect(() => { load(); }, []);
  async function read(id?: string | number) {
    if (id == null) {
      setItems((current) => current.map((item) => ({ ...item, read_at: new Date().toISOString() })));
      await fetch("/api/notifications", { method: "PATCH" }); return;
    } if (String(id).includes("-")) {
      setItems((current) => current.map((item) => String(item.id) === String(id) ? { ...item, read_at: new Date().toISOString() } : item));
      return;
    }
    await fetch(`/api/notifications/${id}`, { method: "PATCH" });
    load();
  }
  return <main className="content">
    <header className={styles.heading}>
      <h1>การแจ้งเตือน</h1>
      <button className={styles.readAll} onClick={() => read()}>ทำเครื่องหมายอ่านทั้งหมด</button></header>
    <div className={styles.list}>
      {items.map((item) => <article className={`${styles.item} ${!item.read_at ? styles.unread : ""}`} key={item.id}>
        <div>
          <b>{typeNames[item.type] ?? item.type}</b>
          <small>{relative(item.created_at)}</small>
          <p>{content(item.data)}</p>
        </div>
        {item.read_at ? <span className={styles.read}>อ่านแล้ว</span> : <button className={styles.markRead} onClick={() => read(item.id)}>อ่านแล้ว</button>}
      </article>)}
      {!items.length && <p className={styles.empty}>ยังไม่มีการแจ้งเตือน</p>}
    </div>
  </main>;
}
