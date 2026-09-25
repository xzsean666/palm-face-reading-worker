import { Hono } from "hono";
import type { Env } from "../types/env";
import { getVipPlans, subscribeVip } from "../services/vip-service";

export const vipRoutes = new Hono<{ Bindings: Env }>();

/**
 * 获取 VIP 会员套餐列表与权益说明
 */
vipRoutes.get("/plans", (c) => {
  return c.json({ success: true, data: getVipPlans() });
});

/**
 * 购买/续费 VIP 会员
 */
vipRoutes.post("/subscribe", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.userId || !body.planKey) {
      return c.json({ success: false, error: "缺少必要参数 (userId, planKey)" }, 400);
    }
    const result = await subscribeVip(c.env, body.userId, body.planKey, body.txHash);
    return c.json({ success: true, data: result });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "VIP 订阅失败" }, 400);
  }
});
