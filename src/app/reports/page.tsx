"use client";
import { useEffect, useState } from "react";
type R = {
    summary: { items: number; quantity: number; value: number };
    byStatus: Record<string, unknown>[];
    byCategory: Record<string, unknown>[]
};
const status: Record<string, string> = {
    available: "พร้อมใช้งาน",
    borrowed: "กำลังถูกยืม",
    maintenance: "กำลังซ่อม",
    damaged: "ชำรุด",
    disposed: "จำหน่ายแล้ว"
};
export default function Reports() {
    const [d, setD] = useState<R>({
        summary: { items: 0, quantity: 0, value: 0 },
        byStatus: [],
        byCategory: []
    });
    useEffect(() => {
        fetch("/api/reports").then(r => r.json()).then(x => x.summary && setD(x))
    }, []);
    return <main className="content report-page">
        <header>
            <div>
                <p className="eyebrow">ผู้ดูแลระบบ</p>
                <h1>รายงานครุภัณฑ์</h1>
            </div>
            <button className="primary" onClick={() => window.parent.location.href = "/"}>กลับ Dashboard</button>
        </header>
        <div className="report-actions">
            <a className="export-excel" href="/api/reports/csv">Export Excel</a>
            <a className="export-pdf" href="/reports/print" target="_blank">Export PDF</a>
        </div>
        <div className="report-stats">
            <div className="card"><span>จำนวนรายการ</span><strong>{d.summary.items}</strong></div>
            <div className="card"><span>จำนวนชิ้นทั้งหมด</span><strong>{d.summary.quantity}</strong></div>
            <div className="card"><span>มูลค่ารวม</span><strong>{Number(d.summary.value).toLocaleString("th-TH", { minimumFractionDigits: 2 })}</strong></div>
        </div>
        <div className="report-grid">
            <div className="card">
                <h2>ตามสถานะ</h2>
                {d.byStatus.map((x, i) => <div className="report-row" key={i}>
                    <span>{status[String(x.status)] ?? String(x.status)}</span>
                    <b>{String(x.total)}</b>
                </div>)}
            </div>
            <div className="card">
                <h2>ตามประเภท</h2>
                {d.byCategory.map((x, i) => <div className="report-row" key={i}>
                    <span>{String(x.name)}</span>
                    <b>{String(x.total)}</b>
                </div>)}
            </div>
        </div>
    </main>
}
