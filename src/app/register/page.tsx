"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import styles from "../login/login.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "สมัครใช้งานไม่สำเร็จ");
      router.push("/login?registered=1");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "สมัครใช้งานไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }

  return <main className={styles.page}>
    <div className={styles.logo}><span className={styles.logoMark}>SA</span><b>School Assets</b></div>
    <form className={styles.card} onSubmit={submit}>
      <p className={styles.kicker}>SCHOOL ASSETS</p>
      <h1>สร้างบัญชีผู้ใช้งาน</h1>
      <p className={styles.subtitle}>เริ่มต้นใช้งานระบบจัดการครุภัณฑ์</p>
      <label>ชื่อผู้ใช้งาน<input value={name} onChange={(event) => setName(event.target.value)} required autoFocus minLength={2} /></label>
      <label>อีเมล<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
      <label>รหัสผ่าน<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} /></label>
      <label>ยืนยันรหัสผ่าน<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} /></label>
      {error && <p className={styles.error}>{error}</p>}
      <button className={styles.submit} disabled={loading}>{loading ? "กำลังสมัครใช้งาน…" : "สมัครใช้งาน"}</button>
      <p className={styles.register}>มีบัญชีอยู่แล้ว? <Link href="/login" className={styles.link}>เข้าสู่ระบบ</Link></p>
    </form>
    <p className={styles.footer}>ระบบจัดการครุภัณฑ์โรงเรียน</p>
  </main>;
}
