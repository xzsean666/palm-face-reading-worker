import { describe, it, expect, beforeEach } from "vitest";
import { authenticateUser, getUserProfile } from "../../src/worker/services/user-service";
import { subscribeVip, getVipPlans } from "../../src/worker/services/vip-service";
import { getPromoteOverview, applyWithdrawal, listUserWithdrawals } from "../../src/worker/services/referral-service";
import type { Env } from "../../src/worker/types/env";

function createMockD1Database(): D1Database {
  const users = new Map<string, any>();
  const withdrawals = new Map<string, any>();

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
          return null as T | null;
        },
        async all<T = Record<string, unknown>>() {
          if (query.includes("SELECT id, nickname, created_at, is_vip FROM users WHERE referrer_id = ?")) {
            const results = Array.from(users.values()).filter((u) => u.referrer_id === params[0]);
            return { results } as any;
          }
          if (query.includes("WHERE referrer_id IN (SELECT id FROM users WHERE referrer_id = ?)")) {
            const directIds = Array.from(users.values())
              .filter((u) => u.referrer_id === params[0])
              .map((u) => u.id);
            const count = Array.from(users.values()).filter((u) => directIds.includes(u.referrer_id)).length;
            return { results: [{ count }] } as any;
          }
          if (query.includes("SELECT count(*) as count FROM users WHERE referrer_id IN")) {
            // 解析 IN ( ... )
            const inMatch = query.match(/IN\s*\(([^)]+)\)/);
            if (inMatch) {
              const ids = inMatch[1].split(",").map((s) => s.trim().replace(/'/g, ""));
              const count = Array.from(users.values()).filter((u) => ids.includes(u.referrer_id)).length;
              return { results: [{ count }] } as any;
            }
            return { results: [{ count: 0 }] } as any;
          }
          if (query.includes("SELECT * FROM withdrawals WHERE user_id = ?")) {
            const results = Array.from(withdrawals.values()).filter((w) => w.user_id === params[0]);
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
          if (query.includes("UPDATE users SET is_vip = 1, vip_expire_at = ?")) {
            const [exp, ut, uid] = params;
            const u = users.get(uid);
            if (u) {
              u.is_vip = 1;
              u.vip_expire_at = exp;
              u.updated_at = ut;
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          if (query.includes("UPDATE users") && query.includes("earnings_balance = earnings_balance + ?")) {
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
          if (query.includes("UPDATE users") && query.includes("earnings_balance = earnings_balance - ?")) {
            const [amt, tw, ut, uid, checkAmt] = params;
            const u = users.get(uid);
            if (u && u.earnings_balance >= checkAmt) {
              u.earnings_balance -= amt;
              u.total_withdrawn += tw;
              u.updated_at = ut;
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          if (query.includes("INSERT INTO withdrawals")) {
            const [id, user_id, amount, fee, actual_amount, payout_address, status, tx_hash, created_at, reviewed_at] = params;
            withdrawals.set(id, { id, user_id, amount, fee, actual_amount, payout_address, status, tx_hash, created_at, reviewed_at });
            return { meta: { changes: 1 } };
          }
          if (query.includes("UPDATE users SET wallet_address = ?, referrer_id = ?")) {
            const [wallet, refId, ut, uid] = params;
            const u = users.get(uid);
            if (u) {
              if (wallet) u.wallet_address = wallet;
              if (refId) u.referrer_id = refId;
              u.updated_at = ut;
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          return { meta: { changes: 0 } };
        },
      };
      return stmt;
    },
  } as unknown as D1Database;
}

describe("VIP & Referral System", () => {
  let mockDb: D1Database;
  let mockEnv: Env;

  beforeEach(() => {
    mockDb = createMockD1Database();
    mockEnv = { DB: mockDb };
  });

  it("VIP 方案应具备月/季/年三档并能正确订阅", async () => {
    const plans = getVipPlans();
    expect(plans).toHaveLength(3);

    const user = await authenticateUser(mockEnv, { walletAddress: "0xvip_user" });
    const sub = await subscribeVip(mockEnv, user.id, "monthly");
    expect(sub.user?.is_vip).toBe(1);
    expect(sub.expireAt).toBeGreaterThan(Date.now());
  });

  it("下级购买 VIP 应触发直推 15% 与间推 5% 佣金结算", async () => {
    // 爷爷 (间推)
    const grand = await authenticateUser(mockEnv, { walletAddress: "0xgrand" });
    // 父亲 (直推)
    const father = await authenticateUser(mockEnv, {
      walletAddress: "0xfather",
      referrerCode: grand.referral_code,
    });
    // 儿子 (购买人)
    const son = await authenticateUser(mockEnv, {
      walletAddress: "0xson",
      referrerCode: father.referral_code,
    });

    // 儿子购买月度会员 (29 USDT)
    await subscribeVip(mockEnv, son.id, "monthly");

    // 父亲获得直推 15%: 29 * 0.15 = 4.35 USDT
    const updatedFather = await getUserProfile(mockEnv, father.id);
    expect(updatedFather?.earnings_balance).toBeCloseTo(4.35);

    // 爷爷获得间推 5%: 29 * 0.05 = 1.45 USDT
    const updatedGrand = await getUserProfile(mockEnv, grand.id);
    expect(updatedGrand?.earnings_balance).toBeCloseTo(1.45);
  });

  it("推广概览应正确统计直推与间推队伍人数", async () => {
    const leader = await authenticateUser(mockEnv, { walletAddress: "0xleader" });
    const member1 = await authenticateUser(mockEnv, { walletAddress: "0xm1", referrerCode: leader.referral_code });
    await authenticateUser(mockEnv, { walletAddress: "0xm2", referrerCode: leader.referral_code });
    // member1 邀请下级 (对 leader 属于间推)
    await authenticateUser(mockEnv, { walletAddress: "0xsub_m1", referrerCode: member1.referral_code });

    const overview = await getPromoteOverview(mockEnv, leader.id);
    expect(overview.directCount).toBe(2);
    expect(overview.indirectCount).toBe(1);
    expect(overview.totalTeamCount).toBe(3);
  });

  it("提现申请校验与余额扣减", async () => {
    const user = await authenticateUser(mockEnv, { walletAddress: "0xearner" });
    // 模拟充入 50 USDT 佣金余额
    const u = (mockDb as any);
    await mockDb.prepare("UPDATE users\n           SET earnings_balance = earnings_balance + ?, total_earned = total_earned + ?, updated_at = ? WHERE id = ?")
      .bind(50, 50, Date.now(), user.id)
      .run();

    // 提现 < 10 USDT 应被拒绝
    await expect(applyWithdrawal(mockEnv, user.id, 5, "TRC20_WALLET_ADDRESS_12345")).rejects.toThrow("最低提现金额为 10 USDT");

    // 提现 > 余额应被拒绝
    await expect(applyWithdrawal(mockEnv, user.id, 100, "TRC20_WALLET_ADDRESS_12345")).rejects.toThrow("可提现余额不足");

    // 正常提现 20 USDT (扣 1 USDT 手续费，到账 19)
    const withdrawal = await applyWithdrawal(mockEnv, user.id, 20, "TRC20_WALLET_ADDRESS_12345");
    expect(withdrawal.amount).toBe(20);
    expect(withdrawal.fee).toBe(1);
    expect(withdrawal.actual_amount).toBe(19);
    expect(withdrawal.status).toBe("PENDING");

    // 检查剩余余额为 30 USDT
    const updated = await getUserProfile(mockEnv, user.id);
    expect(updated?.earnings_balance).toBe(30);

    // 查询提现记录
    const list = await listUserWithdrawals(mockEnv, user.id);
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(withdrawal.id);
  });

  it("首次连接钱包支持可选邀请码（选填），且支持小写推荐码自动规范化绑定", async () => {
    // 1. 创建上级推荐人
    const inviter = await authenticateUser(mockEnv, { walletAddress: "0xinviter_wallet" });
    expect(inviter.referral_code).toBeDefined();

    // 2. 新用户 A：不填邀请码连接钱包（可选特性验证）
    const userWithoutCode = await authenticateUser(mockEnv, { walletAddress: "0xuser_no_code" });
    expect(userWithoutCode.wallet_address).toBe("0xuser_no_code");
    expect(userWithoutCode.free_quota).toBe(2);
    expect(userWithoutCode.referrer_id).toBeNull();

    // 3. 新用户 B：填写小写邀请码连接钱包（规范化与结缘验证）
    const lowerCode = inviter.referral_code.toLowerCase();
    const userWithCode = await authenticateUser(mockEnv, {
      walletAddress: "0xuser_with_code",
      referrerCode: lowerCode,
    });
    expect(userWithCode.wallet_address).toBe("0xuser_with_code");
    expect(userWithCode.free_quota).toBe(2);
    expect(userWithCode.referrer_id).toBe(inviter.id);

    // 4. 用户 A 后续补绑邀请码（二次登录/补填绑定）
    const userAUpdated = await authenticateUser(mockEnv, {
      walletAddress: "0xuser_no_code",
      referrerCode: inviter.referral_code,
    });
    expect(userAUpdated.referrer_id).toBe(inviter.id);
  });
});
