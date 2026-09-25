<template>
  <div class="flex-1 pb-24 px-6 pt-10 flex flex-col justify-between select-none relative overflow-hidden">
    <div class="text-center">
      <!-- 1. Logo 80px + 品牌名 18px 金 -->
      <div class="w-20 h-20 mx-auto mb-3 rounded-full bg-tj-primary/10 border-2 border-tj-primary flex items-center justify-center text-4xl font-display font-bold text-tj-primary shadow-gold-glow">
        天
      </div>
      <h1 class="text-lg font-bold text-tj-primary font-display tracking-widest mb-4">
        天机 AI预测大师
      </h1>

      <!-- 2. 好友邀请标语 -->
      <h2 class="text-[15px] font-semibold text-tj-text-primary mb-6">
        您的好友【{{ inviterNickname }}】邀请您体验 AI 命理推演
      </h2>

      <!-- 3. 福利卡 (金色 8% 底) -->
      <div class="bg-tj-primary/8 border border-tj-primary/30 rounded-2xl p-4 mb-6 shadow-sm">
        <div class="text-sm font-bold text-tj-primary flex items-center justify-center gap-2">
          <span>🎁</span>
          <span>注册即送 2 次免费测算</span>
        </div>
        <div class="text-[11px] text-tj-text-secondary mt-1">
          邀请码：<span class="font-mono text-tj-primary-light font-bold">{{ inviteCode }}</span>
        </div>
      </div>

      <!-- 4. 热门功能横排 4 图标 -->
      <div class="text-xs font-semibold text-tj-text-secondary mb-3">热门测算门类</div>
      <div class="grid grid-cols-4 gap-2 mb-8">
        <div
          v-for="f in hotFeatures"
          :key="f.name"
          class="bg-tj-bg-card border border-white/5 rounded-xl p-2.5 flex flex-col items-center text-center"
        >
          <div class="text-2xl mb-1">{{ f.icon }}</div>
          <div class="text-[11px] text-tj-text-primary truncate w-full">{{ f.name }}</div>
        </div>
      </div>
    </div>

    <!-- 5. 吸底主按钮：「立即体验」 -->
    <div class="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-4 bg-tj-bg/95 backdrop-blur-md border-t border-white/10 z-20">
      <button
        @click="handleExperience"
        class="w-full h-12 rounded-full font-bold text-base transition-all flex items-center justify-center gap-2 bg-tj-grad-gold text-[#1A1405] shadow-gold-glow hover:brightness-110 active:scale-98"
      >
        立即体验
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { useUIStore } from "../stores/ui";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const uiStore = useUIStore();

const inviteCode = computed(() => (route.params.code as string) || "TJ8K2M9");
const inviterNickname = ref("天机贵客");

const hotFeatures = [
  { name: "AI看相", icon: "🖐️" },
  { name: "八字推测", icon: "☯️" },
  { name: "未来运程", icon: "🔮" },
  { name: "测姓名店名", icon: "✍️" },
];

async function handleExperience() {
  if (!userStore.isLoggedIn) {
    await userStore.loginAsGuest(inviteCode.value);
  } else if (userStore.user?.id) {
    try {
      await fetch("/api/user/bind-referrer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userStore.user.id, referrerCode: inviteCode.value }),
      });
      await userStore.refreshProfile();
    } catch {}
  }
  uiStore.showToast("已获赠 2 次免费测算额度！");
  router.push("/home");
}
</script>
