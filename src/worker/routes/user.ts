import { Hono } from "hono";
import type { Env } from "../types/env";
import { authenticateUser, getUserProfile, bindReferrer } from "../services/user-service";

export const userRoutes = new Hono<{ Bindings: Env }>();

/**
 * 用户鉴权登录（支持钱包连接或游客进入）
 */
userRoutes.post("/auth", async (c) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const user = await authenticateUser(c.env, {
      walletAddress: body.walletAddress,
      guestId: body.guestId,
      referrerCode: body.referrerCode,
    });
    return c.json({ success: true, data: user });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "登录失败" }, 400);
  }
});

/**
 * 获取当前用户资料与资产
 */
userRoutes.get("/profile", async (c) => {
  const userId = c.req.query("userId");
  if (!userId) {
    return c.json({ success: false, error: "缺少 userId" }, 400);
  }
  const profile = await getUserProfile(c.env, userId);
  if (!profile) {
    return c.json({ success: false, error: "用户不存在" }, 404);
  }
  return c.json({ success: true, data: profile });
});

/**
 * 绑定邀请人推荐码
 */
userRoutes.post("/bind-referrer", async (c) => {
  try {
    const body = await c.req.json();
    if (!body.userId || !body.referrerCode) {
      return c.json({ success: false, error: "缺少必要参数" }, 400);
    }
    const result = await bindReferrer(c.env, body.userId, body.referrerCode);
    return c.json({ success: result.success, message: result.message });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "绑定失败" }, 400);
  }
});
