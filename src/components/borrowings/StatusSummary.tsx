import type { BorrowingSummary } from "@/lib/borrowing-types";
import styles from "@/app/borrowings/borrowings.module.css";

export function StatusSummary({ summary }: { summary?: BorrowingSummary }) {
  const cards = [
    {
      title: "กำลังถูกยืม",
      count: summary?.borrowed ?? 0,
      note: "รายการที่อยู่ระหว่างยืม",
      tone: "blue",
      icon: "↔",
    },
    {
      title: "เลยกำหนดคืน",
      count: summary?.overdue ?? 0,
      note: "ควรติดตามโดยเร็ว",
      tone: "danger",
      icon: "!",
    },
    {
      title: "รออนุมัติ",
      count: summary?.pending ?? 0,
      note: "คำขอที่รอการพิจารณา",
      tone: "purple",
      icon: "◷",
    },
    {
      title: "คืนแล้วทั้งหมด",
      count: summary?.returned ?? 0,
      note: "รายการที่คืนเรียบร้อย",
      tone: "green",
      icon: "✓",
    },
  ];
  return (
    <section className={styles.summary} aria-label="สรุปสถานะการยืมคืน">
      {cards.map(({ title, count, note, tone, icon }) => (
        <article
          className={`${styles.summaryCard} ${styles[tone]}`}
          key={title}
        >
          <div className={styles.summaryTop}>
            <span>{title}</span>
            <i aria-hidden="true">{icon}</i>
          </div>
          <strong>{Number(count).toLocaleString("th-TH")}</strong>
          <small>{note}</small>
        </article>
      ))}
    </section>
  );
}
