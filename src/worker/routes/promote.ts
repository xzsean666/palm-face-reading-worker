import { Hono } from "hono";
import type { Env } from "../types/env";
import {
  getPromoteOverview,
  applyWithdrawal,
  listUserWithdrawals,
} from "../services/referral-service";

export const promoteRoutes = new Hono<{ Bindings: Env }>();

/**
 * 推广中心概览（直推/间推人数、收益余额）
 */
promoteRoutes.get("/overview", async (c) => {
  const userId = c.req.query("userId");
  if (!userId) {
    return c.json({ success: false, error: "缺少 userId" }, 400);
  }
  try {
    const overview = await getPromoteOverview(c.env, userId);
    return c.json({ success: true, data: overview });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "获取推广数据失败" }, 400);
  }
});

/**
 * 申请提现 USDT
 */
promoteRoutes.post("/withdraw", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.userId || !body.amount || !body.payoutAddress) {
      return c.json({ success: false, error: "缺少提现参数 (userId, amount, payoutAddress)" }, 400);
    }
    const withdrawal = await applyWithdrawal(
      c.env,
      body.userId,
      Number(body.amount),
      body.payoutAddress
    );
    return c.json({ success: true, data: withdrawal });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "提现申请失败" }, 400);
  }
});

/**
 * 获取提现记录列表
 */
promoteRoutes.get("/withdrawals", async (c) => {
  const userId = c.req.query("userId");
  if (!userId) {
    return c.json({ success: false, error: "缺少 userId" }, 400);
  }
  const list = await listUserWithdrawals(c.env, userId);
  return c.json({ success: true, data: list });
});

/**
 * 记录链上智能合约直接提现成功
 */
promoteRoutes.post("/sync-withdrawal", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, amount, txHash, payoutAddress } = body;
    if (!userId || !amount || !txHash) {
      return c.json({ success: false, error: "缺少必要参数" }, 400);
    }
    const now = Date.now();
    const withdrawalId = `WD${now}${Math.floor(100 + Math.random() * 900)}`;

    await c.env.DB
      .prepare(
        `INSERT INTO withdrawals (
          id, user_id, amount, fee, actual_amount, payout_address, status, tx_hash, created_at, reviewed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        withdrawalId,
        userId,
        Number(amount),
        0.0,
        Number(amount),
        payoutAddress || userId,
        "completed",
        txHash,
        now,
        now
      )
      .run();

    return c.json({ success: true, data: { id: withdrawalId, status: "completed", txHash } });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 400);
  }
});

