import { Hono } from "hono";
import type { Env } from "../types/env";
import {
  getPromoteOverview,
  applyWithdrawal,
  listUserWithdrawals,
  listUserEarnings,
} from "../services/referral-service";
import { verifyPaymentReceipt } from "../services/order-service";

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
 * 获取用户收益明细记录列表（直推与间推佣金明细）
 */
promoteRoutes.get("/earnings", async (c) => {
  const userId = c.req.query("userId");
  if (!userId) {
    return c.json({ success: false, error: "缺少 userId" }, 400);
  }
  try {
    const earnings = await listUserEarnings(c.env, userId);
    return c.json({ success: true, data: earnings });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "获取收益明细失败" }, 400);
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
 * 记录链上智能合约直接提现成功（防重放、凭证核验与账目扣减）
 */
promoteRoutes.post("/sync-withdrawal", async (c) => {
  try {
    const body = await c.req.json();
    const { userId, amount, txHash, payoutAddress } = body;
    if (!userId || !amount || !txHash) {
      return c.json({ success: false, error: "缺少必要参数 (userId, amount, txHash)" }, 400);
    }

    // 1. 防重放校验：检查该凭证是否已被任何提现记录使用
    const reusedWithdrawal = await c.env.DB
      .prepare("SELECT id FROM withdrawals WHERE tx_hash = ?")
      .bind(txHash)
      .first<{ id: string }>();
    if (reusedWithdrawal) {
      return c.json({ success: false, error: `交易凭证已在提现记录【${reusedWithdrawal.id}】中使用，严禁重复提交` }, 400);
    }

    // 2. 检查测算订单表防跨业务重放
    const reusedOrder = await c.env.DB
      .prepare("SELECT id FROM divination_orders WHERE tx_hash = ?")
      .bind(txHash)
      .first<{ id: string }>();
    if (reusedOrder) {
      return c.json({ success: false, error: `交易凭证已在订单【${reusedOrder.id}】中使用，严禁重复提交` }, 400);
    }

    // 3. 链上交易凭证真实有效性核验
    const receiptCheck = await verifyPaymentReceipt(txHash, payoutAddress || userId);
    if (!receiptCheck.valid) {
      return c.json({ success: false, error: receiptCheck.error || "提现交易凭证链上核验未通过" }, 400);
    }

    const now = Date.now();
    const withdrawalId = `WD${now}${Math.floor(100 + Math.random() * 900)}`;
    const numAmount = Number(amount);

    // 4. 同步扣减用户线上收益余额并累加已提现总额
    await c.env.DB
      .prepare(
        `UPDATE users
         SET earnings_balance = MAX(0.0, earnings_balance - ?),
             total_withdrawn = total_withdrawn + ?,
             updated_at = ?
         WHERE id = ?`
      )
      .bind(numAmount, numAmount, now, userId)
      .run();

    // 5. 记录已完成提现流水
    await c.env.DB
      .prepare(
        `INSERT INTO withdrawals (
          id, user_id, amount, fee, actual_amount, payout_address, status, tx_hash, created_at, reviewed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        withdrawalId,
        userId,
        numAmount,
        0.0,
        numAmount,
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

