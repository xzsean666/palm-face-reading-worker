import { Hono } from "hono";
import type { Env } from "../types/env";
import {
  createDivinationOrder,
  payOrder,
  getOrderDetails,
  listOrders,
} from "../services/order-service";

export const orderRoutes = new Hono<{ Bindings: Env }>();

/**
 * 创建测算订单
 */
orderRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.userId || !body.category) {
      return c.json({ success: false, error: "缺少必要参数 (userId, category)" }, 400);
    }
    const order = await createDivinationOrder(c.env, {
      userId: body.userId,
      category: body.category,
      subcategory: body.subcategory,
      inputData: body.inputData || {},
      payType: body.payType,
      referrerCode: body.referrerCode,
    });
    return c.json({ success: true, data: order });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "创建订单失败" }, 400);
  }
});

/**
 * 订单支付（支持免费额度或 USDT）
 */
orderRoutes.post("/:id/pay", async (c) => {
  try {
    const orderId = c.req.param("id");
    const body = await c.req.json();
    if (!body.userId || !body.payType) {
      return c.json({ success: false, error: "缺少必要参数 (userId, payType)" }, 400);
    }
    const result = await payOrder(c.env, orderId, body.userId, body.payType, body.txHash);
    return c.json({ success: true, data: result });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "支付处理失败" }, 400);
  }
});

/**
 * 查询指定订单详情
 */
orderRoutes.get("/:id", async (c) => {
  const orderId = c.req.param("id");
  const userId = c.req.query("userId");
  const order = await getOrderDetails(c.env, orderId, userId);
  if (!order) {
    return c.json({ success: false, error: "订单不存在" }, 404);
  }
  return c.json({ success: true, data: order });
});

/**
 * 查询用户订单历史列表
 */
orderRoutes.get("/", async (c) => {
  const userId = c.req.query("userId");
  if (!userId) {
    return c.json({ success: false, error: "缺少 userId" }, 400);
  }
  const orders = await listOrders(c.env, userId);
  return c.json({ success: true, data: orders });
});
