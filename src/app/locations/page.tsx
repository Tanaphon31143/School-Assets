"use client";
import { FormEvent, useEffect, useState } from "react";

type I = Record<string, unknown>;

export default function Locations() {
    const [d, setD] = useState<I[]>([]);
    const load = () => fetch("/api/locations").then(r => r.json()).then(setD);
    useEffect(() => { load() }, []);
    async function add(e: FormEvent<HTMLFormElement>) {
        e.preventDefault(); await fetch("/api/locations",
            {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget)))
            }); e.currentTarget.reset(); load()
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
