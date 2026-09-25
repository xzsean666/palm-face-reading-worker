import { describe, it, expect, beforeEach } from "vitest";
import { submitDivinationOrder, streamDivination, getReportDetails } from "../../src/worker/services/divine-service";
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
          if (query.includes("SELECT * FROM divination_reports WHERE id = ? OR order_id = ?")) {
            const id = params[0];
            for (const r of reports.values()) {
              if (r.id === id || r.order_id === id) return r as T;
            }
            return null as T | null;
          }
          return null as T | null;
        },
        async all<T = Record<string, unknown>>() {
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
          if (query.includes("INSERT INTO divination_orders")) {
            const [id, user_id, category, subcategory, input_data, price_usdt, pay_type, status, tx_hash, rd_id, rd_cut, ri_id, ri_cut, ct, paid_at] = params;
            orders.set(id, { id, user_id, category, subcategory, input_data, price_usdt, pay_type, status, tx_hash, referrer_direct_id: rd_id, referrer_direct_cut: rd_cut, referrer_indirect_id: ri_id, referrer_indirect_cut: ri_cut, created_at: ct, paid_at });
            return { meta: { changes: 1 } };
          }
          if (query.includes("INSERT INTO divination_reports")) {
            const [id, order_id, user_id, category, preview_summary, full_report, is_unlocked, ct] = params;
            reports.set(id, { id, order_id, user_id, category, preview_summary, full_report, is_unlocked, created_at: ct });
            return { meta: { changes: 1 } };
          }
          return { meta: { changes: 0 } };
        },
      };
      return stmt;
    },
  } as unknown as D1Database;
}

describe("Divination Service & API", () => {
  let mockDb: D1Database;
  let mockEnv: Env;

  beforeEach(() => {
    mockDb = createMockD1Database();
    mockEnv = {
      DB: mockDb,
      AI_API_KEY: "mock-api-key",
    };
  });

  it("新用户初次提交免费测算应成功并扣减 1 次额度", async () => {
    const res = await submitDivinationOrder(mockEnv, {
      userId: "user_alice",
      category: "bazi",
      inputData: { birthYear: 1995, birthMonth: 6, birthDay: 18, birthHour: 10, gender: "男" },
      payType: "FREE_QUOTA",
    });

    expect(res.orderId).toBeDefined();
    expect(res.orderId.startsWith("TJ")).toBe(true);
    expect(res.isCompleted).toBe(true);
    expect(res.userFreeQuota).toBe(1); // 2 - 1 = 1
  });

  it("当免费额度耗尽且未支付时，应抛出额度不足异常", async () => {
    // 第一次
    await submitDivinationOrder(mockEnv, {
      userId: "user_bob",
      category: "name_test",
      inputData: { name: "李寻欢" },
      payType: "FREE_QUOTA",
    });
    // 第二次
    await submitDivinationOrder(mockEnv, {
      userId: "user_bob",
      category: "name_test",
      inputData: { name: "李寻欢" },
      payType: "FREE_QUOTA",
    });

    // 第三次应报错
    await expect(
      submitDivinationOrder(mockEnv, {
        userId: "user_bob",
        category: "name_test",
        inputData: { name: "李寻欢" },
        payType: "FREE_QUOTA",
      })
    ).rejects.toThrow("免费测算额度已用尽");
  });

  it("执行流式推演应输出 SSE 事件并在 D1 中持久化报告", async () => {
    const orderRes = await submitDivinationOrder(mockEnv, {
      userId: "user_charlie",
      category: "palm_face",
      inputData: { gender: "女", notes: "测算事业运与财运" },
      payType: "FREE_QUOTA",
    });

    const order = await mockEnv.DB
      .prepare("SELECT * FROM divination_orders WHERE id = ?")
      .bind(orderRes.orderId)
      .first<any>();

    const stream = streamDivination(mockEnv, order);
    const reader = stream.getReader();
    const decoder = new TextDecoder();
    let accumulated = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      accumulated += decoder.decode(value);
    }

    expect(accumulated).toContain("event: stage");
    expect(accumulated).toContain("event: chunk");
    expect(accumulated).toContain("event: complete");

    // 验证报告已在 D1 中入库
    const report = await getReportDetails(mockEnv, `REP_${order.id}`);
    expect(report).not.toBeNull();
    expect(report?.isUnlocked).toBe(true);
    expect(report?.preview.score).toBeGreaterThan(0);
    expect(report?.fullReport.chapters.length).toBeGreaterThan(0);
  });

  it("未解锁报告查询应安全脱敏 chapters 深度内容", async () => {
    // 提交未支付订单
    const orderRes = await submitDivinationOrder(mockEnv, {
      userId: "user_david",
      category: "qimen_decision",
      inputData: { question: "求职决策" },
      payType: "USDT_TRC20",
    });

    const order = await mockEnv.DB
      .prepare("SELECT * FROM divination_orders WHERE id = ?")
      .bind(orderRes.orderId)
      .first<any>();

    const stream = streamDivination(mockEnv, order);
    const reader = stream.getReader();
    while (true) {
      const { done } = await reader.read();
      if (done) break;
    }

    // 查询报告
    const report = await getReportDetails(mockEnv, `REP_${order.id}`);
    expect(report).not.toBeNull();
    expect(report?.isUnlocked).toBe(false);
    // 验证内容被脱敏遮罩
    expect(report?.fullReport.chapters[0].content).toContain("🔒");
    expect(report?.fullReport.chapters[0].isMasked).toBe(true);
  });
});
