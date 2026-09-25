import { describe, it, expect, beforeEach } from "vitest";
import { app } from "../../src/worker/index";
import { authenticateUser, getUserProfile, bindReferrer } from "../../src/worker/services/user-service";
import { createDivinationOrder, payOrder, getOrderDetails, listOrders } from "../../src/worker/services/order-service";
import { submitDivinationOrder, streamDivination, getReportDetails } from "../../src/worker/services/divine-service";
import { getPromoteOverview, applyWithdrawal, listUserWithdrawals } from "../../src/worker/services/referral-service";
import { getVipPlans, subscribeVip, isUserVip } from "../../src/worker/services/vip-service";
import type { Env } from "../../src/worker/types/env";

/**
 * 内存级 Mock D1 数据库，全量支持 E2E 业务操作与断言
 */
function createMockD1Database(): D1Database {
  const users = new Map<string, any>();
  const orders = new Map<string, any>();
  const reports = new Map<string, any>();
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
          if (query.includes("SELECT count(*) as total FROM users")) {
            return { total: users.size } as T;
          }
          if (query.includes("SELECT * FROM divination_orders WHERE id = ?")) {
            return (orders.get(params[0]) || null) as T | null;
          }
          if (query.includes("SELECT count(*) as total_orders")) {
            const completed = Array.from(orders.values()).filter((o) => o.status === "COMPLETED");
            const sumVolume = completed.reduce((sum, o) => sum + (o.price_usdt || 0), 0);
            return { total_orders: completed.length, total_volume: sumVolume } as T;
          }
          if (query.includes("SELECT count(*) as count FROM divination_orders WHERE user_id = ?")) {
            const count = Array.from(orders.values()).filter((o) => o.user_id === params[0]).length;
            return { count } as T;
          }
          if (query.includes("SELECT * FROM divination_reports WHERE id = ? OR order_id = ?")) {
            const id = params[0];
            for (const r of reports.values()) {
              if (r.id === id || r.order_id === id) return r as T;
            }
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
          if (query.includes("SELECT id, nickname, created_at, is_vip FROM users WHERE referrer_id = ?")) {
            const results = Array.from(users.values()).filter((u) => u.referrer_id === params[0]);
            return { results } as any;
          }
          if (query.includes("SELECT count(*) as count FROM users WHERE referrer_id IN")) {
            const inMatch = query.match(/IN\s*\(([^)]+)\)/);
            if (inMatch) {
              const ids = inMatch[1].split(",").map((s) => s.trim().replace(/'/g, ""));
              const count = Array.from(users.values()).filter((u) => ids.includes(u.referrer_id)).length;
              return { results: [{ count }] } as any;
            }
            return { results: [{ count: 0 }] } as any;
          }
          if (query.includes("SELECT * FROM divination_orders WHERE user_id = ?")) {
            const results = Array.from(orders.values()).filter((o) => o.user_id === params[0]);
            return { results } as any;
          }
          if (query.includes("SELECT category, count(*) as count FROM divination_orders")) {
            const map = new Map<string, number>();
            for (const o of orders.values()) {
              map.set(o.category, (map.get(o.category) || 0) + 1);
            }
            const results = Array.from(map.entries()).map(([category, count]) => ({ category, count }));
            return { results } as any;
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
            users.set(id, {
              id,
              nickname,
              wallet_address: wallet,
              free_quota,
              is_vip,
              vip_expire_at: null,
              referral_code,
              referrer_id,
              earnings_balance: eb,
              total_earned: te,
              total_withdrawn: tw,
              created_at: ct,
              updated_at: ut,
            });
            return { meta: { changes: 1 } };
          }
          if (query.includes("UPDATE users SET free_quota = free_quota - 1")) {
            const userId = params[1];
            const u = users.get(userId);
            if (u && u.free_quota > 0) {
              u.free_quota -= 1;
              u.updated_at = params[0];
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
          if (query.includes("earnings_balance = earnings_balance + ?")) {
            const [cut, te, ut, uid] = params;
            const u = users.get(uid);
            if (u) {
              u.earnings_balance = (u.earnings_balance || 0) + cut;
              u.total_earned = (u.total_earned || 0) + te;
              u.updated_at = ut;
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          if (query.includes("earnings_balance = earnings_balance - ?")) {
            const [amt, tw, ut, uid, checkAmt] = params;
            const u = users.get(uid);
            if (u && u.earnings_balance >= checkAmt) {
              u.earnings_balance -= amt;
              u.total_withdrawn = (u.total_withdrawn || 0) + tw;
              u.updated_at = ut;
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
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
          if (query.includes("INSERT INTO divination_orders")) {
            const [id, user_id, category, subcategory, input_data, price_usdt, pay_type, status, tx_hash, rd_id, rd_cut, ri_id, ri_cut, ct, paid_at] = params;
            orders.set(id, {
              id,
              user_id,
              category,
              subcategory,
              input_data,
              price_usdt,
              pay_type,
              status,
              tx_hash,
              referrer_direct_id: rd_id,
              referrer_direct_cut: rd_cut,
              referrer_indirect_id: ri_id,
              referrer_indirect_cut: ri_cut,
              created_at: ct,
              paid_at,
            });
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
          if (query.includes("INSERT INTO divination_reports")) {
            const [id, order_id, user_id, category, preview_summary, full_report, is_unlocked, ct] = params;
            reports.set(id, {
              id,
              order_id,
              user_id,
              category,
              preview_summary,
              full_report,
              is_unlocked,
              created_at: ct,
            });
            return { meta: { changes: 1 } };
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
          if (query.includes("INSERT INTO withdrawals")) {
            const [id, user_id, amount, fee, actual_amount, payout_address, status, tx_hash, created_at, reviewed_at] = params;
            withdrawals.set(id, {
              id,
              user_id,
              amount,
              fee,
              actual_amount,
              payout_address,
              status,
              tx_hash,
              created_at,
              reviewed_at,
            });
            return { meta: { changes: 1 } };
          }
          return { meta: { changes: 0 } };
        },
      };
      return stmt;
    },
  } as unknown as D1Database;
}

describe("E2E 全链路集成测试 (Tianji Divination Full Lifecycle)", () => {
  let mockDb: D1Database;
  let mockEnv: Env;

  beforeEach(() => {
    mockDb = createMockD1Database();
    mockEnv = {
      DB: mockDb,
      AI_API_KEY: "mock-api-key",
    };
  });

  it("1. 边缘健康检查与状态探测", async () => {
    const res = await app.request("/api/health");
    expect(res.status).toBe(200);
    const data = (await res.json()) as any;
    expect(data.status).toBe("ok");
    expect(data.service).toBe("tianji-divination-worker");
    expect(data.edge).toBe(true);
  });

  it("2. 用户匿名/钱包鉴权、2次初始免费额度、邀请码生成与直属推荐人绑定", async () => {
    // 祖父 A (顶级推广人)
    const userA = await authenticateUser(mockEnv, { guestId: "agent_grandpa" });
    expect(userA.free_quota).toBe(2);
    expect(userA.referral_code).toMatch(/^TJ[A-Z0-9]{5}$/);

    // 父亲 B (被 A 邀请)
    const userB = await authenticateUser(mockEnv, {
      guestId: "agent_father",
      referrerCode: userA.referral_code,
    });
    expect(userB.referrer_id).toBe(userA.id);
    expect(userB.free_quota).toBe(2);

    // 儿子 C (钱包地址登录，被 B 邀请)
    const userC = await authenticateUser(mockEnv, {
      walletAddress: "0xCustomerSonAddress1234567890abcdef",
      referrerCode: userB.referral_code,
    });
    expect(userC.id).toBe("0xcustomersonaddress1234567890abcdef");
    expect(userC.referrer_id).toBe(userB.id);

    // 验证个人资料拉取
    const profile = await getUserProfile(mockEnv, userC.id);
    expect(profile?.id).toBe(userC.id);
    expect(profile?.earnings_balance).toBe(0);
  });

  it("3. 十大门类推演、免费额度扣减、报告生成与脱敏权限控制", async () => {
    const seeker = await authenticateUser(mockEnv, { guestId: "seeker_01" });
    expect(seeker.free_quota).toBe(2);

    // 提交生辰八字推演 (使用免费额度)
    const baziResult = await submitDivinationOrder(mockEnv, {
      userId: seeker.id,
      category: "bazi",
      subcategory: "八字排盘",
      inputData: { birthYear: 1996, birthMonth: 8, birthDay: 18, birthHour: 12, gender: "乾造" },
      payType: "FREE_QUOTA",
    });

    expect(baziResult.orderId).toBeDefined();
    expect(baziResult.isCompleted).toBe(true);
    expect(baziResult.userFreeQuota).toBe(1); // 扣减 1 次

    // 执行流式推演生成报告入库
    const order = await mockDb
      .prepare("SELECT * FROM divination_orders WHERE id = ?")
      .bind(baziResult.orderId)
      .first<any>();
    expect(order).toBeDefined();

    const stream = streamDivination(mockEnv, order);
    const reader = stream.getReader();
    while (true) {
      const { done } = await reader.read();
      if (done) break;
    }

    // 查询报告详情 (已解锁)
    const reportUnlocked = await getReportDetails(mockEnv, baziResult.orderId);
    expect(reportUnlocked).toBeDefined();
    expect(reportUnlocked?.isUnlocked).toBe(true);
    expect(reportUnlocked?.fullReport).toBeDefined();

    // 再次提交紫微斗数测算 (消耗第 2 次免费额度)
    const ziweiResult = await submitDivinationOrder(mockEnv, {
      userId: seeker.id,
      category: "ziwei",
      inputData: { birthDate: "1996-08-18", calendar: "solar" },
      payType: "FREE_QUOTA",
    });
    expect(ziweiResult.userFreeQuota).toBe(0);

    // 免费额度耗尽后，若继续尝试 FREE_QUOTA 支付应被拒绝
    await expect(
      submitDivinationOrder(mockEnv, {
        userId: seeker.id,
        category: "tarot",
        inputData: { question: "年内事业财运走势" },
        payType: "FREE_QUOTA",
      })
    ).rejects.toThrow("免费测算额度已用尽");
  });

  it("4. USDT 订单支付状态机流转与两级分润结算 (直推 15% / 间推 5%)", async () => {
    // 建立三级关系：Grandpa -> Father -> Son
    const grandpa = await authenticateUser(mockEnv, { guestId: "agent_grandpa_usdt" });
    const father = await authenticateUser(mockEnv, {
      guestId: "agent_father_usdt",
      referrerCode: grandpa.referral_code,
    });
    const son = await authenticateUser(mockEnv, {
      guestId: "customer_son_usdt",
      referrerCode: father.referral_code,
    });

    // 儿子创建 6 USDT 手相面相大模型高级测算订单
    const order = await createDivinationOrder(mockEnv, {
      userId: son.id,
      category: "palm",
      subcategory: "生命线与事业线解析",
      inputData: { image: "data:image/jpeg;base64,mockpalmdata" },
      payType: "USDT_TRC20",
    });

    expect(order.status).toBe("PENDING");
    expect(order.price_usdt).toBe(6.0);
    expect(order.referrer_direct_id).toBe(father.id);
    expect(order.referrer_direct_cut).toBeCloseTo(0.9, 2); // 6 * 15% = 0.90
    expect(order.referrer_indirect_id).toBe(grandpa.id);
    expect(order.referrer_indirect_cut).toBeCloseTo(0.3, 2); // 6 * 5% = 0.30

    // 模拟区块链到账后确认支付
    const payResult = await payOrder(mockEnv, order.id, son.id, "USDT_TRC20", "0xtxhash_palm_6u");
    expect(payResult.isUnlocked).toBe(true);
    expect(payResult.order?.status).toBe("COMPLETED");

    // 验证直推人 Father 获得 0.90 USDT
    const fatherProfile = await getUserProfile(mockEnv, father.id);
    expect(fatherProfile?.earnings_balance).toBeCloseTo(0.9, 2);
    expect(fatherProfile?.total_earned).toBeCloseTo(0.9, 2);

    // 验证间推人 Grandpa 获得 0.30 USDT
    const grandpaProfile = await getUserProfile(mockEnv, grandpa.id);
    expect(grandpaProfile?.earnings_balance).toBeCloseTo(0.3, 2);
    expect(grandpaProfile?.total_earned).toBeCloseTo(0.3, 2);

    // 验证推广中心概览统计
    const fatherOverview = await getPromoteOverview(mockEnv, father.id);
    expect(fatherOverview.directCount).toBe(1);
    expect(fatherOverview.earningsBalance).toBeCloseTo(0.9, 2);
  });

  it("5. 满 10 USDT 提现门槛校验与原子级扣减", async () => {
    const agent = await authenticateUser(mockEnv, { guestId: "withdraw_partner" });

    // 1) 余额为 0 时申请提现必须抛出余额不足异常
    await expect(
      applyWithdrawal(mockEnv, agent.id, 10, "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t")
    ).rejects.toThrow("可提现余额不足");

    // 2) 提现金额小于最低限额 10 USDT 时必须被拦截
    await expect(
      applyWithdrawal(mockEnv, agent.id, 5, "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t")
    ).rejects.toThrow("最低提现金额为 10 USDT");

    // 3) 模拟为其累计充值 25 USDT 推广佣金
    await mockDb
      .prepare(
        `UPDATE users
         SET earnings_balance = earnings_balance + ?,
             total_earned = total_earned + ?,
             updated_at = ?
         WHERE id = ?`
      )
      .bind(25, 25, Math.floor(Date.now() / 1000), agent.id)
      .run();

    const readyAgent = await getUserProfile(mockEnv, agent.id);
    expect(readyAgent?.earnings_balance).toBe(25);

    // 4) 申请提现 10 USDT
    const withdrawal = await applyWithdrawal(
      mockEnv,
      agent.id,
      10,
      "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t"
    );
    expect(withdrawal.amount).toBe(10);
    expect(withdrawal.status).toBe("PENDING");

    // 5) 校验余额原子扣减为 15 USDT，累计已提现变为 10 USDT
    const afterAgent = await getUserProfile(mockEnv, agent.id);
    expect(afterAgent?.earnings_balance).toBe(15);
    expect(afterAgent?.total_withdrawn).toBe(9); // 10 - 1 fee = 9

    // 6) 校验提现历史记录明细
    const wList = await listUserWithdrawals(mockEnv, agent.id);
    expect(wList.length).toBe(1);
    expect(wList[0].amount).toBe(10);
    expect(wList[0].payout_address).toBe("TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t");
  });

  it("6. VIP 季度/年度订阅与无限免费测算特权", async () => {
    const vipUser = await authenticateUser(mockEnv, { guestId: "vip_seeker" });
    expect(vipUser.is_vip).toBe(0);

    // 查看 VIP 套餐列表
    const plans = getVipPlans();
    expect(plans.length).toBe(3);
    expect(plans[1].key).toBe("quarterly");
    expect(plans[1].price).toBe(69.0);

    // 购买季度 VIP (90 天)
    const vipResult = await subscribeVip(mockEnv, vipUser.id, "quarterly", "0xvip_tx_hash_199");
    expect(vipResult.user?.is_vip).toBe(1);
    expect(vipResult.expireAt).toBeGreaterThan(Date.now());

    // 确认 VIP 身份已生效
    const isVipNow = await isUserVip(mockEnv, vipUser.id);
    expect(isVipNow).toBe(true);
  });

  it("7. HTTP 接口级链路贯通 (app.fetch 路由联调)", async () => {
    // 1) 平台大盘统计接口
    const statsReq = new Request("http://localhost/api/stats/platform");
    const statsRes = await app.fetch(statsReq, mockEnv);
    expect(statsRes.status).toBe(200);
    const statsJson = (await statsRes.json()) as any;
    expect(statsJson.success).toBe(true);
    expect(statsJson.data.serverlessEdgeNodes).toBe(330);

    // 2) 用户鉴权接口
    const authReq = new Request("http://localhost/api/user/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId: "http_client_user" }),
    });
    const authRes = await app.fetch(authReq, mockEnv);
    expect(authRes.status).toBe(200);
    const authJson = (await authRes.json()) as any;
    expect(authJson.success).toBe(true);
    expect(authJson.data.free_quota).toBe(2);

    // 3) 用户信息查询接口
    const profReq = new Request(`http://localhost/api/user/profile?userId=${authJson.data.id}`);
    const profRes = await app.fetch(profReq, mockEnv);
    expect(profRes.status).toBe(200);
    const profJson = (await profRes.json()) as any;
    expect(profJson.data.id).toBe(authJson.data.id);

    // 4) 提交测算接口
    const submitReq = new Request("http://localhost/api/divine/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: authJson.data.id,
        category: "zhouyi",
        inputData: { question: "出行求财" },
        payType: "FREE_QUOTA",
      }),
    });
    const submitRes = await app.fetch(submitReq, mockEnv);
    expect(submitRes.status).toBe(200);
    const submitJson = (await submitRes.json()) as any;
    expect(submitJson.success).toBe(true);
    expect(submitJson.data.orderId).toBeDefined();

    // 5) VIP 套餐接口
    const vipReq = new Request("http://localhost/api/vip/plans");
    const vipRes = await app.fetch(vipReq, mockEnv);
    expect(vipRes.status).toBe(200);
    const vipJson = (await vipRes.json()) as any;
    expect(vipJson.success).toBe(true);
    expect(vipJson.data.length).toBe(3);
  });
});
