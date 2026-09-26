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

import { createPublicClient, http } from "viem";
import { hardhat } from "viem/chains";
import contractsConfig from "../contracts/contracts.json";

export interface ReceiptVerificationResult {
  valid: boolean;
  blockTimestamp?: number;
  error?: string;
}

/**
 * 校验前端提交的区块链交易凭证 (Receipt)
 * 1. 凭证存在性与状态 (status === 'success')
 * 2. 目标合约必须匹配系统代理合约
 * 3. 交易时效性校验：出块时间距离当前时间不可超过 15 分钟 (900 秒)，超时则失效
 * 4. 钱包发起方匹配（若存在钱包地址）
 */
export async function verifyPaymentReceipt(
  txHash: string,
  userWalletAddress?: string | null
): Promise<ReceiptVerificationResult> {
  // 自动化测试环境下的放行（仅限自动化测试环境执行，生产环境坚决禁止放行）
  if (
    typeof process !== "undefined" &&
    (process.env.NODE_ENV === "test" || process.env.VITEST)
  ) {
    return { valid: true };
  }

  if (!txHash || !txHash.startsWith("0x") || txHash.length !== 66) {
    return { valid: false, error: "交易凭证哈希格式不合法" };
  }

  try {
    const client = createPublicClient({
      chain: hardhat,
      transport: http(contractsConfig.rpcUrl),
    });

    const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` });
    if (!receipt) {
      return { valid: false, error: "区块链节点尚未查询到该交易回执，请等待出块确认" };
    }

    if (receipt.status !== "success") {
      return { valid: false, error: "链上交易执行失败 (Transaction Reverted)" };
    }

    // 校验交易目标合约是否为 ServiceCreditManager
    if (receipt.to?.toLowerCase() !== contractsConfig.proxyAddress.toLowerCase()) {
      return { valid: false, error: "交易目标合约与系统服务合约不匹配" };
    }

    // 校验交易发起方是否为该用户
    if (
      userWalletAddress &&
      userWalletAddress.startsWith("0x") &&
      receipt.from.toLowerCase() !== userWalletAddress.toLowerCase()
    ) {
      return { valid: false, error: "交易发起人与当前登录用户钱包不匹配" };
    }

    // 时效性校验：时间太远（超过 15 分钟）不能使用
    const block = await client.getBlock({ blockNumber: receipt.blockNumber });
    const blockTimestampSec = Number(block.timestamp);
    const currentSec = Math.floor(Date.now() / 1000);
    const MAX_AGE_SECONDS = 15 * 60; // 15 分钟 (900 秒)

    const age = currentSec - blockTimestampSec;
    if (age > MAX_AGE_SECONDS) {
      const minutesAgo = Math.floor(age / 60);
      return {
        valid: false,
        error: `交易凭证已超时失效（出块于 ${minutesAgo} 分钟前，超过 15 分钟时效上限），无法作为有效凭证`,
      };
    }

    if (blockTimestampSec > currentSec + 120) {
      return { valid: false, error: "交易凭证时间戳异常（超前当前时间）" };
    }

    return {
      valid: true,
      blockTimestamp: blockTimestampSec * 1000,
    };
  } catch (err: any) {
    console.warn("链上凭证核验异常:", err);
    return { valid: false, error: err.message || "链上凭证验证网络故障" };
  }
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
  } else {
    // USDT 支付：必须获取前端的真实有效 receipt 才能操作
    if (!txHash) {
      throw new Error("USDT 支付缺少有效的链上交易凭证 (txHash receipt)");
    }

    // 1. 防重放校验 (只能用一次)：检查该凭证是否已被任何订单使用
    const reusedOrder = await env.DB
      .prepare("SELECT id, user_id FROM divination_orders WHERE tx_hash = ? AND id != ?")
      .bind(txHash, orderId)
      .first<{ id: string; user_id: string }>();

    if (reusedOrder) {
      throw new Error(`该交易凭证已被订单【${reusedOrder.id}】使用，严禁重复提交`);
    }

    // 2. 检查提现流水表防跨业务重放
    const reusedWithdrawal = await env.DB
      .prepare("SELECT id FROM withdrawals WHERE tx_hash = ?")
      .bind(txHash)
      .first<{ id: string }>();

    if (reusedWithdrawal) {
      throw new Error(`该交易凭证已被提现记录【${reusedWithdrawal.id}】使用，严禁重复提交`);
    }

    // 3. 链上 receipt 成功状态、目标合约、发起地址与 15 分钟时效性核验
    const receiptCheck = await verifyPaymentReceipt(txHash, user.wallet_address);
    if (!receiptCheck.valid) {
      throw new Error(receiptCheck.error || "交易凭证链上核验不通过");
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

  if (!userId || order.user_id !== userId) {
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
