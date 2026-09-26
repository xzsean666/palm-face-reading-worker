import { Hono } from "hono";
import type { Env } from "../types/env";
import {
  createDivinationOrder,
  payOrder,
  getOrderDetails,
  listOrders,
} from "../services/order-service";

export const orderRoutes = new Hono<{ Bindings: Env }>();

const handleCreateOrder = async (c: any) => {
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
};

const handlePayOrder = async (c: any) => {
  try {
    const body = await c.req.json();
    const orderId = c.req.param("id") || body.orderId;
    if (!orderId) {
      return c.json({ success: false, error: "缺少 orderId" }, 400);
    }
    const userId = body.userId || (await getOrderDetails(c.env, orderId))?.user_id;
    if (!userId) {
      return c.json({ success: false, error: "缺少 userId" }, 400);
    }
    const payType = body.payType || (body.txHash ? "USDT_TRC20" : "FREE_QUOTA");
    const result = await payOrder(c.env, orderId, userId, payType, body.txHash);
    return c.json({ success: true, data: result });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "支付处理失败" }, 400);
  }
};

/**
 * 创建测算订单
 */
orderRoutes.post("/", handleCreateOrder);
orderRoutes.post("/create", handleCreateOrder);

/**
 * 订单支付（支持免费额度或 USDT）
 */
orderRoutes.post("/:id/pay", handlePayOrder);
orderRoutes.post("/pay", handlePayOrder);

/**
 * 快速使用免费额度抵扣并解锁
 */
orderRoutes.post("/use-free-quota", async (c) => {
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
      payType: "FREE_QUOTA",
    });
    const result = await payOrder(c.env, order.id, body.userId, "FREE_QUOTA");
    return c.json({ success: true, data: result });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "核销免费额度失败" }, 400);
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
