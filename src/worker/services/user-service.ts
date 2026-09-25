import type { Env } from "../types/env";
import type { UserRow } from "../db/types";
import { getOrCreateUser, findUserById, findUserByReferralCode } from "../db";

export interface AuthParams {
  walletAddress?: string;
  guestId?: string;
  referrerCode?: string;
}

/**
 * 随机生成游客标识
 */
export function generateGuestId(): string {
  const rand = Math.random().toString(36).substring(2, 10);
  return `guest_${rand}`;
}

/**
 * 用户鉴权登录（支持 Web3 钱包地址或游客模式）
 */
export async function authenticateUser(env: Env, params: AuthParams): Promise<UserRow> {
  let userId: string;
  let walletAddress: string | undefined = undefined;

  if (params.walletAddress && params.walletAddress.trim()) {
    walletAddress = params.walletAddress.trim().toLowerCase();
    userId = walletAddress;
  } else if (params.guestId && params.guestId.trim()) {
    userId = params.guestId.trim();
  } else {
    userId = generateGuestId();
  }

  return await getOrCreateUser(env.DB, userId, walletAddress, params.referrerCode);
}

/**
 * 查询用户完整资料与资产
 */
export async function getUserProfile(env: Env, userId: string): Promise<UserRow | null> {
  return await findUserById(env.DB, userId);
}

/**
 * 绑定上级邀请人
 */
export async function bindReferrer(
  env: Env,
  userId: string,
  referrerCode: string
): Promise<{ success: boolean; message: string }> {
  const user = await findUserById(env.DB, userId);
  if (!user) {
    return { success: false, message: "用户不存在" };
  }

  if (user.referrer_id) {
    return { success: false, message: "您已绑定过邀请人，不可重复绑定" };
  }

  const referrer = await findUserByReferralCode(env.DB, referrerCode.trim().toUpperCase());
  if (!referrer) {
    return { success: false, message: "无效的邀请推荐码" };
  }

  if (referrer.id === userId) {
    return { success: false, message: "不能绑定自己的推荐码" };
  }

  await env.DB
    .prepare("UPDATE users SET referrer_id = ?, updated_at = ? WHERE id = ?")
    .bind(referrer.id, Date.now(), userId)
    .run();

  return { success: true, message: `成功绑定邀请人: ${referrer.nickname}` };
}
