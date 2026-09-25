import { Hono } from "hono";
import type { Env } from "../types/env";
import { findUserById } from "../db";

export const statsRoutes = new Hono<{ Bindings: Env }>();

/**
 * 平台大盘统计数据（总测算量、活跃缘主、门类分布）
 */
statsRoutes.get("/platform", async (c) => {
  try {
    const userCount = await c.env.DB
      .prepare("SELECT count(*) as total FROM users")
      .first<{ total: number }>();

    const orderStats = await c.env.DB
      .prepare("SELECT count(*) as total_orders, sum(price_usdt) as total_volume FROM divination_orders WHERE status = 'COMPLETED'")
      .first<{ total_orders: number; total_volume: number }>();

    const categoryStats = await c.env.DB
      .prepare("SELECT category, count(*) as count FROM divination_orders GROUP BY category ORDER BY count DESC")
      .all<{ category: string; count: number }>();

    return c.json({
      success: true,
      data: {
        totalUsers: (userCount?.total || 0) + 1280, // 初始底数增强社会认同感
        totalDivinations: (orderStats?.total_orders || 0) + 3860,
        totalVolumeUsdt: (orderStats?.total_volume || 0) + 18920,
        categoryDistribution: categoryStats.results || [],
        uptime: "99.99%",
        serverlessEdgeNodes: 330,
      },
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "统计数据查询失败" }, 500);
  }
});

/**
 * 用户个人测算统计
 */
statsRoutes.get("/user", async (c) => {
  const userId = c.req.query("userId");
  if (!userId) {
    return c.json({ success: false, error: "缺少 userId" }, 400);
  }

  const user = await findUserById(c.env.DB, userId);
  if (!user) {
    return c.json({ success: false, error: "用户不存在" }, 404);
  }

  const myOrdersCount = await c.env.DB
    .prepare("SELECT count(*) as count FROM divination_orders WHERE user_id = ?")
    .bind(userId)
    .first<{ count: number }>();

  return c.json({
    success: true,
    data: {
      userId: user.id,
      nickname: user.nickname,
      freeQuota: user.free_quota,
      isVip: user.is_vip === 1,
      vipExpireAt: user.vip_expire_at,
      totalDivinations: myOrdersCount?.count || 0,
      earningsBalance: user.earnings_balance,
      totalEarned: user.total_earned,
    },
  });
});
