import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Address } from "viem";
import { getServiceBalance, getUSDTBalance } from "../utils/web3";

export interface UserState {
  id: string;
  nickname: string;
  wallet_address: string | null;
  free_quota: number;
  is_vip: number;
  vip_expire_at: number | null;
  referral_code: string;
  referrer_id: string | null;
  earnings_balance: number;
  total_earned: number;
  total_withdrawn: number;
}

export const useUserStore = defineStore("user", () => {
  const user = ref<UserState | null>(null);
  const loading = ref(false);

  // 初始化本地持久化用户
  const storedUserId = typeof window !== "undefined" ? localStorage.getItem("tj_user_id") : null;
  const storedProfile = typeof window !== "undefined" ? localStorage.getItem("tj_user_profile") : null;

  if (storedProfile) {
    try {
      user.value = JSON.parse(storedProfile);
    } catch {
      user.value = null;
    }
  } else if (storedUserId) {
    user.value = {
      id: storedUserId,
      nickname: "天机缘主",
      wallet_address: storedUserId.startsWith("0x") ? storedUserId : null,
      free_quota: 0, // 初始置为 0，防止脱机时误报剩余免费，等待 refreshProfile 从 D1 校验同步
      is_vip: 0,
      vip_expire_at: null,
      referral_code: "TJ" + Math.random().toString(36).slice(2, 7).toUpperCase(),
      referrer_id: null,
      earnings_balance: 0,
      total_earned: 0,
      total_withdrawn: 0,
    };
  }

  const isLoggedIn = computed(() => Boolean(user.value?.id));
  const isWalletConnected = computed(() => {
    return Boolean(
      user.value?.wallet_address &&
      typeof user.value.wallet_address === "string" &&
      user.value.wallet_address.startsWith("0x")
    );
  });
  const isVip = computed(() => user.value?.is_vip === 1);
  const freeQuota = computed(() => user.value?.free_quota ?? 0);

  function saveUserProfile(profileData: UserState) {
    user.value = profileData;
    if (typeof window !== "undefined") {
      localStorage.setItem("tj_user_id", profileData.id);
      localStorage.setItem("tj_user_profile", JSON.stringify(profileData));
    }
  }

  function updateFreeQuota(count: number) {
    if (user.value) {
      user.value.free_quota = count;
      if (typeof window !== "undefined") {
        localStorage.setItem("tj_user_profile", JSON.stringify(user.value));
      }
    }
  }

  async function loginWithWallet(address: string, referrerCode?: string) {
    loading.value = true;
    try {
      const cleanAddr = address.trim().toLowerCase();
      const cleanRefCode = referrerCode?.trim() ? referrerCode.trim().toUpperCase() : undefined;
      const res = await fetch("/api/user/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: cleanAddr, referrerCode: cleanRefCode }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        saveUserProfile(data.data);
        if (typeof window !== "undefined") {
          localStorage.removeItem("tj_pending_referrer_code");
        }
        return data.data;
      }
      throw new Error(data.error || "登录失败");
    } finally {
      loading.value = false;
    }
  }

  async function loginAsGuest(referrerCode?: string) {
    loading.value = true;
    try {
      const guestId = storedUserId || `guest_${Math.random().toString(36).slice(2, 10)}`;
      const cleanRefCode = referrerCode?.trim() ? referrerCode.trim().toUpperCase() : undefined;
      const res = await fetch("/api/user/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId, referrerCode: cleanRefCode }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        saveUserProfile(data.data);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("tj_guest_session", "1");
          localStorage.removeItem("tj_pending_referrer_code");
        }
        return data.data;
      }
      throw new Error(data.error || "游客进入失败");
    } finally {
      loading.value = false;
    }
  }

  const onChainBalance = ref<number>(0);
  const usdtBalance = ref<number>(0);

  async function refreshOnChainBalance() {
    const address = user.value?.wallet_address;
    if (address && address.startsWith("0x")) {
      try {
        const [cb, ub] = await Promise.all([
          getServiceBalance(address as Address),
          getUSDTBalance(address as Address),
        ]);
        onChainBalance.value = cb;
        usdtBalance.value = ub;
      } catch (err) {
        console.warn("获取链上余额失败:", err);
      }
    }
  }

  async function refreshProfile() {
    if (!user.value?.id) return;
    try {
      const res = await fetch(`/api/user/profile?userId=${encodeURIComponent(user.value.id)}`);
      const data = await res.json();
      if (data.success && data.data) {
        saveUserProfile(data.data);
        await refreshOnChainBalance();
      }
    } catch {
      // 容错
    }
  }

  function logout() {
    user.value = null;
    onChainBalance.value = 0;
    usdtBalance.value = 0;
    if (typeof window !== "undefined") {
      localStorage.removeItem("tj_user_id");
      localStorage.removeItem("tj_user_profile");
      sessionStorage.removeItem("tj_guest_session");
    }
  }

  // 监听钱包账户切换
  if (typeof window !== "undefined" && (window as any).ethereum) {
    (window as any).ethereum.on?.("accountsChanged", async (accounts: string[]) => {
      if (accounts && accounts.length > 0) {
        const newAddr = accounts[0].toLowerCase();
        if (user.value?.wallet_address?.toLowerCase() !== newAddr) {
          try {
            await loginWithWallet(newAddr);
          } catch (e) {
            console.warn("自动切换钱包账户异常:", e);
          }
        }
      } else {
        logout();
      }
    });
  }

  return {
    user,
    loading,
    isLoggedIn,
    isWalletConnected,
    isVip,
    freeQuota,
    onChainBalance,
    usdtBalance,
    saveUserProfile,
    updateFreeQuota,
    loginWithWallet,
    loginAsGuest,
    refreshProfile,
    refreshOnChainBalance,
    logout,
  };
});
