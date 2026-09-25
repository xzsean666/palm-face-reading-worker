<template>
  <!-- 桌面居中容器，沉浸式深蓝黑背景 -->
  <div class="min-h-screen w-full bg-[#070913] flex justify-center items-center">
    <div class="w-full max-w-[430px] min-h-screen bg-tj-bg text-tj-text-primary relative shadow-2xl flex flex-col overflow-x-hidden border-x border-white/5">
      <!-- 顶部主导航栏 (56px) -->
      <TopNavBar v-if="!hideNav" />

      <!-- 二级副菜单 (44px, 仅在模块模式) -->
      <SubNavBar v-if="!hideNav && uiStore.navMode === 'module'" />

      <!-- 路由内容区 -->
      <main class="flex-1 flex flex-col relative">
        <router-view v-slot="{ Component }">
          <transition name="page-fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>

      <!-- 首页右下角 64px 悬浮金球 (🎁 推广) -->
      <router-link
        v-if="isHomePage"
        to="/promote"
        class="fixed bottom-6 right-6 z-20 w-14 h-14 rounded-full bg-tj-grad-gold text-[#1A1405] flex flex-col items-center justify-center shadow-gold-glow hover:scale-105 active:scale-95 transition-transform select-none"
        aria-label="推广中心"
      >
        <span class="text-lg leading-none">🎁</span>
        <span class="text-[10px] font-bold mt-0.5 leading-none">推广</span>
      </router-link>

      <!-- 左侧主菜单抽屉 (72%) -->
      <LeftDrawer />

      <!-- 底部「＋」动作面板 (Action Sheet) -->
      <ActionSheet />

      <!-- 全局居中 Toast -->
      <ToastNotification />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import TopNavBar from "./TopNavBar.vue";
import SubNavBar from "./SubNavBar.vue";
import LeftDrawer from "./LeftDrawer.vue";
import ActionSheet from "./ActionSheet.vue";
import ToastNotification from "../common/ToastNotification.vue";
import { useUIStore } from "../../stores/ui";
import { useUserStore } from "../../stores/user";

const route = useRoute();
const uiStore = useUIStore();
const userStore = useUserStore();

const hideNav = computed(() => Boolean(route.meta.hideNav));
const isHomePage = computed(() => route.path === "/home");

onMounted(async () => {
  // 若未登录则自动以游客模式登录
  if (!userStore.isLoggedIn) {
    await userStore.loginAsGuest();
  } else {
    await userStore.refreshProfile();
  }
});
</script>

<style>
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.page-fade-enter-from {
  opacity: 0;
  transform: translateY(6px);
}

.page-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
