"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import useSWR from "swr";
import { Toaster, toast } from "sonner";
import styles from "./borrowings.module.css";
import type { Borrowing, BorrowingSummary } from "@/lib/borrowing-types";
import { isOverdue, urgency } from "@/lib/borrowing-date";
import { StatusSummary } from "@/components/borrowings/StatusSummary";
import { RequestCard } from "@/components/borrowings/RequestCard";
import { DetailModal } from "@/components/borrowings/DetailModal";
import { DateInputThai } from "@/components/borrowings/DateInputThai";
import { AddBorrowRequestModal } from "@/components/borrowings/AddBorrowRequestModal";
import { CreateBorrowRequestModal } from "@/components/borrowings/CreateBorrowRequestModal";
type Equipment = { id: number; code: string; name: string; status: string };
const fetcher = async <T,>(url: string): Promise<T> => {
  const r = await fetch(url, { cache: "no-store" }),
    b = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(b.error ?? "ไม่สามารถโหลดข้อมูลได้");
  return b as T;
};
const rank = (i: Borrowing) =>
  ({ overdue: 0, pending: 1, soon: 2, normal: 3, returned: 4 })[urgency(i)] ??
  5;
export default function BorrowReturnPage() {
  const {
    data: items = [],
    error,
    isLoading,
    mutate,
  } = useSWR<Borrowing[]>("/api/borrowings", fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
  });
  const { data: summary, mutate: mutateSummary } = useSWR<BorrowingSummary>(
    "/api/borrowings/summary",
    fetcher,
    { refreshInterval: 60000 },
  );
  const { data: equipment = [] } = useSWR<Equipment[]>(
    "/api/equipment",
    fetcher,
  );
  const [role, setRole] = useState(""),
    [isModalOpen, setIsModalOpen] = useState(false),
    [filter, setFilter] = useState("all"),
    [search, setSearch] = useState(""),
    [showCreate, setShowCreate] = useState(false),
    [selected, setSelected] = useState<Borrowing | null>(null),
    [detail, setDetail] = useState<Borrowing | null>(null),
    [detailLoading, setDetailLoading] = useState(false),
    [submitting, setSubmitting] = useState(false);
  useEffect(() => {
    void fetcher<{ user?: { role?: string } }>("/api/auth/me")
      .then((x) => setRole(x.user?.role ?? ""))
      .catch(() => setRole(""));
  }, []);
  const visible = useMemo(
    () =>
      items
        .filter((i) => {
          const overdue = isOverdue(i),
            status =
              filter === "all" ||
              (filter === "overdue"
                ? overdue
                : i.status === filter ||
                  (filter === "borrowed" && i.status === "approved")),
            q = search.trim().toLocaleLowerCase();
          return (
            status &&
            (!q ||
              `${i.borrower_name} ${i.equipment_name} ${i.equipment_code}`
                .toLocaleLowerCase()
                .includes(q))
          );
        })
        .sort(
          (a, b) =>
            rank(a) - rank(b) ||
            new Date(a.expected_return_date).getTime() -
              new Date(b.expected_return_date).getTime(),
        ),
    [items, filter, search],
  );
  const refresh = () => Promise.all([mutate(), mutateSummary()]);
  async function openDetail(i: Borrowing) {
    setSelected(i);
    setDetail(i);
    setDetailLoading(true);
    try {
      setDetail(await fetcher<Borrowing>(`/api/borrow-requests/${i.id}`));
    } catch (e) {
      toast.error(
        e instanceof Error ? e.message : "ไม่สามารถโหลดรายละเอียดได้",
      );
    } finally {
      setDetailLoading(false);
    }
  }
  async function runAction(
    i: Borrowing,
    a: "approve" | "reject" | "return" | "remind",
  ) {
    const text = {
        approve: "อนุมัติคำขอแล้ว",
        reject: "ปฏิเสธคำขอแล้ว",
        return: "รับคืนครุภัณฑ์แล้ว",
        remind: "ส่งการแจ้งเตือนแล้ว",
      },
      prior = items;
    if (a !== "remind")
      await mutate(
        items.map((x) =>
          x.id === i.id
            ? {
                ...x,
                status:
                  a === "approve"
                    ? "approved"
                    : a === "reject"
                      ? "rejected"
                      : "returned",
                actual_return_date:
                  a === "return"
                    ? new Date().toISOString()
                    : x.actual_return_date,
              }
            : x,
        ),
        false,
      );
    try {
      const r = await fetch(`/api/borrowings/${i.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: a }),
        }),
        b = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(b.error ?? "ทำรายการไม่สำเร็จ");
      toast.success(text[a]);
      setSelected(null);
      setDetail(null);
      await refresh();
    } catch (e) {
      await mutate(prior, false);
      toast.error(e instanceof Error ? e.message : "ทำรายการไม่สำเร็จ");
    }
  }
  async function createRequest(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setSubmitting(true);
    try {
      const r = await fetch("/api/borrowings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        }),
        b = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(b.error ?? "ส่งคำขอยืมไม่สำเร็จ");
      form.reset();
      setShowCreate(false);
      toast.success("ส่งคำขอยืมเรียบร้อยแล้ว");
      await refresh();
    } catch (x) {
      toast.error(x instanceof Error ? x.message : "ส่งคำขอยืมไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  }
  const canManage = role === "admin";
  return (
    <main className={`content ${styles.page}`}>
      <Toaster position="top-right" richColors />
      <header className={styles.header}>
        <div>
          <p className="eyebrow">การใช้งานครุภัณฑ์</p>
          <h1>รายการยืม-คืน</h1>
          <p className="sub">
            ติดตามคำขอยืม กำหนดคืน และสถานะครุภัณฑ์ของโรงเรียน
          </p>
        </div>
        <button className="primary" onClick={() => setIsModalOpen(true)}>
          ＋ สร้างคำขอยืม
        </button>
      </header>
      {showCreate && (
        <form className={styles.createForm} onSubmit={createRequest}>
          <select name="equipment_id" required defaultValue="">
            <option value="" disabled>
              เลือกครุภัณฑ์
            </option>
            {equipment
              .filter((x) => x.status === "available")
              .map((x) => (
                <option key={x.id} value={x.id}>
                  {x.code} — {x.name}
                </option>
              ))}
          </select>
          <input
            type="date"
            name="expected_return_date"
            required
            aria-label="กำหนดคืน"
          />
          <input name="purpose" required placeholder="วัตถุประสงค์การยืม" />
          <button className="primary" disabled={submitting}>
            {submitting ? "กำลังส่ง..." : "ส่งคำขอ"}
          </button>
        </form>
      )}
      <StatusSummary summary={summary} />
      <section className={styles.tracking}>
        <div className={styles.sectionHead}>
          <div>
            <h2>ติดตามรายการยืมครุภัณฑ์</h2>
            <p className="sub">เรียงรายการที่ต้องดำเนินการก่อนเสมอ</p>
          </div>
          <div className={styles.filters}>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              aria-label="กรองสถานะ"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="overdue">เลยกำหนด</option>
              <option value="pending">รออนุมัติ</option>
              <option value="borrowed">กำลังยืม</option>
              <option value="returned">คืนแล้ว</option>
            </select>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาผู้ยืมหรือครุภัณฑ์"
              aria-label="ค้นหารายการ"
            />
          </div>
        </div>
        <div className={styles.timeline}>
          {isLoading && <p className={styles.empty}>กำลังโหลดรายการ...</p>}
          {error && <p className={styles.error}>{error.message}</p>}
          {!isLoading && !error && !visible.length && (
            <p className={styles.empty}>ไม่พบรายการที่ตรงกับเงื่อนไข</p>
          )}
          {visible.map((i) => (
            <RequestCard
              key={i.id}
              item={i}
              canManage={canManage}
              onAction={runAction}
              onDetail={openDetail}
            />
          ))}
        </div>
      </section>
      <DetailModal
        item={detail}
        loading={detailLoading}
        canManage={canManage}
        onClose={() => {
          setSelected(null);
          setDetail(null);
        }}
        onAction={(a) => selected && runAction(selected, a)}
      />
      <CreateBorrowRequestModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSuccess={() => { void refresh(); }} />
    </main>
  );
}
