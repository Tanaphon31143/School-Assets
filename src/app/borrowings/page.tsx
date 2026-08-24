"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "./borrowings.module.css";

type Item = Record<string, unknown>;
const labels: Record<string, string> = { pending: "รออนุมัติ", approved: "อนุมัติแล้ว", borrowed: "กำลังยืม", returned: "คืนแล้ว", rejected: "ไม่อนุมัติ" };

export default function Borrowings() {
  const [data, setData] = useState<Item[]>([]), [equipment, setEquipment] = useState<Item[]>([]);
  const [role, setRole] = useState(""), [show, setShow] = useState(false), [filter, setFilter] = useState("all"), [message, setMessage] = useState("");
  const load = () => fetch("/api/borrowings", { cache: "no-store" }).then(r => r.json()).then(x => Array.isArray(x) && setData(x));
  useEffect(() => { load(); fetch("/api/equipment").then(r => r.json()).then(setEquipment); fetch("/api/auth/me").then(r => r.json()).then(x => setRole(x.user?.role ?? "")); }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const response = await fetch("/api/borrowings",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(event.currentTarget)))
      });
    setMessage(response.ok ? "ส่งคำขอยืมแล้ว" : "ไม่สามารถส่งคำขอได้");
    if (response.ok) { setShow(false); load(); }
  }
  async function action(id: unknown, actionName: string) {
    await fetch(`/api/borrowings/${id}`,
      { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: actionName }) });
    load();
  }
  const visible = data.filter(item => filter === "all" || item.status === filter);
  return <main className={styles.page}>
    <header className={styles.header}>
      <div>
        <p className={styles.eyebrow}>การใช้งานครุภัณฑ์</p>
        <h1>รายการยืม–คืน</h1>
        <p className={styles.subtitle}>ตรวจสอบสถานะคำขอยืมและการคืนครุภัณฑ์</p>
      </div>
      <div className={styles.headerActions}>
        <button className="primary" onClick={() => setShow(!show)}>＋ สร้างคำขอยืม</button>
        <a className="primary" href="/">กลับ Dashboard</a>
      </div>
    </header>
    {show && <form className={`card ${styles.form}`} onSubmit={submit}>
      <h2>สร้างคำขอยืม</h2>
      <div className={styles.formGrid}><div>
        <select name="equipment_id" required><option value="">เลือกครุภัณฑ์</option>
          {equipment
            .filter(x => x.status === "available")
            .map(x => <option key={String(x.id)} value={String(x.id)}>{String(x.code)} - {String(x.name)}
            </option>)}
        </select>
      </div><div>
          <input type="date" name="expected_return_date" required /></div>
        <div>
          <input name="purpose" placeholder="วัตถุประสงค์" required /></div>
      </div>
      <button className="primary">ส่งคำขอ</button>
      {message && <span className={styles.message}>{message}</span>}
    </form>}
    <section className={styles.section}>
      <div className={styles.sectionHeading}>
        <div>
          <h2>ติดตามรายการยืมครุภัณฑ์</h2>
          <p>ตรวจสอบสถานะคำขอและการคืนครุภัณฑ์</p>
        </div>
        <div className={styles.filters}>
          <select value={filter} onChange={e => setFilter(e.target.value)}>
            <option value="all">ทุกสถานะ</option>
            <option value="pending">รออนุมัติ</option>
            <option value="borrowed">กำลังยืม</option>
            <option value="returned">คืนแล้ว</option>
          </select>
          <button className="primary">กรอง</button>
        </div>
      </div>
      <div className={styles.table}>
        <div className={styles.tableHead}>
          <span>ครุภัณฑ์</span>
          <span>ผู้ยืม</span>
          <span>กำหนดคืน</span>
          <span>สถานะ</span>
          <span>ดำเนินการ</span></div>
        {visible.length ? visible.map(item => <div className={styles.tableRow} key={String(item.id)}>
          <div>
            <b>{String(item.equipment_name)}</b>
            <small>{String(item.equipment_code)}</small>
          </div>
          <span>{String(item.borrower_name)}</span>
          <span>{String(item.expected_return_date)}</span>
          <span>
            <em className={`${styles.status} ${item.status === "returned" ? styles.success : styles.warning}`}>
              {labels[String(item.status)] ?? String(item.status)}</em></span>
          <div className={styles.actions}>
            {role === "admin" && item.status === "pending" && <><button className={styles.approve} onClick={() => action(item.id, "approve")}>อนุมัติ</button>
              <button className={styles.reject} onClick={() => action(item.id, "reject")}>ปฏิเสธ</button></>}
            {["approved", "borrowed"].includes(String(item.status)) &&
              <button className={styles.returnButton} onClick={() => action(item.id, "return")}>คืนครุภัณฑ์</button>}
          </div>
        </div>) : <div className={styles.empty}>ยังไม่มีรายการยืม–คืน</div>}</div>
    </section>
  </main>;
}
