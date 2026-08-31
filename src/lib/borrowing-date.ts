import type { Borrowing, BorrowingStatus } from "./borrowing-types";

const thaiDate = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" });
const dayMs = 86_400_000;

function atStart(value: string | Date) { const date = new Date(value); return new Date(date.getFullYear(), date.getMonth(), date.getDate()); }
export function formatThaiDate(value?: string | null) { return value ? thaiDate.format(atStart(value)) : "-"; }
export function daysUntil(value: string) { return Math.round((atStart(value).getTime() - atStart(new Date()).getTime()) / dayMs); }
export function isOverdue(item: Pick<Borrowing, "status" | "expected_return_date">) { return ["approved", "borrowed"].includes(item.status) && daysUntil(item.expected_return_date) < 0; }
export function dueText(item: Pick<Borrowing, "status" | "expected_return_date" | "actual_return_date">) {
  if (item.status === "returned") return `คืนแล้วเมื่อ ${formatThaiDate(item.actual_return_date)}`;
  const days = daysUntil(item.expected_return_date);
  if (["approved", "borrowed"].includes(item.status) && days < 0) return `เลยกำหนด ${Math.abs(days)} วัน`;
  if (["approved", "borrowed"].includes(item.status) && days <= 3) return `กำหนดคืน ${formatThaiDate(item.expected_return_date)} (อีก ${days} วัน)`;
  return `กำหนดคืน ${formatThaiDate(item.expected_return_date)}`;
}
export function displayStatus(status: BorrowingStatus) { return ({ pending: "รออนุมัติ", approved: "กำลังยืม", borrowed: "กำลังยืม", returned: "คืนแล้ว", rejected: "ไม่อนุมัติ" })[status]; }
export function urgency(item: Borrowing) { if (isOverdue(item)) return "overdue"; if (item.status === "pending") return "pending"; if (["approved", "borrowed"].includes(item.status) && daysUntil(item.expected_return_date) <= 3) return "soon"; if (item.status === "returned") return "returned"; return "normal"; }
