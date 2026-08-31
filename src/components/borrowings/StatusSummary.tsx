import type { BorrowingSummary } from "@/lib/borrowing-types";
import styles from "@/app/borrowings/borrowings.module.css";

export function StatusSummary({ summary }: { summary?: BorrowingSummary }) {
  const cards = [
    ["กำลังถูกยืม", summary?.borrowed ?? 0, "รายการที่อยู่ระหว่างยืม", "blue"],
    ["เลยกำหนดคืน", summary?.overdue ?? 0, "ควรติดตามโดยเร็ว", "danger"],
    ["รออนุมัติ", summary?.pending ?? 0, "คำขอที่รอการพิจารณา", "purple"],
    ["คืนแล้วทั้งหมด", summary?.returned ?? 0, "รายการที่คืนเรียบร้อย", "green"],
  ];
  return <section className={styles.summary} aria-label="สรุปสถานะการยืมคืน">{cards.map(([title, count, note, tone]) => <article className={`${styles.summaryCard} ${styles[tone]}`} key={String(title)}><span>{title}</span><strong>{Number(count).toLocaleString("th-TH")}</strong><small>{note}</small></article>)}</section>;
}
