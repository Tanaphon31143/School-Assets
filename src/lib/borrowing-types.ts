export type BorrowingStatus = "pending" | "approved" | "borrowed" | "returned" | "rejected";

export type Borrowing = {
  id: number; equipment_id: number; user_id: number; equipment_name: string; equipment_code: string;
  borrower_name: string; status: BorrowingStatus; borrow_date: string; expected_return_date: string;
  actual_return_date: string | null; purpose: string | null; condition: string | null;
  location_name?: string | null; category_name?: string | null;
};

export type BorrowingSummary = { borrowed: number; overdue: number; pending: number; returned: number };
