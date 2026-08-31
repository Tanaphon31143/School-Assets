"use client";
import { FormEvent, useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

type I = Record<string, unknown>;

export default function Locations() {
    const [d, setD] = useState<I[]>([]);
    const load = () => fetch("/api/locations").then(r => r.json()).then(setD);
    useEffect(() => { load() }, []);
    async function add(e: FormEvent<HTMLFormElement>) {
        e.preventDefault(); const form = e.currentTarget; const confirmation = await Swal.fire({ icon: "question", title: "ยืนยันการเพิ่มสถานที่?", showCancelButton: true, confirmButtonText: "บันทึก", cancelButtonText: "ยกเลิก" }); if (!confirmation.isConfirmed) return; const response = await fetch("/api/locations",
            {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Object.fromEntries(new FormData(form)))
            }); if (!response.ok) { await Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ" }); return; } form.reset(); load(); await Swal.fire({ icon: "success", title: "เพิ่มสถานที่แล้ว", timer: 1200, showConfirmButton: false });
    }
    return <main className="content">
        <header>
            <h1>สถานที่จัดเก็บ</h1>
            <a className="primary" href="/">กลับ Dashboard</a>
        </header>
        <form className="card" onSubmit={add}>
            <input name="name" placeholder="ชื่อสถานที่" required />
            <input name="building" placeholder="อาคาร" />
            <input name="floor" placeholder="ชั้น" />
            <button className="primary">เพิ่มสถานที่</button>
            <button type="reset" className="secondary-button">ยกเลิก</button>
        </form>
        <div className="card table">{d.map(x => <div className="row" key={String(x.id)}>
            <div className="row-main">
                <b>{String(x.name)}</b>
                <small>{String(x.building ?? "")} ชั้น {String(x.floor ?? "")}
                </small>
            </div>
        </div>)}
        </div>
    </main>
}
