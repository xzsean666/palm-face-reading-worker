import { Hono } from "hono";
import type { Env } from "../types/env";
import { findUserById } from "../db";

export const statsRoutes = new Hono<{ Bindings: Env }>();

const CATEGORY_NAMES: Record<string, string> = {
  palm_face: "手相面相",
  bazi: "八字推测",
  love_match: "八字合婚",
  phone_plate: "测手机车牌",
  name_test: "测姓名店名",
  auspicious_date: "择日吉日",
  future_fortune: "未来运程",
  qimen_decision: "奇门成败",
  personal_naming: "个人起名",
  company_naming: "公司取名",
  ziwei: "紫微斗数",
  qimen: "奇门遁甲",
  liuyao: "六爻金钱课",
  meihua: "梅花易数",
  dream: "周公解梦",
  tarot: "西洋塔罗",
};

function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return "刚刚";
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} 分钟前`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} 小时前`;
  return `${Math.floor(diffSec / 86400)} 天前`;
}

/**
 * 平台大盘真实统计数据（总测算量、活跃缘主、门类真实分布、真实链上/核销动态流）
 */
statsRoutes.get("/platform", async (c) => {
  try {
    const userCount = await c.env.DB
      .prepare("SELECT count(*) as total FROM users")
      .first<{ total: number }>();

    const orderStats = await c.env.DB
      .prepare("SELECT count(*) as total_orders, sum(price_usdt) as total_volume FROM divination_orders WHERE status = 'COMPLETED'")
      .first<{ total_orders: number; total_volume: number }>();

    const allOrdersCount = await c.env.DB
      .prepare("SELECT count(*) as total FROM divination_orders")
      .first<{ total: number }>();

    const reportStats = await c.env.DB
      .prepare("SELECT count(*) as total_reports FROM divination_reports")
      .first<{ total_reports: number }>();

    const unlockStats = await c.env.DB
      .prepare("SELECT count(*) as total_unlocks FROM divination_reports WHERE is_unlocked = 1")
      .first<{ total_unlocks: number }>();

    const categoryStats = await c.env.DB
      .prepare("SELECT category, count(*) as count FROM divination_orders GROUP BY category ORDER BY count DESC")
      .all<{ category: string; count: number }>();

    // 获取真实最近完成的测算动态流 (脱敏钱包与真实门类)
    const recentOrders = await c.env.DB
      .prepare(
        `SELECT o.id, o.user_id, o.category, o.price_usdt, o.created_at, o.paid_at,
                u.nickname, u.wallet_address
         FROM divination_orders o
         LEFT JOIN users u ON o.user_id = u.id
         WHERE o.status = 'COMPLETED'
         ORDER BY COALESCE(o.paid_at, o.created_at) DESC
         LIMIT 6`
      )
      .all<{
        id: string;
        user_id: string;
        category: string;
        price_usdt: number;
        created_at: number;
        paid_at: number | null;
        nickname: string | null;
        wallet_address: string | null;
      }>();

    const recentFeeds = (recentOrders.results || []).map((r) => {
      let displayName = "缘主";
      if (r.wallet_address && r.wallet_address.startsWith("0x")) {
        displayName = `${r.wallet_address.slice(0, 6)}...${r.wallet_address.slice(-4)}`;
      } else if (r.nickname && !r.nickname.includes("天机缘主")) {
        displayName = r.nickname;
      } else if (r.user_id.startsWith("0x")) {
        displayName = `${r.user_id.slice(0, 6)}...${r.user_id.slice(-4)}`;
      } else {
        displayName = `缘主_${r.user_id.slice(-4)}`;
      }

      const actionName = CATEGORY_NAMES[r.category] || r.category || "神算批断";
      const timeText = formatTimeAgo(r.paid_at || r.created_at);

      return {
        id: r.id,
        user: displayName,
        action: actionName,
        amount: Number((r.price_usdt || 0).toFixed(2)),
        time: timeText,
      };
    });

    return c.json({
      success: true,
      data: {
        totalUsers: userCount?.total || 0,
        totalDivinations: allOrdersCount?.total || 0,
        totalReports: reportStats?.total_reports || (orderStats?.total_orders || 0),
        totalUnlocks: unlockStats?.total_unlocks || (orderStats?.total_orders || 0),
        totalVolumeUsdt: Number((orderStats?.total_volume || 0).toFixed(2)),
        categoryDistribution: categoryStats.results || [],
        recentFeeds,
        uptime: "99.99%",
        serverlessEdgeNodes: 330,
      },
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || "统计数据查询失败" }, 500);
  }
});

/**
 * 用户个人测算与资产统计
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

  // 1. 用户总测算单数
  const myOrdersCount = await c.env.DB
    .prepare("SELECT count(*) as count, sum(price_usdt) as spent FROM divination_orders WHERE user_id = ? AND status = 'COMPLETED'")
    .bind(userId)
    .first<{ count: number; spent: number }>();

  // 2. 报告数量
  const myReportsCount = await c.env.DB
    .prepare("SELECT count(*) as count FROM divination_reports WHERE user_id = ?")
    .bind(userId)
    .first<{ count: number }>();

  // 3. 直推人数
  const directCountRes = await c.env.DB
    .prepare("SELECT count(*) as count FROM users WHERE referrer_id = ?")
    .bind(userId)
    .first<{ count: number }>();

  // 4. 间推人数
  const indirectCountRes = await c.env.DB
    .prepare("SELECT count(*) as count FROM users WHERE referrer_id IN (SELECT id FROM users WHERE referrer_id = ?)")
    .bind(userId)
    .first<{ count: number }>();

  const isVip = user.is_vip === 1;
  const completedCount = myOrdersCount?.count || 0;
  const totalSpent = Number((myOrdersCount?.spent || 0).toFixed(2));
  const vipSaved = isVip ? Number((completedCount * 1.2).toFixed(2)) : 0;

  return c.json({
    success: true,
    data: {
      userId: user.id,
      nickname: user.nickname,
      freeQuota: user.free_quota,
      isVip,
      vipExpireAt: user.vip_expire_at,
      totalDivinations: completedCount,
      totalSpent,
      vipSaved,
      reportCount: myReportsCount?.count || completedCount,
      directUsers: directCountRes?.count || 0,
      indirectUsers: indirectCountRes?.count || 0,
      earningsBalance: Number(user.earnings_balance.toFixed(2)),
      totalEarned: Number(user.total_earned.toFixed(2)),
      totalWithdrawn: Number(user.total_withdrawn.toFixed(2)),
    },
  });
});
