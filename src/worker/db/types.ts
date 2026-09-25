export interface UserRow {
  id: string;
  nickname: string;
  wallet_address: string | null;
  free_quota: number;
  is_vip: number; // 0 or 1
  vip_expire_at: number | null;
  referral_code: string;
  referrer_id: string | null;
  earnings_balance: number;
  total_earned: number;
  total_withdrawn: number;
  created_at: number;
  updated_at: number;
}

export type DivinationCategory =
  | "palm_face"
  | "love_match"
  | "phone_plate"
  | "name_test"
  | "auspicious_date"
  | "future_fortune"
  | "bazi"
  | "qimen_decision"
  | "personal_naming"
  | "company_naming";

export type PayType = "FREE_QUOTA" | "USDT_TRC20" | "USDT_ERC20";
export type OrderStatus = "PENDING" | "CONFIRMING" | "COMPLETED" | "REFUNDED";

export interface DivinationOrderRow {
  id: string;
  user_id: string;
  category: DivinationCategory;
  subcategory: string | null;
  input_data: string; // JSON stringified
  price_usdt: number;
  pay_type: PayType;
  status: OrderStatus;
  tx_hash: string | null;
  referrer_direct_id: string | null;
  referrer_direct_cut: number | null;
  referrer_indirect_id: string | null;
  referrer_indirect_cut: number | null;
  created_at: number;
  paid_at: number | null;
}

export interface DivinationReportRow {
  id: string;
  order_id: string;
  user_id: string;
  category: DivinationCategory;
  preview_summary: string; // JSON stringified
  full_report: string | null; // JSON stringified
  is_unlocked: number; // 0 or 1
  created_at: number;
}

export type WithdrawalStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface WithdrawalRow {
  id: string;
  user_id: string;
  amount: number;
  fee: number;
  actual_amount: number;
  payout_address: string;
  status: WithdrawalStatus;
  tx_hash: string | null;
  created_at: number;
  reviewed_at: number | null;
}

export interface SessionRow {
  user_id: string;
  session_id: string;
  data: string;
  updated_at: number;
}
