<template>
  <header class="sticky top-0 z-30 h-14 w-full bg-tj-bg/90 backdrop-blur-md border-b border-white/10 flex items-center justify-between px-4 select-none">
    <!-- 左区：导航触发器 + Logo -->
    <div class="flex items-center gap-2">
      <!-- 模块模式：抽屉图标 -->
      <button
        v-if="uiStore.navMode === 'module'"
        @click="uiStore.openDrawer"
        class="w-8 h-8 flex items-center justify-center text-tj-primary hover:opacity-80 active:scale-95 transition-transform"
        aria-label="打开菜单"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <!-- 流程模式：返回箭头 -->
      <button
        v-else
        @click="goBack"
        class="w-8 h-8 flex items-center justify-center text-tj-text-primary hover:opacity-80 active:scale-95 transition-transform"
        aria-label="返回上页"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <!-- 品牌标识：Logo + 天机 -->
      <router-link to="/home" class="flex items-center gap-1.5 hover:opacity-90 transition-opacity">
        <div class="w-6 h-6 rounded-full bg-tj-primary/20 border border-tj-primary/40 flex items-center justify-center text-tj-primary text-xs font-display font-bold">
          天
        </div>
        <span class="text-tj-primary font-bold text-sm tracking-wider font-display">天机</span>
      </router-link>
    </div>

    <!-- 中区：页面标题 -->
    <div class="text-tj-text-primary font-semibold text-[17px] truncate max-w-[140px] text-center">
      {{ uiStore.navTitle }}
    </div>

    <!-- 右区：消息铃铛 + 金色「＋」动作按钮 -->
    <div class="flex items-center gap-3">
      <!-- 消息铃铛 -->
      <button
        @click="openMessages"
        class="relative p-1 text-tj-text-secondary hover:text-tj-text-primary transition-colors"
        aria-label="消息通知"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        <span
          v-if="uiStore.unreadCount > 0"
          class="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-tj-danger ring-2 ring-tj-bg"
        ></span>
      </button>

      <!-- 金色「＋」快捷操作按钮 -->
      <button
        @click="uiStore.openActionSheet"
        class="w-7 h-7 rounded-full bg-tj-grad-gold text-[#1A1405] flex items-center justify-center shadow-gold-glow hover:brightness-110 active:scale-95 transition-all font-bold text-lg leading-none"
        aria-label="快捷功能"
      >
        ＋
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useUIStore } from "../../stores/ui";

const router = useRouter();
const uiStore = useUIStore();

function goBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/home");
  }
}

function openMessages() {
  uiStore.showToast("暂无未读系统提醒");
  uiStore.unreadCount = 0;
}
</script>
