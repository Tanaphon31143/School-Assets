"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import styles from "./detail.module.css";
import qrStyles from "./qr.module.css";

type Item = Record<string, unknown>;
const status: Record<string, string> = { available: "พร้อมใช้งาน", borrowed: "กำลังถูกยืม", maintenance: "กำลังซ่อม", damaged: "ชำรุด", disposed: "จำหน่ายแล้ว" };

export default function PublicEquipment() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Item | null>(null);
  const [showQr, setShowQr] = useState(false);
  useEffect(() => {
    fetch("/api/auth/me")
      .then((response) => response.json())
      .then(({ user }) => {
        if (user?.role !== "admin") document.querySelector<HTMLAnchorElement>(`a[href="/equipment/${id}?edit=1"]`)?.remove();
      });
  }, [id, item]);
  useEffect(() => {
    fetch(`/api/public/equipment/${id}`, { cache: "no-store" })
      .then(async (response) => {
        const text = await response.text();
        if (!response.ok || !text.trim()) throw new Error("ไม่พบข้อมูลครุภัณฑ์");
        try { return JSON.parse(text) as Item; } catch { throw new Error("ข้อมูลครุภัณฑ์ไม่ถูกต้อง"); }
      })
      .then(setItem)
      .catch(() => setItem({ error: "ไม่สามารถโหลดข้อมูลครุภัณฑ์ได้" }));
  }, [id]);
  if (!item) return <main className={styles.page}><p>กำลังโหลดข้อมูล...</p></main>;
  if (item.error) return <main className={styles.page}><div className={styles.error}>{String(item.error)}</div></main>;
  return <main className={styles.page}>
    <header className={styles.heading}><h1>รายละเอียดครุภัณฑ์</h1></header>
    <section className={styles.card}>
      <div className={styles.hero}><div className={styles.image}><span>▣</span></div><div className={styles.title}><small>{String(item.code)}</small><h2>{String(item.name)}</h2><em className={styles.status}>{status[String(item.status)] ?? String(item.status)}</em></div></div>
      <div className={styles.details}><div><label>ประเภท</label><b>{String(item.category ?? "-")}</b></div><div><label>สถานที่</label><b>{String(item.location ?? "-")}</b></div><div><label>สภาพ</label><b>{String(item.condition ?? "-")}</b></div><div><label>จำนวน</label><b>{String(item.quantity ?? 1)} ชิ้น</b></div><div><label>ราคาซื้อ</label><b>{item.purchase_price == null ? "-" : Number(item.purchase_price).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</b></div><div><label>หมดประกัน</label><b>{String(item.warranty_expiry ?? "-")}</b></div></div>
      <div className={styles.actions}><button className={styles.secondary} onClick={() => setShowQr(!showQr)}>{showQr ? "ปิด QR Code" : "QR Code"}</button><a className={styles.primary} href={`/equipment/${String(item.id)}?edit=1`}>แก้ไขข้อมูล</a></div>
      {showQr && <div className={qrStyles.qrPanel}><h3>QR Code: {String(item.code)}</h3><img src={`/api/equipment/${String(item.id)}/qr`} alt={`QR Code ${String(item.code)}`} /><a className={qrStyles.download} href={`/api/equipment/${String(item.id)}/qr`} download={`equipment-${String(item.code)}.png`}>ดาวน์โหลด QR Code</a></div>}
    </section>
  </main>;
}
