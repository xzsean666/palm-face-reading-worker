import { defineStore } from "pinia";
import { ref, computed } from "vue";

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
  const storedUserId = localStorage.getItem("tj_user_id");
  if (storedUserId) {
    user.value = {
      id: storedUserId,
      nickname: "天机缘主",
      wallet_address: storedUserId.startsWith("0x") ? storedUserId : null,
      free_quota: 2,
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
  const isVip = computed(() => user.value?.is_vip === 1);
  const freeQuota = computed(() => user.value?.free_quota ?? 0);

  async function loginWithWallet(address: string, referrerCode?: string) {
    loading.value = true;
    try {
      const res = await fetch("/api/user/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ walletAddress: address, referrerCode }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        user.value = data.data;
        localStorage.setItem("tj_user_id", data.data.id);
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
      const res = await fetch("/api/user/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId, referrerCode }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        user.value = data.data;
        localStorage.setItem("tj_user_id", data.data.id);
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
        user.value = data.data;
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
    localStorage.removeItem("tj_user_id");
  }

  return {
    user,
    loading,
    isLoggedIn,
    isVip,
    freeQuota,
    onChainBalance,
    usdtBalance,
    loginWithWallet,
    loginAsGuest,
    refreshProfile,
    refreshOnChainBalance,
    logout,
  };
});

