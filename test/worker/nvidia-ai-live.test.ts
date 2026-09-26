import { describe, it, expect } from "vitest";
import { submitDivinationOrder, streamDivination, getReportDetails } from "../../src/worker/services/divine-service";
import type { Env } from "../../src/worker/types/env";

function createTestD1(): D1Database {
  const users = new Map<string, any>();
  for (const uid of ["user_vision_live", "user_bazi_live", "user_session_live"]) {
    users.set(uid, {
      id: uid,
      nickname: "测试道友",
      free_quota: 10,
      is_vip: 0,
      referral_code: "TJTEST1",
      referrer_id: null,
      earnings_balance: 0,
      total_earned: 0,
      total_withdrawn: 0,
    });
  }
  const orders = new Map<string, any>();
  const reports = new Map<string, any>();
  const sessions = new Map<string, any>();

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
          if (query.includes("SELECT data FROM ai_sessions WHERE user_id = ? AND session_id = ?")) {
            const [userId, sessionId] = params;
            const key = `${userId}:${sessionId}`;
            const item = sessions.get(key);
            if (!item) return null as T | null;
            return { data: item.data } as T;
          }
          return null as T | null;
        },
        async all<T = Record<string, unknown>>() {
          if (query.includes("SELECT data FROM ai_sessions WHERE user_id = ?")) {
            const [userId] = params;
            const results = Array.from(sessions.values())
              .filter((x) => x.user_id === userId)
              .sort((a, b) => b.updated_at - a.updated_at)
              .map((x) => ({ data: x.data }));
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
          if (query.includes("INSERT INTO ai_sessions")) {
            const [userId, sessionId, data, updatedAt] = params;
            const key = `${userId}:${sessionId}`;
            sessions.set(key, { user_id: userId, session_id: sessionId, data, updated_at: updatedAt });
            return { meta: { changes: 1 } };
          }
          return { meta: { changes: 0 } };
        },
      };
      return stmt;
    },
  } as unknown as D1Database;
}

describe("NVIDIA AI Live Vision & Metaphysics Tests", () => {
  const env: Env = {
    DB: createTestD1(),
    AI_API_KEY: "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",
    OPENAI_API_BASE: "https://integrate.api.nvidia.com/v1",
    DEFAULT_MODEL: "meta/llama-3.2-11b-vision-instruct",
  };

  const sampleImage = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=";

  it(
    "【AI 看相】应支持多模态图像上传并由 meta/llama-3.2-11b-vision-instruct 流式推演入库",
    async () => {
      const order = await submitDivinationOrder(env, {
        userId: "user_vision_live",
        category: "palm_face",
        subcategory: "face_reading",
        inputData: {
          gender: "男",
          notes: "请大师详析三停五官、眼神气色与事业财帛宫位",
          imageBase64: sampleImage,
        },
        payType: "FREE_QUOTA",
      });

      expect(order.orderId).toBeDefined();
      expect(order.isCompleted).toBe(true);

      const orderRecord = await env.DB
        .prepare("SELECT * FROM divination_orders WHERE id = ?")
        .bind(order.orderId)
        .first<any>();

      const stream = streamDivination(env, orderRecord);
      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let sseOutput = "";
      let chunkCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const text = decoder.decode(value);
        sseOutput += text;
        if (text.includes("event: chunk")) chunkCount++;
      }

      if (chunkCount === 0) {
        console.error("DEBUG SSE OUTPUT:", sseOutput);
      }
      expect(chunkCount).toBeGreaterThan(0);
      expect(sseOutput).toContain("event: complete");

      const report = await getReportDetails(env, `REP_${order.orderId}`);
      expect(report).not.toBeNull();
      expect(report?.preview.score).toBeGreaterThan(0);
      expect(report?.preview.title).toBeDefined();
      expect(report?.fullReport?.chapters?.length).toBeGreaterThan(0);
    },
    180000
  );

  it(
    "【八字推测】应结合扩展知识库与真实 AI 流式生成专业分析报告",
    async () => {
      const order = await submitDivinationOrder(env, {
        userId: "user_bazi_live",
        category: "bazi",
        inputData: {
          birthYear: 1993,
          birthMonth: 5,
          birthDay: 12,
          birthHour: 9,
          gender: "乾造",
          notes: "测算事业运与喜用神",
        },
        payType: "FREE_QUOTA",
      });

      const orderRecord = await env.DB
        .prepare("SELECT * FROM divination_orders WHERE id = ?")
        .bind(order.orderId)
        .first<any>();

      const stream = streamDivination(env, orderRecord);
      const reader = stream.getReader();
      let hasChunks = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value && value.length > 0) hasChunks = true;
      }

      const report = await getReportDetails(env, `REP_${order.orderId}`);
      expect(report).not.toBeNull();
      expect(report?.preview.radar?.length).toBeGreaterThanOrEqual(4);
    },
    180000
  );

  it("【知识库 RAG 全面验证】应基于用户门类与诉求精准召回切片与全景 TOC", async () => {
    const { KnowledgeManager } = await import("ai-session");
    const knowledgeBundle = (await import("../../src/worker/ai/knowledge-bundle.json")).default;

    // 1. 验证手相门类精准切片检索
    const palmKm = new KnowledgeManager({
      prompt: "你是相学大师",
      files: (knowledgeBundle as any)["palm_face"],
      mode: "rag",
      maxKnowledgeTokens: 2500,
    });
    const palmContext = await palmKm.buildSystemContext(
      "缘主测算手相，请精析生命线、感情线与断掌事业格局"
    );
    expect(palmContext.systemPrompt).toContain("# Knowledge Base Overview");
    expect(palmContext.systemPrompt).toContain("# Relevant Knowledge Context:");
    expect(palmContext.systemPrompt).toMatch(/palm\/(lifeline|heartline|career)/);
    expect(palmContext.injectedTokens).toBeLessThanOrEqual(2500);

    // 2. 验证八字十神格局精准切片检索
    const baziKm = new KnowledgeManager({
      prompt: "你是子平八字大师",
      files: (knowledgeBundle as any)["bazi"],
      mode: "rag",
      maxKnowledgeTokens: 2500,
    });
    const baziContext = await baziKm.buildSystemContext(
      "缘主生辰八字排盘，请推演十神格局与喜用神强弱"
    );
    expect(baziContext.systemPrompt).toContain("# Knowledge Base Overview");
    expect(baziContext.systemPrompt).toContain("# Relevant Knowledge Context:");
    expect(baziContext.systemPrompt).toMatch(/geju_shensha|shishen_wuxing/);
    expect(baziContext.injectedTokens).toBeLessThanOrEqual(2500);
  });
});
