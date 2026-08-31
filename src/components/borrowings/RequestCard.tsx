import type { Borrowing } from "@/lib/borrowing-types";
import { displayStatus, dueText, urgency } from "@/lib/borrowing-date";
import styles from "@/app/borrowings/borrowings.module.css";
import Swal from "sweetalert2";

export function RequestCard({ item, canManage, onAction, onDetail }: { item: Borrowing; canManage: boolean; onAction: (item: Borrowing, action: "approve" | "reject" | "return" | "remind") => void; onDetail: (item: Borrowing) => void }) {
  const level = urgency(item);
  const icon = ({ overdue: "!", pending: "◷", soon: "◴", normal: "□", returned: "✓" } as Record<string, string>)[level];
  const hasBorrowAction = ["approved", "borrowed"].includes(item.status);
  async function confirm(action: "approve" | "reject" | "return") { const label = action === "approve" ? "อนุมัติคำขอยืม" : action === "return" ? "รับคืนครุภัณฑ์" : "ปฏิเสธคำขอยืม"; const result = await Swal.fire({ icon: action === "reject" ? "warning" : "question", title: `ยืนยันการ${label}หรือไม่?`, showCancelButton: true, confirmButtonText: "ยืนยัน", cancelButtonText: "ยกเลิก", confirmButtonColor: action === "reject" ? "#dc2626" : "#2563eb", reverseButtons: true }); if (result.isConfirmed) onAction(item, action); }
  return <article className={`${styles.requestCard} ${styles[level]}`} id={`borrow-${item.id}`}>
    <div className={styles.timelineDot} aria-hidden="true">{icon}</div><div className={styles.requestBody}>
      <div className={styles.cardTop}><div><div className={styles.itemTitle}><h3>{item.equipment_name}</h3><span>{item.equipment_code}</span></div><p>ผู้ยืม: <b>{item.borrower_name}</b></p></div></div>
      <p className={`${styles.due} ${level === "overdue" ? styles.overdueText : ""}`}>{dueText(item)}</p>
    </div><span className={`${styles.badge} ${styles[`badge${level}`]} ${styles.cardStatus}`}>{level === "overdue" ? "เลยกำหนด" : displayStatus(item.status)}</span><div className={styles.cardActions}>
      {canManage && level === "overdue" && <button className={styles.remind} onClick={() => onAction(item, "remind")}>แจ้งเตือน</button>}
      {canManage && item.status === "pending" && <><button className={styles.approve} onClick={() => void confirm("approve")}>อนุมัติ</button><button className={styles.reject} onClick={() => void confirm("reject")}>ปฏิเสธ</button></>}
      {hasBorrowAction && (canManage || true) && <button className={styles.returnButton} onClick={() => void confirm("return")}>คืนครุภัณฑ์</button>}
      <button className={styles.detailButton} onClick={() => onDetail(item)}>ดูรายละเอียด</button>
    </div>
  </article>;
}
