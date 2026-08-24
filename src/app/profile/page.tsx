"use client";
import { FormEvent, useEffect, useState } from "react";
export default function Profile() {
    const [d, setD] = useState<Record<string, string>>({});
    const [msg, setMsg] = useState("");
    useEffect(() => {
        fetch("/api/profile").then(r => r.json()).then(setD)
    }, []);
    async function save(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const r = await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.fromEntries(new FormData(e.currentTarget)))
        });
        setMsg(r.ok ? "บันทึกแล้ว" : "บันทึกไม่สำเร็จ")
    };
    return <main className="content">
        <header>
            <h1>Profile</h1>
            <a className="primary" href="/">กลับ Dashboard</a>
        </header>
        <form className="card" onSubmit={save}>
            <input name="name" defaultValue={d.name} placeholder="ชื่อ" required />
            <input name="email" type="email" defaultValue={d.email} placeholder="อีเมล" required />
            <input name="password" type="password" placeholder="รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)" />
            <button className="primary">บันทึก</button>
            {msg && <span className="sub"> {msg}</span>}
        </form>
    </main>
}
