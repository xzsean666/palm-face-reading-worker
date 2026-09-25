import type { Env } from "../types/env";
import type { WithdrawalRow, UserRow } from "../db/types";
import { findUserById } from "../db";

/**
 * 获取推广中心概览（直推/间推裂变人数、佣金收益、可提现余额）
 */
export async function getPromoteOverview(env: Env, userId: string) {
  const user = await findUserById(env.DB, userId);
  if (!user) {
    throw new Error("用户不存在");
  }

  // 1. 直推用户列表
  const { results: directUsers } = await env.DB
    .prepare("SELECT id, nickname, created_at, is_vip FROM users WHERE referrer_id = ?")
    .bind(userId)
    .all<{ id: string; nickname: string; created_at: number; is_vip: number }>();

  const directList = directUsers || [];
  const directCount = directList.length;

  // 2. 间推用户列表（直推人的下级）
  let indirectCount = 0;
  if (directCount > 0) {
    const directIds = directList.map((u) => `'${u.id}'`).join(",");
    const { results: indirectUsers } = await env.DB
      .prepare(`SELECT count(*) as count FROM users WHERE referrer_id IN (${directIds})`)
      .all<{ count: number }>();
    indirectCount = indirectUsers?.[0]?.count || 0;
  }

  return {
    referralCode: user.referral_code,
    earningsBalance: user.earnings_balance,
    totalEarned: user.total_earned,
    totalWithdrawn: user.total_withdrawn,
    directCount,
    indirectCount,
    totalTeamCount: directCount + indirectCount,
    directCommissionRate: "15%",
    indirectCommissionRate: "5%",
  };
}

/**
 * 申请提现 USDT
 */
export async function applyWithdrawal(
  env: Env,
  userId: string,
  amount: number,
  payoutAddress: string
): Promise<WithdrawalRow> {
  if (amount < 10.0) {
    throw new Error("最低提现金额为 10 USDT");
  }

  if (!payoutAddress || payoutAddress.trim().length < 10) {
    throw new Error("请输入有效的 USDT 收款地址 (TRC20 或 ERC20)");
  }

  const user = await findUserById(env.DB, userId);
  if (!user) {
    throw new Error("用户不存在");
  }

  if (user.earnings_balance < amount) {
    throw new Error(`可提现余额不足 (当前余额: ${user.earnings_balance.toFixed(2)} USDT)`);
  }

  const now = Date.now();
  const fee = 1.0; // 平台固定链上手续费 1 USDT
  const actualAmount = amount - fee;
  const withdrawalId = `WD${now}${Math.floor(100 + Math.random() * 900)}`;

  // 原子扣减余额
  const updateRes = await env.DB
    .prepare(
      `UPDATE users
       SET earnings_balance = earnings_balance - ?,
           total_withdrawn = total_withdrawn + ?,
           updated_at = ?
       WHERE id = ? AND earnings_balance >= ?`
    )
    .bind(amount, actualAmount, now, userId, amount)
    .run();

  if ((updateRes.meta.changes ?? 0) === 0) {
    throw new Error("提现扣减余额失败，请稍后重试");
  }

  // 记录提现流水
  await env.DB
    .prepare(
      `INSERT INTO withdrawals (
        id, user_id, amount, fee, actual_amount, payout_address, status, tx_hash, created_at, reviewed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(
      withdrawalId,
      userId,
      amount,
      fee,
      actualAmount,
      payoutAddress.trim(),
      "PENDING",
      null,
      now,
      null
    )
    .run();

  return {
    id: withdrawalId,
    user_id: userId,
    amount,
    fee,
    actual_amount: actualAmount,
    payout_address: payoutAddress.trim(),
    status: "PENDING",
    tx_hash: null,
    created_at: now,
    reviewed_at: null,
  };
}

/**
 * 查询用户提现记录
 */
export async function listUserWithdrawals(env: Env, userId: string, limit = 50) {
  const { results } = await env.DB
    .prepare("SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC LIMIT ?")
    .bind(userId, limit)
    .all<WithdrawalRow>();
  return results || [];
}
