<template>
  <nav
    v-if="currentTabs.length > 0 && uiStore.navMode === 'module'"
    class="sticky top-14 z-20 h-11 w-full bg-tj-bg/95 border-b border-white/5 flex items-center overflow-x-auto no-scrollbar px-3 space-x-5 select-none"
  >
    <button
      v-for="tab in currentTabs"
      :key="tab.path"
      @click="onTabClick(tab)"
      class="relative py-2.5 whitespace-nowrap text-sm transition-colors flex-shrink-0"
      :class="isActive(tab) ? 'text-tj-primary font-semibold' : 'text-tj-text-secondary hover:text-tj-text-primary'"
    >
      {{ tab.label }}
      <!-- 金色下划线 -->
      <span
        v-if="isActive(tab)"
        class="absolute bottom-0 left-0 right-0 h-0.5 bg-tj-primary rounded-full shadow-gold-glow"
      ></span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUIStore } from "../../stores/ui";

const route = useRoute();
const router = useRouter();
const uiStore = useUIStore();

interface TabItem {
  label: string;
  path: string;
}

const divinationTabs: TabItem[] = [
  { label: "AI看相", path: "/feature/palm-face" },
  { label: "我们合不合", path: "/feature/love_match/input" },
  { label: "测手机车牌", path: "/feature/phone_plate/input" },
  { label: "测姓名店名", path: "/feature/name_test/input" },
  { label: "择日吉日", path: "/feature/auspicious_date/input" },
  { label: "未来运程", path: "/feature/future_fortune/input" },
  { label: "八字推测", path: "/feature/bazi/input" },
  { label: "成败预测", path: "/feature/qimen_decision/input" },
  { label: "个人起名", path: "/feature/personal_naming/input" },
  { label: "公司取名", path: "/feature/company_naming/input" },
  { label: "测算记录", path: "/me/records" },
];

const vipTabs: TabItem[] = [
  { label: "会员中心", path: "/vip" },
  { label: "权益说明", path: "/vip?tab=benefits" },
];

const promoteTabs: TabItem[] = [
  { label: "推广中心", path: "/promote" },
  { label: "收益明细", path: "/promote/earnings" },
  { label: "我的团队", path: "/promote?tab=team" },
];

const statsTabs: TabItem[] = [
  { label: "平台大盘", path: "/stats" },
  { label: "我的统计", path: "/stats?tab=my" },
];

const meTabs: TabItem[] = [
  { label: "个人中心", path: "/me" },
  { label: "测算记录", path: "/me/records" },
  { label: "关于与协议", path: "/about" },
];

const currentTabs = computed(() => {
  const p = route.path;
  if (p === "/home" || p.startsWith("/feature/")) return divinationTabs;
  if (p.startsWith("/vip")) return vipTabs;
  if (p.startsWith("/promote")) return promoteTabs;
  if (p.startsWith("/stats")) return statsTabs;
  if (p.startsWith("/me")) return meTabs;
  return [];
});

function isActive(tab: TabItem) {
  if (tab.path === route.path) return true;
  if (route.path === "/home" && tab.path === "/feature/palm-face") return true;
  return false;
}

function onTabClick(tab: TabItem) {
  router.push(tab.path);
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
