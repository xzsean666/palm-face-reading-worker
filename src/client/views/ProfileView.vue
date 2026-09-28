<template>
  <div class="flex-1 pb-16 px-4 pt-3 select-none">
    <!-- 未登录引导卡 -->
    <div v-if="!userStore.isLoggedIn" class="bg-tj-bg-card border border-tj-primary/30 rounded-2xl p-6 text-center shadow-lg my-6">
      <div class="w-16 h-16 mx-auto mb-3 rounded-full bg-tj-primary/10 border border-tj-primary flex items-center justify-center text-3xl">
        👤
      </div>
      <h3 class="text-base font-semibold text-tj-text-primary mb-1">登录后开始推演</h3>
      <p class="text-xs text-tj-text-secondary mb-4">登录即可获得 2 次免费测算额度与专属命盘记录</p>
      <router-link
        to="/login"
        class="inline-block px-6 py-2 rounded-full bg-tj-grad-gold text-[#1A1405] text-xs font-bold shadow-gold-glow"
      >
        去登录
      </router-link>
    </div>

    <!-- 已登录态 -->
    <template v-else>
      <!-- 1. 账户头卡 (高 130px, --tj-grad-hero) -->
      <div class="bg-[#101424] bg-tj-grad-hero border border-tj-primary/20 rounded-2xl p-4 mb-3 flex items-center justify-between shadow-sm relative overflow-hidden">
        <div class="flex items-center gap-3.5 relative z-10">
          <!-- 头像 56px 圆形 -->
          <div class="w-14 h-14 rounded-full bg-[#1A1D2E] border-2 border-tj-primary flex items-center justify-center text-xl font-bold font-display text-tj-primary shadow-gold-glow">
            {{ userStore.user?.nickname?.slice(0, 1) || "缘" }}
          </div>

          <div>
            <div class="text-base font-semibold text-tj-text-primary">
              {{ userStore.user?.nickname || "天机缘主" }}
            </div>
            <!-- 钱包地址 + 复制图标 -->
            <div class="flex items-center gap-1.5 text-[11px] text-tj-text-secondary mt-0.5 font-mono">
              <span>{{ displayAddress }}</span>
              <button
                v-if="userStore.user?.wallet_address"
                @click="copyAddress"
                class="hover:text-tj-primary text-xs"
                title="复制地址"
              >
                📋
              </button>
            </div>
          </div>
        </div>

        <!-- 会员标签 -->
        <router-link
          to="/vip"
          class="relative z-10 px-3 py-1 rounded-full text-xs font-semibold shadow-sm transition-transform active:scale-95"
          :class="userStore.isVip ? 'bg-tj-grad-vip text-white' : 'border border-tj-primary text-tj-primary bg-tj-primary/10'"
        >
          {{ userStore.isVip ? '会员·365天' : '去开通' }}
        </router-link>
      </div>

      <!-- 2. 资产行 (三列均分) -->
      <div class="grid grid-cols-3 divide-x divide-white/10 bg-tj-bg-card border border-white/5 rounded-2xl p-3 mb-3.5 text-center">
        <div>
          <div class="text-[11px] text-tj-text-secondary mb-0.5">剩余免费</div>
          <div class="text-base font-bold font-num text-tj-cyan">{{ userStore.freeQuota }} 次</div>
        </div>
        <div>
          <div class="text-[11px] text-tj-text-secondary mb-0.5 flex items-center justify-center gap-1">
            <span>服务点数</span>
            <router-link to="/recharge" class="text-[10px] text-tj-primary hover:underline font-bold">充值</router-link>
          </div>
          <div class="text-base font-bold font-num text-tj-primary">
            {{ userStore.onChainBalance?.toFixed(2) || "0.00" }} <span class="text-[10px] font-sans">点</span>
          </div>
        </div>
        <div>
          <div class="text-[11px] text-tj-text-secondary mb-0.5 flex items-center justify-center gap-1">
            <span>可提现</span>
            <router-link to="/promote/earnings" class="text-[10px] text-tj-primary hover:underline font-bold">提现</router-link>
          </div>
          <div class="text-base font-bold font-num text-tj-primary">
            {{ userStore.user?.earnings_balance?.toFixed(2) || "0.00" }} <span class="text-[10px] font-sans">U</span>
          </div>
        </div>
      </div>

      <!-- 测试网水龙头快捷卡片 (仅测试网展示) -->
      <div
        v-if="isTestnet()"
        @click="uiStore.openFaucetModal"
        class="bg-gradient-to-r from-tj-cyan/15 via-tj-primary/10 to-transparent border border-tj-cyan/30 rounded-2xl p-3.5 mb-3.5 flex items-center justify-between cursor-pointer hover:border-tj-cyan/60 active:scale-98 transition-all shadow-sm"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-tj-cyan/20 border border-tj-cyan/40 flex items-center justify-center text-xl">
            🧪
          </div>
          <div>
            <div class="text-sm font-semibold text-tj-text-primary flex items-center gap-1.5">
              <span>测试币水龙头 (Faucet)</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded bg-tj-cyan text-[#0B0E1A] font-bold">测试网</span>
            </div>
            <div class="text-[11px] text-tj-cyan/90 mt-0.5">
              一键领取 1,000 USDT 测试币及 Gas 体验全功能
            </div>
          </div>
        </div>
        <span class="text-sm text-tj-cyan font-bold">领取 ›</span>
      </div>

      <!-- 3. 功能列表组 (图标 20px + 文字 14px + 右 ›) -->
      <div class="bg-tj-bg-card border border-white/5 rounded-2xl p-2 mb-3 divide-y divide-white/5">
        <router-link
          v-for="item in functionList"
          :key="item.path"
          :to="item.path"
          class="h-12 px-3 flex items-center justify-between hover:bg-white/5 rounded-xl transition-colors"
        >
          <div class="flex items-center gap-3">
            <span class="text-xl w-6 text-center">{{ item.icon }}</span>
            <span class="text-sm font-medium text-tj-text-primary">{{ item.label }}</span>
          </div>
          <div class="flex items-center gap-2">
            <span v-if="item.badge" class="w-2 h-2 rounded-full bg-tj-danger"></span>
            <span class="text-xs text-tj-text-faint">›</span>
          </div>
        </router-link>
      </div>

      <!-- 4. 其他组 -->
      <div class="bg-tj-bg-card border border-white/5 rounded-2xl p-2 mb-6 divide-y divide-white/5">
        <router-link
          to="/about"
          class="h-12 px-3 flex items-center justify-between hover:bg-white/5 rounded-xl transition-colors"
        >
          <div class="flex items-center gap-3">
            <span class="text-xl w-6 text-center">⚙️</span>
            <span class="text-sm font-medium text-tj-text-primary">设置</span>
          </div>
          <span class="text-xs text-tj-text-faint">›</span>
        </router-link>
        <router-link
          to="/about"
          class="h-12 px-3 flex items-center justify-between hover:bg-white/5 rounded-xl transition-colors"
        >
          <div class="flex items-center gap-3">
            <span class="text-xl w-6 text-center">ℹ️</span>
            <span class="text-sm font-medium text-tj-text-primary">关于与帮助</span>
          </div>
          <span class="text-xs text-tj-text-faint">›</span>
        </router-link>
      </div>

      <!-- 5. 底部居中文字按钮「退出登录」 -->
      <div class="text-center pb-4">
        <button
          @click="logout"
          class="text-sm text-tj-danger hover:underline font-medium"
        >
          退出登录
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { useUIStore } from "../stores/ui";
import { isTestnet } from "../utils/web3";

const router = useRouter();
const userStore = useUserStore();
const uiStore = useUIStore();

const displayAddress = computed(() => {
  const addr = userStore.user?.wallet_address;
  if (!addr) return "游客模式 (未绑定钱包)";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
});

const latestOrderId = ref("");

onMounted(async () => {
  await userStore.refreshOnChainBalance();
  const userId = userStore.user?.id || userStore.user?.wallet_address;
  if (userId) {
    try {
      const res = await fetch(`/api/orders?userId=${encodeURIComponent(userId)}`);
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        latestOrderId.value = json.data[0].id;
      }
    } catch {}
  }
});

const functionList = computed(() => [
  { icon: "💎", label: "点数充值", path: "/recharge" },
  { icon: "📜", label: "测算记录", path: "/me/records" },
  { icon: "📦", label: "我的订单", path: latestOrderId.value ? `/me/orders/${latestOrderId.value}` : "/me/records" },
  { icon: "👑", label: "会员中心", path: "/vip" },
  { icon: "🎁", label: "推广中心", path: "/promote" },
  { icon: "🔔", label: "消息通知", path: "/home", badge: uiStore.unreadCount > 0 },
]);

function copyAddress() {
  if (userStore.user?.wallet_address) {
    navigator.clipboard.writeText(userStore.user.wallet_address);
    uiStore.showToast("已复制");
  }
}

function logout() {
  userStore.logout();
  uiStore.showToast("已安全退出");
  router.push("/login");
}
</script>
