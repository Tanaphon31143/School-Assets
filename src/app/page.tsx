"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./topbar.module.css";

type Link = [string, string, string];
type Recent = { id: number; equipment_name: string; borrower_name: string; borrow_date: string; status: string };
const core: Link[] = [["ครุภัณฑ์", "/equipment", "▦"], ["ยืม–คืน", "/borrowings", "⇄"], ["แจ้งซ่อม", "/maintenance", "⚒"], ["แจ้งเตือน", "/notifications", "♢"]];
const admin: Link[] = [["รายละเอียดครุภัณฑ์", "/equipment", "▤"], ["ผู้ใช้งาน", "/users", "♟"], ["รายงาน", "/reports", "▥"], ["จำหน่ายครุภัณฑ์", "/disposals", "×"], ["ประวัติการใช้งาน", "/activity", "↻"]];

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState("/");
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<{ name?: string; role?: string }>();
  const [stats, setStats] = useState({ equipment: 0, available: 0, borrowings: 0, maintenance: 0 });
  const [recent, setRecent] = useState<Recent[]>([]);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me").then(async (response) => {
      if (!response.ok) { router.replace("/login"); return null; }
      return response.json();
    }).then((result) => {
      setUser(result?.user);
      fetch("/api/dashboard").then(async (response) => { const data = await response.json(); if (!response.ok) throw new Error(data.error ?? "โหลดข้อมูลไม่สำเร็จ"); return data; }).then((data) => { if (data.stats) setStats(data.stats); if (Array.isArray(data.recent)) setRecent(data.recent); }).catch((error) => setDashboardError(error instanceof Error ? error.message : "โหลดข้อมูลไม่สำเร็จ"));
    });
  }, [router]);

  useEffect(() => {
    if (view !== "/") return;
    fetch("/api/dashboard", { cache: "no-store" })
      .then((response) => response.json())
      .then((data) => {
        if (data.stats) setStats(data.stats);
        if (Array.isArray(data.recent)) setRecent(data.recent);
      });
  }, [view]);

  const isAdmin = user?.role === "admin";
  const roleLabel = user?.role === "admin" ? "ผู้ดูแลระบบ" : user?.role === "teacher" ? "ครู" : user?.role === "student" ? "นักเรียน" : "สมาชิก";
  const group = (title: string, items: Link[]) => <div className="nav-group"><small className="nav-group-title">{title}</small>{items.map(([label, href, icon]) => <button key={`${title}-${href}`} className={`nav-item ${view === href ? "active" : ""}`} onClick={() => setView(href)}><span>{icon}</span>{label}</button>)}</div>;
  const ready = stats.available;
  const logout = async () => { await fetch("/api/auth/logout", { method: "POST" }); router.replace("/login"); };
  const goBack = (event: React.SyntheticEvent<HTMLIFrameElement>) => event.currentTarget.contentDocument?.querySelectorAll<HTMLAnchorElement>('a[href="/"]').forEach((link) => link.addEventListener("click", (click) => { click.preventDefault(); window.parent.location.href = "/"; }));

  return <main className="shell">
    <aside className="sidebar"><div className="brand"><span className="brand-mark">SA</span><span>School <span className="muted">Assets</span></span></div><nav>{group("ภาพรวม", [["Dashboard", "/", "⌂"]])}{group("จัดการครุภัณฑ์", core)}{isAdmin && group("ผู้ดูแลระบบ", admin)}</nav><div className="sidebar-bottom"><div className={styles.bottomProfile}>{profileOpen && <div className={styles.profileMenu}><button onClick={() => { setProfileOpen(false); setView("/profile"); }}><span>👤</span> โปรไฟล์</button><button onClick={logout}><span>🚪</span> ออกจากระบบ</button></div>}<button className={styles.profileButton} onClick={() => setProfileOpen(!profileOpen)}><div className="avatar">{(user?.name ?? "ผู้").slice(0, 2)}</div><div className={styles.profileMeta}><b>{user?.name ?? "ผู้ใช้งาน"}</b><small>{roleLabel}</small></div><span className={styles.chevron}>{profileOpen ? "▲" : "▼"}</span></button></div></div></aside>
    <section className="content">{view !== "/" ? <iframe key={view} className="embedded-page" src={view} title="เนื้อหาระบบ" onLoad={goBack} /> : <><header><div><p className="eyebrow">ภาพรวมระบบ</p><h1>แดชบอร์ด</h1><p className="sub">สรุปข้อมูลครุภัณฑ์ล่าสุดจากฐานข้อมูลจริง</p></div><button className="primary" onClick={() => setView("/equipment")}>＋ เพิ่มครุภัณฑ์</button></header><h2 className="section-title">สรุปครุภัณฑ์ของโรงเรียน</h2><p className="sub section-sub">ติดตามสถานะครุภัณฑ์และรายการยืมคืนได้จากหน้านี้</p><div className="summary-grid">{[["ครุภัณฑ์ทั้งหมด", stats.equipment, "blue"], ["พร้อมใช้งาน", ready, "green"], ["กำลังถูกยืม", stats.borrowings, "orange"], ["อยู่ระหว่างซ่อม", stats.maintenance, "red"]].map(([label, value, color]) => <div className={`summary-card ${color}`} key={String(label)}><span>{label}</span><strong>{Number(value).toLocaleString()}</strong><i /></div>)}</div><div className="dashboard-grid"><div className="card status-panel"><h2>สถานะครุภัณฑ์</h2><p className="sub">ภาพรวมตามสถานะปัจจุบัน</p></div><div className="card shortcut-panel"><h2>เมนูลัด</h2>{core.slice(0, 3).map(([label, href]) => <button className="shortcut" key={href} onClick={() => setView(href)}>{label}<span>→</span></button>)}</div></div><div className="card recent-borrowings"><div className="recent-heading"><div><h2>รายการยืมล่าสุด</h2><p className="sub">รายการที่มีการดำเนินการล่าสุด</p></div><button className="more" onClick={() => setView("/borrowings")}>ดูทั้งหมด →</button></div><div className="recent-table"><div className="recent-head"><span>ครุภัณฑ์</span><span>ผู้ยืม</span><span>วันที่ยืม</span><span>สถานะ</span></div>{recent.length ? recent.map((item) => <div className="recent-row" key={item.id}><span>{item.equipment_name}</span><span>{item.borrower_name}</span><span>{new Date(item.borrow_date).toLocaleDateString("th-TH")}</span><span><em className="status info">{item.status}</em></span></div>) : <p className="sub recent-empty">ยังไม่มีรายการยืม</p>}</div></div></>}</section>
  </main>;
}
