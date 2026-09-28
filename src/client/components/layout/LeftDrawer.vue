<template>
  <div v-if="uiStore.drawerOpen" class="fixed inset-0 z-50 flex">
    <!-- 遮罩层 -->
    <div
      class="fixed inset-0 bg-[#0B0E1A]/75 backdrop-blur-sm transition-opacity"
      @click="uiStore.closeDrawer"
    ></div>

    <!-- 抽屉内容主体 (宽 72%) -->
    <div class="relative w-[72%] max-w-[310px] h-full bg-[#141828] border-r border-tj-primary/20 p-5 flex flex-col justify-between shadow-2xl z-10 select-none animate-slide-right">
      <!-- 顶部账户信息卡 -->
      <div>
        <div class="flex items-center gap-3 pb-5 border-b border-white/10">
          <div class="w-12 h-12 rounded-full bg-tj-primary/20 border border-tj-primary flex items-center justify-center text-tj-primary font-bold text-lg font-display">
            缘
          </div>
          <div class="overflow-hidden">
            <div class="text-[#F3EFE3] font-semibold text-base truncate">
              {{ userStore.user?.nickname || "天机缘主" }}
            </div>
            <div class="flex items-center gap-2 mt-1">
              <span
                v-if="userStore.isVip"
                class="px-2 py-0.5 rounded-full bg-tj-grad-vip text-white text-[10px] font-semibold"
              >
                VIP 尊享
              </span>
              <router-link
                v-else
                to="/vip"
                @click="uiStore.closeDrawer"
                class="px-2 py-0.5 rounded-full bg-tj-primary/10 border border-tj-primary/40 text-tj-primary text-[10px]"
              >
                去开通 VIP
              </router-link>
            </div>
            <div class="text-xs text-tj-text-secondary mt-1">
              剩余免费次数: <span class="text-tj-cyan font-bold">{{ userStore.freeQuota }}</span> 次
            </div>
          </div>
        </div>

        <!-- 导航菜单列表 -->
        <nav class="mt-6 space-y-1">
          <button
            v-for="item in menuItems"
            :key="item.path"
            @click="navigate(item.path)"
            class="w-full h-14 px-3 rounded-xl flex items-center justify-between text-left transition-colors"
            :class="isActive(item.path) ? 'bg-tj-primary/15 text-tj-primary font-semibold' : 'text-tj-text-secondary hover:bg-white/5 hover:text-tj-text-primary'"
          >
            <div class="flex items-center gap-3">
              <span class="text-xl">{{ item.icon }}</span>
              <span class="text-[15px]">{{ item.name }}</span>
            </div>
            <!-- 右侧徽标 -->
            <span
              v-if="item.badge"
              class="px-2 py-0.5 rounded-full text-[11px]"
              :class="item.badgeClass"
            >
              {{ item.badge }}
            </span>
          </button>
        </nav>
      </div>

      <!-- 底部固定设置与帮助 -->
      <div class="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-tj-text-faint">
        <router-link to="/about" @click="uiStore.closeDrawer" class="hover:text-tj-primary transition-colors">
          关于与免责声明
        </router-link>
        <span class="text-white/20">|</span>
        <button @click="openCustomerService" class="hover:text-tj-primary transition-colors">
          联系客服
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUIStore } from "../../stores/ui";
import { useUserStore } from "../../stores/user";
import { isTestnet } from "../../utils/web3";

const route = useRoute();
const router = useRouter();
const uiStore = useUIStore();
const userStore = useUserStore();

const menuItems = computed(() => {
  const items = [
    { name: "测算首页", path: "/home", icon: "🔮" },
    {
      name: "会员中心",
      path: "/vip",
      icon: "👑",
      badge: userStore.isVip ? "已激活" : "省",
      badgeClass: userStore.isVip ? "bg-tj-purple/20 text-tj-purple border border-tj-purple/40" : "bg-tj-primary text-[#1A1405] font-bold",
    },
    {
      name: "推广中心",
      path: "/promote",
      icon: "🎁",
      badge: userStore.user?.earnings_balance ? `${userStore.user.earnings_balance.toFixed(1)} U` : "15%返佣",
      badgeClass: "bg-tj-cyan/15 text-tj-cyan border border-tj-cyan/30",
    },
    { name: "大盘统计", path: "/stats", icon: "📊" },
    { name: "个人中心", path: "/me", icon: "👤" },
  ];

  if (isTestnet()) {
    items.push({
      name: "USDT 水龙头",
      path: "#faucet",
      icon: "🧪",
      badge: "领测试币",
      badgeClass: "bg-tj-cyan/20 text-tj-cyan border border-tj-cyan/40",
    });
  }

  return items;
});

function isActive(path: string) {
  return route.path === path;
}

function navigate(path: string) {
  uiStore.closeDrawer();
  if (path === "#faucet") {
    uiStore.openFaucetModal();
    return;
  }
  router.push(path);
}

function openCustomerService() {
  uiStore.closeDrawer();
  uiStore.showToast("微信客服: TianjiMaster_AI (工作日 9:00-21:00)");
}
</script>

<style scoped>
@keyframes slideRight {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}
.animate-slide-right {
  animation: slideRight 0.25s ease-out forwards;
}
</style>
