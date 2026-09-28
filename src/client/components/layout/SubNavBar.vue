<template>
  <div v-if="currentTabs.length > 0 && uiStore.navMode === 'module'" class="sticky top-14 z-20 w-full select-none group/navbar">
    <!-- 导航栏主体 -->
    <nav
      ref="navContainer"
      @wheel="handleWheel"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
      @mouseleave="onMouseLeave"
      @scroll="checkScroll"
      class="h-11 w-full bg-tj-bg/95 backdrop-blur-md border-b border-white/5 flex items-center overflow-x-auto no-scrollbar px-3 space-x-5 cursor-grab active:cursor-grabbing touch-pan-x scroll-smooth"
    >
      <button
        v-for="tab in currentTabs"
        :key="tab.path"
        @click="onTabClick(tab)"
        class="relative py-2.5 whitespace-nowrap text-sm transition-colors flex-shrink-0"
        :class="[
          isActive(tab) ? 'text-tj-primary font-semibold tab-active' : 'text-tj-text-secondary hover:text-tj-text-primary'
        ]"
      >
        {{ tab.label }}
        <!-- 金色下划线 -->
        <span
          v-if="isActive(tab)"
          class="absolute bottom-0 left-0 right-0 h-0.5 bg-tj-primary rounded-full shadow-gold-glow"
        ></span>
      </button>
    </nav>

    <!-- 左侧可滚动指示与快速翻页箭头 -->
    <div
      v-if="canScrollLeft"
      class="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-tj-bg to-transparent pointer-events-none flex items-center pl-1 z-10"
    >
      <button
        @click="scrollByOffset(-140)"
        class="pointer-events-auto w-5 h-5 rounded-full bg-black/60 border border-white/10 text-white/70 hover:text-tj-primary text-xs flex items-center justify-center opacity-0 group-hover/navbar:opacity-100 transition-opacity"
        aria-label="向左滑动"
      >
        ‹
      </button>
    </div>

    <!-- 右侧可滚动提示遮罩与快速翻页箭头 (解决右侧被遮挡且不知可滑动的痛点) -->
    <div
      v-if="canScrollRight"
      class="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-tj-bg via-tj-bg/80 to-transparent flex items-center justify-end pr-1 z-10 pointer-events-none"
    >
      <!-- 呼吸光点提示有更多功能 -->
      <span class="w-1.5 h-1.5 rounded-full bg-tj-primary animate-ping mr-2 opacity-60"></span>
      <button
        @click="scrollByOffset(140)"
        class="pointer-events-auto w-5 h-5 rounded-full bg-black/60 border border-white/10 text-white/70 hover:text-tj-primary text-xs flex items-center justify-center opacity-80 group-hover/navbar:opacity-100 hover:scale-110 transition-all shadow-sm"
        aria-label="向右滑动"
      >
        ›
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUIStore } from "../../stores/ui";

const route = useRoute();
const router = useRouter();
const uiStore = useUIStore();

const navContainer = ref<HTMLElement | null>(null);
const canScrollLeft = ref(false);
const canScrollRight = ref(false);

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

// 检查滚动状态并显示/隐藏遮罩与箭头
function checkScroll() {
  const el = navContainer.value;
  if (!el) return;
  canScrollLeft.value = el.scrollLeft > 4;
  canScrollRight.value = el.scrollWidth - el.clientWidth - el.scrollLeft > 4;
}

// 快速翻页位移
function scrollByOffset(offset: number) {
  if (!navContainer.value) return;
  navContainer.value.scrollBy({ left: offset, behavior: "smooth" });
  setTimeout(checkScroll, 250);
}

// 滚轮事件优化：将 PC 端鼠标垂直滚轮事件转化为横向滚动
function handleWheel(e: WheelEvent) {
  const el = navContainer.value;
  if (!el) return;
  if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
    e.preventDefault();
    el.scrollLeft += e.deltaY;
    checkScroll();
  }
}

// 鼠标拖拽横向滚动 (支持桌面端鼠标拉动)
let isDragging = false;
let startX = 0;
let scrollStart = 0;
let hasDragged = false;

function onMouseDown(e: MouseEvent) {
  isDragging = true;
  hasDragged = false;
  startX = e.pageX;
  scrollStart = navContainer.value?.scrollLeft || 0;
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging || !navContainer.value) return;
  const dx = e.pageX - startX;
  if (Math.abs(dx) > 4) {
    hasDragged = true;
  }
  navContainer.value.scrollLeft = scrollStart - dx;
  checkScroll();
}

function onMouseUp() {
  isDragging = false;
}

function onMouseLeave() {
  isDragging = false;
}

function onTabClick(tab: TabItem) {
  if (hasDragged) {
    hasDragged = false;
    return;
  }
  router.push(tab.path);
}

// 路由变化时，将激活项平滑滚动至视口中位
function scrollToActiveTab() {
  nextTick(() => {
    checkScroll();
    const el = navContainer.value;
    if (!el) return;
    const activeEl = el.querySelector<HTMLElement>(".tab-active");
    if (activeEl) {
      activeEl.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      setTimeout(checkScroll, 300);
    }
  });
}

watch(() => route.path, () => {
  scrollToActiveTab();
});

onMounted(() => {
  scrollToActiveTab();
  window.addEventListener("resize", checkScroll);
});
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
