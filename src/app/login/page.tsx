"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import styles from "./login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "เข้าสู่ระบบไม่สำเร็จ");

      await Swal.fire({
        icon: "success",
        title: "เข้าสู่ระบบสำเร็จ",
        text: "กำลังนำคุณเข้าสู่ระบบจัดการครุภัณฑ์โรงเรียน",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#2864e8",
        timer: 2000,
        timerProgressBar: true,
      });

      router.push("/");
      router.refresh();
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "เข้าสู่ระบบไม่สำเร็จ";
      Swal.fire({
        icon: "error",
        title: "เข้าสู่ระบบไม่สำเร็จ",
        text: message,
        confirmButtonText: "ลองอีกครั้ง",
        confirmButtonColor: "#2864e8",
      });
    } finally {
      setLoading(false);
    }
  }

  return <main className={styles.page}>
    <div className={styles.logo}><span className={styles.logoMark}>SA</span><b>School Assets</b></div>
    <form className={styles.card} onSubmit={submit}>
      <p className={styles.kicker}>SCHOOL ASSETS</p>
      <h1>ยินดีต้อนรับกลับ</h1>
      <p className={styles.subtitle}>เข้าสู่ระบบจัดการครุภัณฑ์โรงเรียน</p>
      <label>อีเมล<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoFocus /></label>
      <label>รหัสผ่าน<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
      <div className={styles.options}><label className={styles.remember}><input type="checkbox" />จดจำการเข้าสู่ระบบ</label>
        <button type="button" className={styles.link}>ลืมรหัสผ่าน?</button></div>
      <button className={styles.submit} disabled={loading}>{loading ? "กำลังเข้าสู่ระบบ…" : "เข้าสู่ระบบ"}</button>
      <p className={styles.register}>ยังไม่มีบัญชี? <Link href="/register" className={styles.link}>สมัครใช้งาน</Link></p>
    </form>
  </main>;
}