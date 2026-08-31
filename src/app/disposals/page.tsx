"use client";
import { FormEvent, useEffect, useState } from "react";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";
type Item = Record<string, unknown>;

export default function Disposals() {
  const [data, setData] = useState<Item[]>([]);
  const [equipment, setEquipment] = useState<Item[]>([]);
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState("");
  const load = () => fetch("/api/disposals", { cache: "no-store" }).then((r) => r.json()).then((x) => Array.isArray(x) && setData(x));
  useEffect(() => {
    load();
    fetch("/api/equipment?status=available")
      .then((r) => r.json()).then((x) => Array
        .isArray(x) && setEquipment(x));
  }, []);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const confirmation = await Swal.fire({ icon: "warning", title: "ยืนยันการตัดจำหน่าย?", text: "สถานะครุภัณฑ์จะเปลี่ยนเป็นจำหน่ายแล้ว", showCancelButton: true, confirmButtonText: "ยืนยันบันทึก", cancelButtonText: "ยกเลิก" });
    if (!confirmation.isConfirmed) return;
    const response = await fetch("/api/disposals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(new FormData(form))) });
    setMessage(response.ok ? "บันทึกการตัดจำหน่ายแล้ว" : "บันทึกไม่สำเร็จ");
    if (response.ok) { form.reset(); setShow(false); load(); await Swal.fire({ icon: "success", title: "บันทึกการตัดจำหน่ายแล้ว", timer: 1400, showConfirmButton: false }); }
    else await Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ" });
  }
  return <main className="content">
    <header>
      <div>
        <h1>ตัดจำหน่ายครุภัณฑ์</h1>
        <p className="sub">บันทึกครุภัณฑ์ที่ขาย ทำลาย หรือบริจาค</p>
      </div>
      <div className="header-actions">
        <button className="primary" onClick={() => setShow(!show)}>＋ ตัดจำหน่าย</button>
        <a className="primary" href="/">กลับ Dashboard</a>
      </div>
    </header>
    {show && <form className="card" onSubmit={submit}><h2>รายการตัดจำหน่าย</h2>
      <div className="form-grid">
        <select name="equipment_id" required>
          <option value="">เลือกครุภัณฑ์</option>
          {equipment.filter((x) => x.status !== "disposed").map((x) => <option key={String(x.id)} value={String(x.id)}>{String(x.code)} — {String(x.name)}</option>)}
        </select>
        <input name="disposal_date" type="date" required />
        <select name="disposal_method" required>
          <option value="sold">ขาย</option>
          <option value="destroyed">ทำลาย</option>
          <option value="donated">บริจาค</option>
        </select>
        <input name="reason" placeholder="เหตุผล" required />
        <input name="notes" placeholder="หมายเหตุ" />
      </div>
      <button className="primary">บันทึก</button>{message && <span className="sub"> {message}</span>}
      <button type="button" className="secondary-button" onClick={() => setShow(false)}>ยกเลิก</button>
    </form>}
    <div className="card">
      <div className="table">{data.map((x) => <div className="row" key={String(x.id)}>
        <div className="item-icon">×</div>
        <div className="row-main">
          <b>{String(x.equipment_name)}</b>
          <small>{String(x.equipment_code)} · {String(x.reason)}
          </small>
        </div>
        <span className="status warning">{String(x.disposal_method)}</span>
        <small className="time">{String(x.disposal_date)}</small>
      </div>
      )}
      </div>
    </div>
  </main>
    ;
}
