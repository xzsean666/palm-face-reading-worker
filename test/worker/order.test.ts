import { describe, it, expect, beforeEach } from "vitest";
import { authenticateUser, getUserProfile, bindReferrer } from "../../src/worker/services/user-service";
import { createDivinationOrder, payOrder, getOrderDetails, listOrders } from "../../src/worker/services/order-service";
import type { Env } from "../../src/worker/types/env";

function createMockD1Database(): D1Database {
  const users = new Map<string, any>();
  const orders = new Map<string, any>();
  const reports = new Map<string, any>();

  return {
    prepare(query: string) {
      let params: any[] = [];
      const stmt: any = {
        bind(...args: any[]) {
          params = args;
          return stmt;
        },
        async first<T = Record<string, unknown>>() {
          if (query.includes("SELECT * FROM users WHERE id = ?")) {
            return (users.get(params[0]) || null) as T | null;
          }
          if (query.includes("SELECT * FROM users WHERE referral_code = ?")) {
            for (const u of users.values()) {
              if (u.referral_code === params[0]) return u as T;
            }
            return null as T | null;
          }
          if (query.includes("SELECT * FROM divination_orders WHERE id = ?")) {
            return (orders.get(params[0]) || null) as T | null;
          }
          if (query.includes("WHERE tx_hash = ? AND id != ?")) {
            for (const o of orders.values()) {
              if (o.tx_hash === params[0] && o.id !== params[1]) {
                return { id: o.id, user_id: o.user_id } as T;
              }
            }
            return null as T | null;
          }
          if (query.includes("SELECT id FROM withdrawals WHERE tx_hash = ?")) {
            return null as T | null;
          }
          if (query.includes("SELECT id, is_unlocked, created_at FROM divination_reports WHERE order_id = ?")) {
            for (const r of reports.values()) {
              if (r.order_id === params[0]) return { id: r.id, is_unlocked: r.is_unlocked, created_at: r.created_at } as T;
            }
            return null as T | null;
          }
          return null as T | null;
        },
        async all<T = Record<string, unknown>>() {
          if (query.includes("SELECT * FROM divination_orders WHERE user_id = ?")) {
            const results = Array.from(orders.values()).filter((o) => o.user_id === params[0]);
            return { results } as any;
          }
          return { results: [] } as any;
        },
        async run() {
          if (query.includes("INSERT INTO users")) {
            const [id, nickname, wallet, free_quota, is_vip, referral_code, referrer_id, eb, te, tw, ct, ut] = params;
            users.set(id, { id, nickname, wallet_address: wallet, free_quota, is_vip, referral_code, referrer_id, earnings_balance: eb, total_earned: te, total_withdrawn: tw, created_at: ct, updated_at: ut });
            return { meta: { changes: 1 } };
          }
          if (query.includes("UPDATE users SET free_quota = free_quota - 1")) {
            const userId = params[1];
            const u = users.get(userId);
            if (u && u.free_quota > 0) {
              u.free_quota -= 1;
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          if (query.includes("UPDATE users SET referrer_id = ?")) {
            const [refId, ut, uid] = params;
            const u = users.get(uid);
            if (u) {
              u.referrer_id = refId;
              u.updated_at = ut;
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          if (query.includes("UPDATE users\n         SET earnings_balance = earnings_balance + ?")) {
            const [cut, te, ut, uid] = params;
            const u = users.get(uid);
            if (u) {
              u.earnings_balance += cut;
              u.total_earned += te;
              u.updated_at = ut;
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          if (query.includes("INSERT INTO divination_orders")) {
            const [id, user_id, category, subcategory, input_data, price_usdt, pay_type, status, tx_hash, rd_id, rd_cut, ri_id, ri_cut, ct, paid_at] = params;
            orders.set(id, { id, user_id, category, subcategory, input_data, price_usdt, pay_type, status, tx_hash, referrer_direct_id: rd_id, referrer_direct_cut: rd_cut, referrer_indirect_id: ri_id, referrer_indirect_cut: ri_cut, created_at: ct, paid_at });
            return { meta: { changes: 1 } };
          }
          if (query.includes("UPDATE divination_orders SET status = 'COMPLETED'")) {
            const [tx, paidAt, id] = params;
            const o = orders.get(id);
            if (o) {
              o.status = "COMPLETED";
              o.tx_hash = tx;
              o.paid_at = paidAt;
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          if (query.includes("UPDATE divination_reports SET is_unlocked = 1 WHERE order_id = ?")) {
            const orderId = params[0];
            for (const r of reports.values()) {
              if (r.order_id === orderId) {
                r.is_unlocked = 1;
              }
            }
            return { meta: { changes: 1 } };
          }
          return { meta: { changes: 0 } };
        },
      };
      return stmt;
    },
  } as unknown as D1Database;
}

describe("User & Order Service", () => {
  let mockDb: D1Database;
  let mockEnv: Env;

  beforeEach(() => {
    mockDb = createMockD1Database();
    mockEnv = { DB: mockDb };
  });

  it("用户首次通过钱包地址登录，应自动创建账号并赠送 2 次免费额度", async () => {
    const user = await authenticateUser(mockEnv, {
      walletAddress: "0x1234567890abcdef1234567890abcdef12345678",
    });

    expect(user.id).toBe("0x1234567890abcdef1234567890abcdef12345678");
    expect(user.free_quota).toBe(2);
    expect(user.referral_code).toBeDefined();
    expect(user.referral_code.startsWith("TJ")).toBe(true);

    const profile = await getUserProfile(mockEnv, user.id);
    expect(profile?.id).toBe(user.id);
  });

  it("创建订单与通过免费额度支付完成，额度扣减且状态变为 COMPLETED", async () => {
    const user = await authenticateUser(mockEnv, {
      walletAddress: "0xuserA",
    });

    const order = await createDivinationOrder(mockEnv, {
      userId: user.id,
      category: "bazi",
      inputData: { year: 1990 },
      payType: "FREE_QUOTA",
    });

    expect(order.status).toBe("PENDING");
    expect(order.price_usdt).toBe(6.0);

    const payResult = await payOrder(mockEnv, order.id, user.id, "FREE_QUOTA");
    expect(payResult.isUnlocked).toBe(true);
    expect(payResult.order?.status).toBe("COMPLETED");

    // 检查额度已扣减
    const updatedUser = await getUserProfile(mockEnv, user.id);
    expect(updatedUser?.free_quota).toBe(1);
  });

  it("USDT 支付应记录交易哈希，并为推荐人结算 15% 直推佣金", async () => {
    // 邀请人
    const inviter = await authenticateUser(mockEnv, {
      walletAddress: "0xinviter",
    });

    // 受邀新用户
    const invitee = await authenticateUser(mockEnv, {
      walletAddress: "0xinvitee",
      referrerCode: inviter.referral_code,
    });
    expect(invitee.referrer_id).toBe(inviter.id);

    const order = await createDivinationOrder(mockEnv, {
      userId: invitee.id,
      category: "palm_face",
      inputData: {},
      payType: "USDT_TRC20",
    });

    expect(order.referrer_direct_id).toBe(inviter.id);
    expect(order.referrer_direct_cut).toBeCloseTo(6.0 * 0.15); // 0.9 USDT

    // 模拟链上支付完成
    const txHash = "0xtx_hash_mock_123456";
    await payOrder(mockEnv, order.id, invitee.id, "USDT_TRC20", txHash);

    // 验证邀请人佣金到账
    const updatedInviter = await getUserProfile(mockEnv, inviter.id);
    expect(updatedInviter?.earnings_balance).toBeCloseTo(0.9);
    expect(updatedInviter?.total_earned).toBeCloseTo(0.9);
  });

  it("绑定邀请码校验：不可自绑，不可重复绑定", async () => {
    const user = await authenticateUser(mockEnv, {
      walletAddress: "0xuserB",
    });

    // 自绑
    const selfRes = await bindReferrer(mockEnv, user.id, user.referral_code);
    expect(selfRes.success).toBe(false);

    // 绑定其他用户
    const referrer = await authenticateUser(mockEnv, {
      walletAddress: "0xuserRef",
    });
    const validRes = await bindReferrer(mockEnv, user.id, referrer.referral_code);
    expect(validRes.success).toBe(true);

    // 重复绑定
    const againRes = await bindReferrer(mockEnv, user.id, referrer.referral_code);
    expect(againRes.success).toBe(false);
  });

  it("推荐人奖励机制：仅在消费核销时结算，防重复提交校验", async () => {
    // 邀请人
    const inviter = await authenticateUser(mockEnv, {
      walletAddress: "0xinviter_consumetest",
    });

    // 受邀用户
    const invitee = await authenticateUser(mockEnv, {
      walletAddress: "0xinvitee_consumetest",
      referrerCode: inviter.referral_code,
    });

    // 初始状态下邀请人收益为 0
    expect(inviter.earnings_balance).toBe(0);

    // 用户创建订单（尚未支付核销，不应产生奖励）
    const order = await createDivinationOrder(mockEnv, {
      userId: invitee.id,
      category: "bazi",
      inputData: {},
      payType: "USDT_ERC20",
    });

    const preInviter = await getUserProfile(mockEnv, inviter.id);
    expect(preInviter?.earnings_balance).toBe(0);

    // 模拟执行消费核销 (Consume) 支付订单
    const consumeTxHash = "0xconsume_tx_hash_valid_666";
    const payRes = await payOrder(mockEnv, order.id, invitee.id, "USDT_ERC20", consumeTxHash);
    expect(payRes.isUnlocked).toBe(true);

    // 消费后邀请人获得 15% 佣金
    const postInviter = await getUserProfile(mockEnv, inviter.id);
    expect(postInviter?.earnings_balance).toBeCloseTo(0.9);

    // 防重放校验：再次提交相同 consumeTxHash 应被拦截
    const order2 = await createDivinationOrder(mockEnv, {
      userId: invitee.id,
      category: "bazi",
      inputData: {},
      payType: "USDT_ERC20",
    });

    await expect(
      payOrder(mockEnv, order2.id, invitee.id, "USDT_ERC20", consumeTxHash)
    ).rejects.toThrow("严禁重复提交");
  });
});
