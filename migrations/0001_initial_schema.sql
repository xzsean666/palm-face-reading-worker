-- 天机 AI预测大师 (Tianji AI Divination Worker) - Cloudflare D1 初始数据结构

-- 1. AI 会话持久化表 (AI-Session SDK 标准)
CREATE TABLE IF NOT EXISTS ai_sessions (
  user_id TEXT NOT NULL,
  session_id TEXT NOT NULL,
  data TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, session_id)
);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_user_updated ON ai_sessions(user_id, updated_at DESC);

-- 2. 用户与账户表
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  nickname TEXT NOT NULL DEFAULT '天机缘主',
  wallet_address TEXT,
  free_quota INTEGER NOT NULL DEFAULT 2,
  is_vip INTEGER NOT NULL DEFAULT 0,
  vip_expire_at INTEGER,
  referral_code TEXT UNIQUE,
  referrer_id TEXT,
  earnings_balance REAL NOT NULL DEFAULT 0.0,
  total_earned REAL NOT NULL DEFAULT 0.0,
  total_withdrawn REAL NOT NULL DEFAULT 0.0,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_users_referral_code ON users(referral_code);
CREATE INDEX IF NOT EXISTS idx_users_referrer_id ON users(referrer_id);

-- 3. 测算订单表
CREATE TABLE IF NOT EXISTS divination_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  subcategory TEXT,
  input_data TEXT NOT NULL,
  price_usdt REAL NOT NULL,
  pay_type TEXT NOT NULL,
  status TEXT NOT NULL,
  tx_hash TEXT,
  referrer_direct_id TEXT,
  referrer_direct_cut REAL,
  referrer_indirect_id TEXT,
  referrer_indirect_cut REAL,
  created_at INTEGER NOT NULL,
  paid_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_orders_user ON divination_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_status ON divination_orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_tx_hash ON divination_orders(tx_hash);

-- 4. 测算报告表 (支持免费预览与解锁完整版)
CREATE TABLE IF NOT EXISTS divination_reports (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  category TEXT NOT NULL,
  preview_summary TEXT NOT NULL,
  full_report TEXT,
  is_unlocked INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_reports_order ON divination_reports(order_id);
CREATE INDEX IF NOT EXISTS idx_reports_user ON divination_reports(user_id, created_at DESC);

-- 5. 提现申请表
CREATE TABLE IF NOT EXISTS withdrawals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  amount REAL NOT NULL,
  fee REAL NOT NULL DEFAULT 1.0,
  actual_amount REAL NOT NULL,
  payout_address TEXT NOT NULL,
  status TEXT NOT NULL,
  tx_hash TEXT,
  created_at INTEGER NOT NULL,
  reviewed_at INTEGER
);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_withdrawals_tx_hash ON withdrawals(tx_hash);
