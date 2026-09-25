import { Hono } from "hono";
import type { Env } from "../types/env";
import {
  submitDivinationOrder,
  getOrder,
  streamDivination,
  getReportDetails,
} from "../services/divine-service";
import { getSSEHeaders } from "../utils/sse";

export const divineRoutes = new Hono<{ Bindings: Env }>();

/**
 * 提交测算表单并创建订单
 */
divineRoutes.post("/submit", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.category || !body.userId) {
      return c.json({ success: false, error: "缺少必要参数 (category, userId)" }, 400);
    }

    const result = await submitDivinationOrder(c.env, {
      userId: body.userId,
      category: body.category,
      subcategory: body.subcategory,
      inputData: body.inputData || {},
      payType: body.payType || "FREE_QUOTA",
      txHash: body.txHash,
      referrerCode: body.referrerCode,
    });

    return c.json({ success: true, data: result });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "提交测算失败" }, 400);
  }
});

/**
 * SSE 实时流式推演
 */
divineRoutes.get("/stream", async (c) => {
  const orderId = c.req.query("orderId");
  if (!orderId) {
    return c.text("缺少 orderId 参数", 400);
  }

  const order = await getOrder(c.env, orderId);
  if (!order) {
    return c.text("订单不存在", 404);
  }

  const stream = streamDivination(c.env, order);
  return new Response(stream, {
    headers: getSSEHeaders(),
  });
});

/**
 * 查询报告详情（自动根据解锁状态脱敏）
 */
divineRoutes.get("/report/:id", async (c) => {
  const id = c.req.param("id");
  const report = await getReportDetails(c.env, id);
  if (!report) {
    return c.json({ success: false, error: "报告不存在" }, 404);
  }
  return c.json({ success: true, data: report });
});

/**
 * 查询订单对应的报告预览
 */
divineRoutes.get("/preview/:orderId", async (c) => {
  const orderId = c.req.param("orderId");
  const report = await getReportDetails(c.env, orderId);
  if (!report) {
    return c.json({ success: false, error: "预览报告尚未生成或不存在" }, 404);
  }
  return c.json({
    success: true,
    data: {
      orderId: report.orderId,
      reportId: report.id,
      category: report.category,
      preview: report.preview,
      isUnlocked: report.isUnlocked,
    },
  });
});
