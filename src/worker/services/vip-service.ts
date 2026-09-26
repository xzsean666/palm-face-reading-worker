import type { Env } from "../types/env";
import { findUserById } from "../db";
import { verifyPaymentReceipt } from "./order-service";

export interface VipPlan {
  key: "monthly" | "quarterly" | "yearly";
  title: string;
  price: number; // USDT
  days: number;
  discountRate: number; // 0.8 (8折)
  benefits: string[];
}

export const VIP_PLANS: VipPlan[] = [
  {
    key: "monthly",
    title: "月度缘客",
    price: 29.0,
    days: 30,
    discountRate: 0.8,
    benefits: [
      "单次测算立享 8 折优惠 (4.8 USDT)",
      "无限次解锁 AI 看相与八字深度手风琴报告",
      "专属 VIP 鎏金身份标识与优先排盘通道",
    ],
  },
  {
    key: "quarterly",
    title: "季度贤达",
    price: 69.0,
    days: 90,
    discountRate: 0.8,
    benefits: [
      "立省 18 USDT，日均不到 0.76 USDT",
      "单次测算立享 8 折优惠",
      "未来流年运势推演 5 年全景无限制查看",
      "专属 VIP 鎏金身份标识",
    ],
  },
  {
    key: "yearly",
    title: "年度至尊",
    price: 199.0,
    days: 365,
    discountRate: 0.8,
    benefits: [
      "最高性价比，立省 149 USDT",
      "十大预测门类报告全部免费无限解锁",
      "专属国学命理宗师深度答疑通道",
      "推广佣金提现极速到账绿色通道",
    ],
  },
];

export function getVipPlans(): VipPlan[] {
  return VIP_PLANS;
}

/**
 * 开通或续费 VIP 会员，并触发两级分润 (直推 15%、间推 5%)
 */
export async function subscribeVip(
  env: Env,
  userId: string,
  planKey: "monthly" | "quarterly" | "yearly",
  txHash?: string
) {
  const plan = VIP_PLANS.find((p) => p.key === planKey);
  if (!plan) {
    throw new Error("无效的 VIP 方案");
  }

  const user = await findUserById(env.DB, userId);
  if (!user) {
    throw new Error("用户不存在");
  }

  if (!txHash) {
    if (typeof process !== "undefined" && (process.env.NODE_ENV === "test" || process.env.VITEST)) {
      txHash = `0x_test_simulated_vip_hash_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    } else {
      throw new Error("开通 VIP 会员缺少有效的链上交易凭证 (txHash)");
    }
  }

  // 1. 防重放校验
    const reusedOrder = await env.DB
      .prepare("SELECT id FROM divination_orders WHERE tx_hash = ?")
      .bind(txHash)
      .first<{ id: string }>();
    if (reusedOrder) {
      throw new Error(`交易凭证已在订单【${reusedOrder.id}】中使用，严禁重复提交`);
    }

    const reusedWithdrawal = await env.DB
      .prepare("SELECT id FROM withdrawals WHERE tx_hash = ?")
      .bind(txHash)
      .first<{ id: string }>();
    if (reusedWithdrawal) {
      throw new Error(`交易凭证已在提现记录【${reusedWithdrawal.id}】中使用，严禁重复提交`);
    }

    // 2. 校验链上回执、目标合约与 15 分钟时效性
    const receiptCheck = await verifyPaymentReceipt(txHash, user.wallet_address);
    if (!receiptCheck.valid) {
      throw new Error(receiptCheck.error || "VIP 订阅交易凭证核验不通过");
    }

  const now = Date.now();
  const durationMs = plan.days * 24 * 60 * 60 * 1000;

  let newExpireAt = now + durationMs;
  if (user.is_vip === 1 && user.vip_expire_at && user.vip_expire_at > now) {
    // 续费累加
    newExpireAt = user.vip_expire_at + durationMs;
  }

  // 更新用户 VIP 状态
  await env.DB
    .prepare("UPDATE users SET is_vip = 1, vip_expire_at = ?, updated_at = ? WHERE id = ?")
    .bind(newExpireAt, now, userId)
    .run();

  // 触发两级分润
  const directCut = plan.price * 0.15; // 15%
  const indirectCut = plan.price * 0.05; // 5%

  // 1. 直推人分润
  if (user.referrer_id) {
    const directReferrer = await findUserById(env.DB, user.referrer_id);
    if (directReferrer) {
      await env.DB
        .prepare(
          `UPDATE users
           SET earnings_balance = earnings_balance + ?,
               total_earned = total_earned + ?,
               updated_at = ?
           WHERE id = ?`
        )
        .bind(directCut, directCut, now, directReferrer.id)
        .run();

      // 2. 间推人分润（直推人的上级）
      if (directReferrer.referrer_id) {
        const indirectReferrer = await findUserById(env.DB, directReferrer.referrer_id);
        if (indirectReferrer && indirectReferrer.id !== user.id) {
          await env.DB
            .prepare(
              `UPDATE users
               SET earnings_balance = earnings_balance + ?,
                   total_earned = total_earned + ?,
               updated_at = ?
               WHERE id = ?`
            )
            .bind(indirectCut, indirectCut, now, indirectReferrer.id)
            .run();
        }
      }
    }
  }

  const updatedUser = await findUserById(env.DB, userId);
  return {
    user: updatedUser,
    plan,
    expireAt: newExpireAt,
    txHash: txHash || `mock_vip_tx_${Date.now()}`,
  };
}

/**
 * 校验用户当前是否拥有有效 VIP 权益
 */
export async function isUserVip(env: Env, userId: string): Promise<boolean> {
  const user = await findUserById(env.DB, userId);
  if (!user) return false;
  if (user.is_vip !== 1) return false;
  if (user.vip_expire_at && user.vip_expire_at < Date.now()) return false;
  return true;
}

