import type { Env } from "../types/env";
import type { DivinationCategory, PayType, DivinationOrderRow } from "../db/types";
import {
  getOrCreateUser,
  deductFreeQuota,
  createOrder,
  createReport,
  generateOrderId,
  findUserById,
} from "../db";
import {
  getSystemPrompt,
  buildUserDivinationPrompt,
} from "../ai/prompts";
import { createAIClient } from "../ai/client";
import { parseAIOutput, generateFallbackReport } from "../utils/report-parser";
import { formatSSE } from "../utils/sse";
import knowledgeBundle from "../ai/knowledge-bundle.json";

export interface SubmitDivinationParams {
  userId: string;
  category: DivinationCategory;
  subcategory?: string;
  inputData: Record<string, any>;
  payType: PayType;
  txHash?: string;
  referrerCode?: string;
}

/**
 * 提交测算请求并创建初始订单
 */
export async function submitDivinationOrder(
  env: Env,
  params: SubmitDivinationParams
) {
  const user = await getOrCreateUser(env.DB, params.userId, undefined, params.referrerCode);

  let initialStatus: "PENDING" | "COMPLETED" = "PENDING";
  let paidPrice = 6.0;

  if (params.payType === "FREE_QUOTA") {
    paidPrice = 0.0;
    if (user.is_vip === 1) {
      initialStatus = "COMPLETED";
    } else if (user.free_quota > 0) {
      const ok = await deductFreeQuota(env.DB, user.id);
      if (ok) {
        initialStatus = "COMPLETED";
      } else {
        throw new Error("免费测算额度已用尽，请使用 USDT 支付或开通会员");
      }
    } else {
      throw new Error("免费测算额度已用尽，请使用 USDT 支付或开通会员");
    }
  } else if (params.txHash) {
    // 若已附带交易哈希（模拟或链上已广播）
    initialStatus = "COMPLETED";
  }

  let directReferrerId: string | null = user.referrer_id || null;
  let indirectReferrerId: string | null = null;
  if (directReferrerId) {
    const directUser = await findUserById(env.DB, directReferrerId);
    if (directUser && directUser.referrer_id) {
      indirectReferrerId = directUser.referrer_id;
    }
  }

  const directCut = directReferrerId ? paidPrice * 0.15 : 0; // 直推 15%
  const indirectCut = indirectReferrerId ? paidPrice * 0.05 : 0; // 间推 5%

  const orderId = generateOrderId();
  const order: DivinationOrderRow = await createOrder(env.DB, {
    id: orderId,
    user_id: user.id,
    category: params.category,
    subcategory: params.subcategory || null,
    input_data: JSON.stringify(params.inputData),
    price_usdt: paidPrice,
    pay_type: params.payType,
    status: initialStatus,
    tx_hash: params.txHash || null,
    referrer_direct_id: directReferrerId,
    referrer_direct_cut: directCut > 0 ? directCut : null,
    referrer_indirect_id: indirectReferrerId,
    referrer_indirect_cut: indirectCut > 0 ? indirectCut : null,
  });

  return {
    orderId: order.id,
    status: order.status,
    payType: order.pay_type,
    isCompleted: order.status === "COMPLETED",
    userFreeQuota: user.free_quota,
  };
}

/**
 * 获取订单信息
 */
export async function getOrder(env: Env, orderId: string): Promise<DivinationOrderRow | null> {
  return await env.DB
    .prepare("SELECT * FROM divination_orders WHERE id = ?")
    .bind(orderId)
    .first<DivinationOrderRow>();
}

/**
 * 执行流式推演，返回 SSE ReadableStream
 */
export function streamDivination(env: Env, order: DivinationOrderRow): ReadableStream {
  const encoder = new TextEncoder();

  return new ReadableStream({
    async start(controller) {
      try {
        const category = order.category;
        const inputData = JSON.parse(order.input_data);

        // 阶段 1：连接知识库
        controller.enqueue(
          encoder.encode(
            formatSSE("stage", {
              step: 1,
              title: "连接国学典籍与知识库",
              message: "正在检索《麻衣神相》《渊海子平》《奇门遁甲》典籍切片...",
            })
          )
        );

        // 阶段 2：排布命盘
        controller.enqueue(
          encoder.encode(
            formatSSE("stage", {
              step: 2,
              title: "排布全息时空命盘",
              message: "正在推算干支五行、十神生克、九星八门吉凶格局...",
            })
          )
        );

        let finalRawText = "";
        const isLiveAI = Boolean(env.AI_API_KEY && env.AI_API_KEY !== "mock-api-key");

        if (isLiveAI) {
          const ai = createAIClient(env);
          const categoryFiles = (knowledgeBundle as any)[category] || {};

          const session = ai.session({
            userId: order.user_id,
            sessionId: `sess_${order.id}`,
            system: {
              prompt: getSystemPrompt(category),
              files: categoryFiles,
              mode: "rag",
              maxKnowledgeTokens: 2500,
            },
          });

          // 阶段 3：开始流式生成
          controller.enqueue(
            encoder.encode(
              formatSSE("stage", {
                step: 3,
                title: "宗师入神推演中",
                message: "正在推演格局并撰写分章详批报告...",
              })
            )
          );

          const userPrompt = buildUserDivinationPrompt(category, inputData);
          const stream = await session.chatStream(userPrompt);

          for await (const chunk of stream) {
            if (chunk.delta) {
              finalRawText += chunk.delta;
              controller.enqueue(
                encoder.encode(formatSSE("chunk", { text: chunk.delta }))
              );
            }
          }
        } else {
          // 本地测试或无 Key 时的模拟高质量流式推演
          controller.enqueue(
            encoder.encode(
              formatSSE("stage", {
                step: 3,
                title: "宗师入神推演中",
                message: "正在推演格局并撰写分章详批报告...",
              })
            )
          );

          const reportData = generateFallbackReport(category);
          finalRawText = JSON.stringify(reportData, null, 2);

          // 模拟分块推送
          const chunks = [
            `正在排定四柱与五行能量...\n`,
            `当事人综合势能评分: ${reportData.preview.score} 分 (${reportData.preview.rating})\n`,
            `核心总评格局: ${reportData.preview.title}\n`,
            `正在生成分章详批深度报告...\n`,
          ];

          for (const c of chunks) {
            controller.enqueue(encoder.encode(formatSSE("chunk", { text: c })));
          }
        }

        // 解析报告
        const parsedReport = parseAIOutput(finalRawText, category);
        const reportId = `REP_${order.id}`;
        const isUnlocked = order.status === "COMPLETED" ? 1 : 0;

        // 保存报告到 D1
        await createReport(env.DB, {
          id: reportId,
          order_id: order.id,
          user_id: order.user_id,
          category,
          preview_summary: JSON.stringify(parsedReport.preview),
          full_report: JSON.stringify(parsedReport.full_report),
          is_unlocked: isUnlocked,
        });

        // 阶段 4：完成推送
        controller.enqueue(
          encoder.encode(
            formatSSE("complete", {
              reportId,
              orderId: order.id,
              category,
              preview: parsedReport.preview,
              isUnlocked: Boolean(isUnlocked),
            })
          )
        );

        controller.close();
      } catch (err: any) {
        controller.enqueue(
          encoder.encode(formatSSE("error", { message: err.message || "推演中断" }))
        );
        controller.close();
      }
    },
  });
}

/**
 * 查询报告详情（若未解锁则自动对深度章节脱敏）
 */
export async function getReportDetails(env: Env, reportId: string) {
  const report = await env.DB
    .prepare("SELECT * FROM divination_reports WHERE id = ? OR order_id = ?")
    .bind(reportId, reportId)
    .first<any>();

  if (!report) {
    return null;
  }

  const preview = JSON.parse(report.preview_summary);
  let fullReport = null;

  if (report.full_report) {
    const rawFull = JSON.parse(report.full_report);
    if (report.is_unlocked === 1) {
      fullReport = rawFull;
    } else {
      // 未解锁时进行脱敏遮罩处理
      fullReport = {
        overview: rawFull.overview,
        chapters: (rawFull.chapters || []).map((c: any) => ({
          id: c.id,
          title: c.title,
          tag: c.tag,
          content: "🔒 此章节包含深度命盘批断与天机拐点建议，请解锁完整报告查看。",
          isMasked: true,
        })),
        blessingAdvice: [
          "🔒 解锁完整报告查看宗师专属开运锦囊与修德指南",
        ],
      };
    }
  }

  return {
    id: report.id,
    orderId: report.order_id,
    userId: report.user_id,
    category: report.category,
    preview,
    fullReport,
    isUnlocked: report.is_unlocked === 1,
    createdAt: report.created_at,
  };
}
