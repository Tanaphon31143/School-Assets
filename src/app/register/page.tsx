"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
import styles from "../login/login.module.css";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<"teacher" | "student">("student");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      await Swal.fire({
        icon: "warning",
        title: "รหัสผ่านไม่ตรงกัน",
        text: "กรุณากรอกรหัสผ่านและยืนยันรหัสผ่านให้ตรงกัน",
        confirmButtonText: "แก้ไข",
        confirmButtonColor: "#2864e8",
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "สมัครใช้งานไม่สำเร็จ");
      await Swal.fire({
        icon: "success",
        title: "สมัครใช้งานเรียบร้อย",
        text: "บัญชีของคุณถูกสร้างแล้ว กรุณาเข้าสู่ระบบเพื่อเริ่มใช้งาน",
        confirmButtonText: "ไปหน้าเข้าสู่ระบบ",
        confirmButtonColor: "#2864e8",
        timer: 2500,
        timerProgressBar: true,
      });
      router.push("/login?registered=1");
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : "สมัครใช้งานไม่สำเร็จ";
      await Swal.fire({
        icon: "error",
        title: "สมัครใช้งานไม่สำเร็จ",
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
      <h1>สร้างบัญชีผู้ใช้งาน</h1>
      <p className={styles.subtitle}>เริ่มต้นใช้งานระบบจัดการครุภัณฑ์</p>
      <label>ชื่อผู้ใช้งาน<input value={name} onChange={(event) => setName(event.target.value)} required autoFocus minLength={2} /></label>
      <label>อีเมล<input type="email" value={email} onChange={(event) => setEmail(event.target.value.replaceAll(",", "."))} required /></label>
      <fieldset className={styles.roleField}>
        <legend>สมัครเป็น</legend>
        <div className={styles.roleOptions}>
          <label className={styles.roleOption}>
            <input type="radio" name="role" value="student" checked={role === "student"} onChange={() => setRole("student")} />
            นักเรียน
          </label>
          <label className={styles.roleOption}>
            <input type="radio" name="role" value="teacher" checked={role === "teacher"} onChange={() => setRole("teacher")} />
            ครู
          </label>
        </div>
      </fieldset>
      <label>รหัสผ่าน<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} /></label>
      <label>ยืนยันรหัสผ่าน<input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required minLength={8} /></label>
      <button className={styles.submit} disabled={loading}>{loading ? "กำลังสมัครใช้งาน…" : "สมัครใช้งาน"}</button>
      <p className={styles.register}>มีบัญชีอยู่แล้ว? <Link href="/login" className={styles.link}>เข้าสู่ระบบ</Link></p>
    </form>
    <p className={styles.footer}>ระบบจัดการครุภัณฑ์โรงเรียน</p>
  </main>;
}
