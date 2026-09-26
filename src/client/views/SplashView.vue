<template>
  <div class="fixed inset-0 z-50 bg-[#0B0E1A] bg-tj-grad-hero flex flex-col justify-between items-center py-16 px-6 select-none overflow-hidden">
    <!-- 飘浮光斑装饰 -->
    <div class="absolute -top-10 left-1/4 w-48 h-48 rounded-full bg-tj-primary/10 blur-3xl pointer-events-none"></div>
    <div class="absolute -bottom-10 right-1/4 w-48 h-48 rounded-full bg-tj-purple/10 blur-3xl pointer-events-none"></div>

    <div></div>

    <!-- 垂直居中：Logo 徽章 120px + 呼吸光晕动效 (2.5s 循环缩放 1 -> 1.08) -->
    <div class="flex flex-col items-center relative z-10">
      <div class="relative w-32 h-32 mb-6 flex items-center justify-center">
        <!-- 呼吸光晕外环 -->
        <div class="absolute inset-0 rounded-full border-2 border-tj-primary/30 animate-breathe"></div>
        <div class="absolute -inset-2 rounded-full bg-tj-primary/10 blur-md animate-pulse"></div>

        <!-- 120px 核心徽章 -->
        <div class="w-28 h-28 rounded-full bg-[#141828] border-2 border-tj-primary flex items-center justify-center text-tj-primary text-5xl font-display font-bold shadow-gold-glow">
          天
        </div>
      </div>

      <!-- 品牌名 -->
      <h1 class="text-xl font-bold font-display text-tj-primary tracking-[4px] text-center mb-2">
        天机 AI预测大师
      </h1>
      <p class="text-[11px] text-tj-text-secondary tracking-[3px] uppercase font-mono">
        MYSTIC CYBER-OCCULTISM
      </p>
    </div>

    <!-- 底部距安全区 64px：Slogan -->
    <div class="text-xs text-tj-text-secondary tracking-widest pb-16 z-10">
      洞察天机 · 洞见真我
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
let timer: any = null;

onMounted(() => {
  timer = setTimeout(() => {
    router.replace("/home");
  }, 2000);
});

onUnmounted(() => {
  if (timer) clearTimeout(timer);
});
</script>

<style scoped>
@keyframes breathe {
  0%, 100% {
    transform: scale(1);
    opacity: 0.4;
  }
  50% {
    transform: scale(1.08);
    opacity: 0.8;
  }
}
.animate-breathe {
  animation: breathe 2.5s ease-in-out infinite;
}
</style>
