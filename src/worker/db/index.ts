import type {
  UserRow,
  DivinationOrderRow,
  DivinationReportRow,
  WithdrawalRow,
} from "./types";

export * from "./types";

/**
 * 生成随机专属推荐码 (如 TJ7X9K2)
 */
export function generateReferralCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "TJ";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * 生成唯一订单号 (如 TJ20260925XXXX)
 */
export function generateOrderId(): string {
  const now = new Date();
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `TJ${ymd}${rand}`;
}

/**
 * 查找用户
 */
export async function findUserById(db: D1Database, userId: string): Promise<UserRow | null> {
  return await db
    .prepare("SELECT * FROM users WHERE id = ?")
    .bind(userId)
    .first<UserRow>();
}

/**
 * 根据推荐码查找推荐人
 */
export async function findUserByReferralCode(
  db: D1Database,
  code: string
): Promise<UserRow | null> {
  return await db
    .prepare("SELECT * FROM users WHERE referral_code = ?")
    .bind(code)
    .first<UserRow>();
}

/**
 * 获取或创建用户（默认赠送 2 次免费额度）
 */
export async function getOrCreateUser(
  db: D1Database,
  userId: string,
  walletAddress?: string,
  referrerCode?: string
): Promise<UserRow> {
  const existing = await findUserById(db, userId);
  if (existing) {
    let updated = false;
    if (walletAddress && !existing.wallet_address) {
      existing.wallet_address = walletAddress;
      updated = true;
    }
    if (referrerCode && referrerCode.trim() && !existing.referrer_id) {
      const cleanRefCode = referrerCode.trim().toUpperCase();
      const referrer = await findUserByReferralCode(db, cleanRefCode);
      if (referrer && referrer.id !== userId) {
        existing.referrer_id = referrer.id;
        updated = true;
      }
    }
    if (updated) {
      await db
        .prepare("UPDATE users SET wallet_address = ?, referrer_id = ?, updated_at = ? WHERE id = ?")
        .bind(existing.wallet_address || null, existing.referrer_id || null, Date.now(), userId)
        .run();
    }
    return existing;
  }

  // 校验邀请人
  let referrerId: string | null = null;
  if (referrerCode && referrerCode.trim()) {
    const cleanRefCode = referrerCode.trim().toUpperCase();
    const referrer = await findUserByReferralCode(db, cleanRefCode);
    if (referrer && referrer.id !== userId) {
      referrerId = referrer.id;
    }
  }

  const now = Date.now();
  const referralCode = generateReferralCode();
  const nickname = walletAddress
    ? `缘主 ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : `天机缘主_${userId.slice(-4)}`;

  await db
    .prepare(
      `INSERT INTO users (
        id, nickname, wallet_address, free_quota, is_vip, referral_code,
        referrer_id, earnings_balance, total_earned, total_withdrawn,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      userId,
      nickname,
      walletAddress || null,
      2, // 默认 2 次免费额度
      0,
      referralCode,
      referrerId,
      0.0,
      0.0,
      0.0,
      now,
      now
    )
    .run();

  const created = await findUserById(db, userId);
  return created!;
}

/**
 * 扣减一次免费测算额度
 */
export async function deductFreeQuota(db: D1Database, userId: string): Promise<boolean> {
  const res = await db
    .prepare("UPDATE users SET free_quota = free_quota - 1, updated_at = ? WHERE id = ? AND free_quota > 0")
    .bind(Date.now(), userId)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

/**
 * 创建测算订单
 */
export async function createOrder(
  db: D1Database,
  order: Omit<DivinationOrderRow, "created_at" | "paid_at">
): Promise<DivinationOrderRow> {
  const now = Date.now();
  const paidAt = order.status === "COMPLETED" ? now : null;

  await db
    .prepare(
      `INSERT INTO divination_orders (
        id, user_id, category, subcategory, input_data, price_usdt,
        pay_type, status, tx_hash, referrer_direct_id, referrer_direct_cut,
        referrer_indirect_id, referrer_indirect_cut, created_at, paid_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      order.id,
      order.user_id,
      order.category,
      order.subcategory,
      order.input_data,
      order.price_usdt,
      order.pay_type,
      order.status,
      order.tx_hash,
      order.referrer_direct_id,
      order.referrer_direct_cut,
      order.referrer_indirect_id,
      order.referrer_indirect_cut,
      now,
      paidAt
    )
    .run();

  return {
    ...order,
    created_at: now,
    paid_at: paidAt,
  };
}

/**
 * 更新订单状态（完成支付并触发分润）
 */
export async function completeOrder(
  db: D1Database,
  orderId: string,
  txHash?: string
): Promise<DivinationOrderRow | null> {
  const order = await db
    .prepare("SELECT * FROM divination_orders WHERE id = ?")
    .bind(orderId)
    .first<DivinationOrderRow>();

  if (!order || order.status === "COMPLETED") {
    return order;
  }

  const now = Date.now();
  await db
    .prepare("UPDATE divination_orders SET status = 'COMPLETED', tx_hash = ?, paid_at = ? WHERE id = ?")
    .bind(txHash || order.tx_hash, now, orderId)
    .run();

  // 若有直推人分润
  if (order.referrer_direct_id && order.referrer_direct_cut && order.referrer_direct_cut > 0) {
    await db
      .prepare(
        `UPDATE users
         SET earnings_balance = earnings_balance + ?,
             total_earned = total_earned + ?,
             updated_at = ?
         WHERE id = ?`
      )
      .bind(order.referrer_direct_cut, order.referrer_direct_cut, now, order.referrer_direct_id)
      .run();
  }

  // 若有间推人分润
  if (order.referrer_indirect_id && order.referrer_indirect_cut && order.referrer_indirect_cut > 0) {
    await db
      .prepare(
        `UPDATE users
         SET earnings_balance = earnings_balance + ?,
             total_earned = total_earned + ?,
             updated_at = ?
         WHERE id = ?`
      )
      .bind(order.referrer_indirect_cut, order.referrer_indirect_cut, now, order.referrer_indirect_id)
      .run();
  }

  return await db
    .prepare("SELECT * FROM divination_orders WHERE id = ?")
    .bind(orderId)
    .first<DivinationOrderRow>();
}

/**
 * 创建测算报告
 */
export async function createReport(
  db: D1Database,
  report: Omit<DivinationReportRow, "created_at">
): Promise<DivinationReportRow> {
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO divination_reports (
        id, order_id, user_id, category, preview_summary, full_report, is_unlocked, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      report.id,
      report.order_id,
      report.user_id,
      report.category,
      report.preview_summary,
      report.full_report,
      report.is_unlocked,
      now
    )
    .run();

  return {
    ...report,
    created_at: now,
  };
}

/**
 * 解锁报告
 */
export async function unlockReport(
  db: D1Database,
  reportId: string,
  fullReportJson: string
): Promise<boolean> {
  const res = await db
    .prepare(
      "UPDATE divination_reports SET is_unlocked = 1, full_report = ? WHERE id = ?"
    )
    .bind(fullReportJson, reportId)
    .run();
  return (res.meta.changes ?? 0) > 0;
}

/**
 * 获取报告详情
 */
export async function getReportById(
  db: D1Database,
  reportId: string
): Promise<DivinationReportRow | null> {
  return await db
    .prepare("SELECT * FROM divination_reports WHERE id = ?")
    .bind(reportId)
    .first<DivinationReportRow>();
}

/**
 * 根据订单获取报告
 */
export async function getReportByOrderId(
  db: D1Database,
  orderId: string
): Promise<DivinationReportRow | null> {
  return await db
    .prepare("SELECT * FROM divination_reports WHERE order_id = ?")
    .bind(orderId)
    .first<DivinationReportRow>();
}

/**
 * 获取用户的所有报告记录
 */
export async function listUserReports(
  db: D1Database,
  userId: string,
  limit = 50
): Promise<DivinationReportRow[]> {
  const { results } = await db
    .prepare("SELECT * FROM divination_reports WHERE user_id = ? ORDER BY created_at DESC LIMIT ?")
    .bind(userId, limit)
    .all<DivinationReportRow>();
  return results || [];
}

/**
 * 获取用户的所有订单记录
 */
export async function listUserOrders(
  db: D1Database,
  userId: string,
  limit = 50
): Promise<DivinationOrderRow[]> {
  const { results } = await db
    .prepare("SELECT * FROM divination_orders WHERE user_id = ? ORDER BY created_at DESC LIMIT ?")
    .bind(userId, limit)
    .all<DivinationOrderRow>();
  return results || [];
}
