import type { Env } from "../types/env";
import type { DivinationOrderRow, DivinationCategory, PayType } from "../db/types";
import {
  createOrder as dbCreateOrder,
  completeOrder as dbCompleteOrder,
  generateOrderId,
  findUserById,
  deductFreeQuota,
  listUserOrders as dbListUserOrders,
} from "../db";

export interface CreateOrderParams {
  userId: string;
  category: DivinationCategory;
  subcategory?: string;
  inputData: Record<string, any>;
  payType?: PayType;
  referrerCode?: string;
}

/**
 * 创建新测算订单
 */
export async function createDivinationOrder(
  env: Env,
  params: CreateOrderParams
): Promise<DivinationOrderRow> {
  const user = await findUserById(env.DB, params.userId);
  if (!user) {
    throw new Error("用户不存在，请先登录");
  }

  // VIP 折扣价 4.8 USDT，普通用户 6.0 USDT
  const standardPrice = 6.0;
  const price = user.is_vip === 1 ? 4.8 : standardPrice;
  const orderId = generateOrderId();
  const payType = params.payType || "USDT_TRC20";

  let directReferrerId: string | null = user.referrer_id || null;
  let indirectReferrerId: string | null = null;
  if (directReferrerId) {
    const directUser = await findUserById(env.DB, directReferrerId);
    if (directUser && directUser.referrer_id) {
      indirectReferrerId = directUser.referrer_id;
    }
  }

  const directCut = directReferrerId ? price * 0.15 : 0; // 直推 15%
  const indirectCut = indirectReferrerId ? price * 0.05 : 0; // 间推 5%

  return await dbCreateOrder(env.DB, {
    id: orderId,
    user_id: user.id,
    category: params.category,
    subcategory: params.subcategory || null,
    input_data: JSON.stringify(params.inputData),
    price_usdt: price,
    pay_type: payType,
    status: "PENDING",
    tx_hash: null,
    referrer_direct_id: directReferrerId,
    referrer_direct_cut: directCut > 0 ? directCut : null,
    referrer_indirect_id: indirectReferrerId,
    referrer_indirect_cut: indirectCut > 0 ? indirectCut : null,
  });
}

/**
 * 支付并完成订单（支持免费额度或 USDT）
 */
export async function payOrder(
  env: Env,
  orderId: string,
  userId: string,
  payType: PayType,
  txHash?: string
) {
  const order = await env.DB
    .prepare("SELECT * FROM divination_orders WHERE id = ?")
    .bind(orderId)
    .first<DivinationOrderRow>();

  if (!order) {
    throw new Error("订单不存在");
  }

  if (order.user_id !== userId) {
    throw new Error("无权操作此订单");
  }

  if (order.status === "COMPLETED") {
    return { order, isUnlocked: true };
  }

  const user = await findUserById(env.DB, userId);
  if (!user) {
    throw new Error("用户不存在");
  }

  if (payType === "FREE_QUOTA") {
    if (user.is_vip !== 1) {
      if (user.free_quota <= 0) {
        throw new Error("免费测算额度已耗尽，请使用 USDT 支付");
      }
      const ok = await deductFreeQuota(env.DB, userId);
      if (!ok) {
        throw new Error("扣减免费额度失败");
      }
    }
  }

  // 更新订单状态为 COMPLETED 并计算佣金分润
  const completedOrder = await dbCompleteOrder(env.DB, orderId, txHash);

  // 联动解锁该订单生成的报告
  await env.DB
    .prepare("UPDATE divination_reports SET is_unlocked = 1 WHERE order_id = ?")
    .bind(orderId)
    .run();

  return {
    order: completedOrder,
    isUnlocked: true,
  };
}

/**
 * 获取订单详情
 */
export async function getOrderDetails(env: Env, orderId: string, userId?: string) {
  const order = await env.DB
    .prepare("SELECT * FROM divination_orders WHERE id = ?")
    .bind(orderId)
    .first<DivinationOrderRow>();

  if (!order) {
    return null;
  }

  if (userId && order.user_id !== userId) {
    return null;
  }

  // 查询关联报告
  const report = await env.DB
    .prepare("SELECT id, is_unlocked, created_at FROM divination_reports WHERE order_id = ?")
    .bind(orderId)
    .first<{ id: string; is_unlocked: number; created_at: number }>();

  return {
    ...order,
    inputData: JSON.parse(order.input_data || "{}"),
    report: report || null,
  };
}

/**
 * 列出用户订单
 */
export async function listOrders(env: Env, userId: string, limit = 50) {
  return await dbListUserOrders(env.DB, userId, limit);
}
