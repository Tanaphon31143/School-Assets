"use client"; import { FormEvent, useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css"; type I = Record<string, unknown>;
export default function Categories() {
    const [d, setD] = useState<I[]>([]);
    const load = () => fetch("/api/categories").then(r => r.json()).then(x => Array.isArray(x) && setD(x));
    useEffect(() => { load() }, []);
    async function add(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const r = await fetch("/api/categories",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget)))
            });
        if (r.ok) {
            e.currentTarget.reset();
            load(); Swal.fire({ title: "เพิ่มหมวดหมู่แล้ว", icon: "success", timer: 1400, showConfirmButton: false })
        } else Swal.fire({ title: "เพิ่มไม่สำเร็จ", icon: "error" })
    }
    return <main className="content">
        <header>
            <div>
                <p className="eyebrow">ผู้ดูแลระบบ</p>
                <h1>หมวดหมู่ครุภัณฑ์</h1>
                <p className="sub">จัดกลุ่มประเภทครุภัณฑ์ให้ค้นหาและจัดการได้ง่าย</p>
            </div>
            <button className="primary" onClick={() => window.parent.location.href = "/"}>กลับ Dashboard</button>
        </header>
        <form className="card category-form" onSubmit={add}>
            <input name="name" placeholder="ชื่อหมวดหมู่" required />
            <input name="code" placeholder="รหัสหมวดหมู่" required />
            <input name="description" placeholder="รายละเอียด" />
            <button className="primary">เพิ่มหมวดหมู่</button>
        </form>
        <div className="card category-list">
            <div className="card-heading">
                <div>
                    <h2>รายการหมวดหมู่</h2>
                    <p>{d.length} รายการ</p>
                </div>
            </div>
            <div className="category-grid">
                {d.map(x => <div className="category-item" key={String(x.id)}><b>{String(x.name)}</b>
                    <small>{String(x.code)} · {String(x.description ?? "ไม่มีรายละเอียด")}</small>
                </div>)}
            </div>
        </div>
    </main>
}
