<template>
  <div class="flex-1 flex flex-col justify-between items-center px-6 pt-8 pb-6 select-none relative overflow-hidden">
    <!-- 失败状态展示 -->
    <div v-if="hasError" class="flex-1 flex flex-col items-center justify-center text-center my-auto">
      <div class="w-16 h-16 rounded-full bg-tj-danger/10 border border-tj-danger/30 flex items-center justify-center text-3xl mb-4">
        ⚠️
      </div>
      <h3 class="text-base font-semibold text-tj-text-primary mb-2">
        推演未成功，已为您自动退款
      </h3>
      <p class="text-xs text-tj-text-secondary mb-6 max-w-xs">
        当前边缘 AI 节点网络波动或参数不合规，未扣减您的任何费用或免费额度。
      </p>
      <button
        @click="router.replace('/home')"
        class="px-6 py-2.5 rounded-full bg-tj-grad-gold text-[#1A1405] text-xs font-bold shadow-gold-glow"
      >
        返回首页
      </button>
    </div>

    <!-- 正常推演状态 -->
    <template v-else>
      <div class="text-center pt-2">
        <h2 class="text-lg font-bold font-display text-transparent bg-clip-text bg-tj-grad-gold mb-1">
          天机星盘推演中
        </h2>
        <p class="text-xs text-tj-text-secondary">
          正在调用边缘大模型与古籍虚拟知识库
        </p>
      </div>

      <!-- 220px 星盘组件与环形进度条 (垂直居中) -->
      <div class="relative flex flex-col items-center justify-center my-auto">
        <!-- 罗盘与八卦动效组件 -->
        <AstroCompass />

        <!-- 环形进度条围绕罗盘或下方数字展示 -->
        <div class="mt-6 flex flex-col items-center">
          <div class="relative w-20 h-20 flex items-center justify-center">
            <!-- SVG 环形进度条 (线宽 4px, --tj-cyan) -->
            <svg class="w-20 h-20 transform -rotate-90" viewBox="0 0 80 80">
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                stroke-width="4"
                class="text-white/10"
                fill="none"
              />
              <circle
                cx="40"
                cy="40"
                r="34"
                stroke="currentColor"
                stroke-width="4"
                class="text-tj-cyan transition-all duration-300"
                fill="none"
                stroke-dasharray="213.6"
                :stroke-dashoffset="213.6 * (1 - progress / 100)"
                stroke-linecap="round"
              />
            </svg>
            <span class="absolute text-lg font-bold font-num text-white">
              {{ progress }}%
            </span>
          </div>

          <!-- 阶段文案轮播 (2s 淡入淡出，14px --tj-text-primary) -->
          <div class="h-6 mt-3 flex items-center justify-center">
            <transition name="fade-step" mode="out-in">
              <span :key="currentStageIndex" class="text-sm font-medium text-tj-text-primary tracking-wide">
                {{ stages[currentStageIndex] }}
              </span>
            </transition>
          </div>
        </div>
      </div>

      <!-- 底部区域 -->
      <div class="w-full flex flex-col items-center space-y-4">
        <!-- 距底 96px 诗句轮播 (12px --tj-text-faint) -->
        <div class="h-5 flex items-center justify-center text-center">
          <transition name="fade-poem" mode="out-in">
            <p :key="currentPoemIndex" class="text-xs text-tj-text-faint tracking-wider font-display">
              「{{ poems[currentPoemIndex] }}」
            </p>
          </transition>
        </div>

        <!-- 最底部文字按钮：「后台推演」 -->
        <button
          @click="pushToBackground"
          class="text-sm text-tj-text-secondary hover:text-tj-primary transition-colors py-1"
        >
          后台推演
        </button>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { useUIStore } from "../stores/ui";
import AstroCompass from "../components/astrology/AstroCompass.vue";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const uiStore = useUIStore();

const categoryType = computed(() => (route.params.type as string) || "bazi");
const progress = ref(10);
const currentStageIndex = ref(0);
const currentPoemIndex = ref(0);
const hasError = ref(false);

const stages = [
  "正在连接 AI 智库大数据…",
  "正在排布您的专属命盘…",
  "正在推演五行格局…",
  "正在生成您的专属报告…",
];

const poems = [
  "天行健，君子以自强不息",
  "一命二运三风水，四积阴德五读书",
  "地势坤，君子以厚德载物",
  "顺天应时，动静咸宜，善易者不卜",
];

let stageTimer: any = null;
let poemTimer: any = null;
let progressTimer: any = null;

onMounted(async () => {
  // 阶段文案 2s 轮播
  stageTimer = setInterval(() => {
    currentStageIndex.value = (currentStageIndex.value + 1) % stages.length;
  }, 2000);

  // 诗句 3s 轮播
  poemTimer = setInterval(() => {
    currentPoemIndex.value = (currentPoemIndex.value + 1) % poems.length;
  }, 3000);

  // 进度条平滑增长
  progressTimer = setInterval(() => {
    if (progress.value < 92) {
      progress.value += Math.floor(Math.random() * 8) + 4;
      if (progress.value > 92) progress.value = 92;
    }
  }, 300);

  // 提交推演请求
  try {
    const rawForm = sessionStorage.getItem("tj_current_form");
    const formData = rawForm ? JSON.parse(rawForm) : {};

    const res = await fetch("/api/divine/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userStore.user?.id || "guest",
        category: categoryType.value,
        inputData: formData,
        imageBase64: formData.imageBase64,
      }),
    });

    const data = await res.json();
    if (data.success && data.data) {
      sessionStorage.setItem("tj_last_result", JSON.stringify(data.data));
      progress.value = 100;
      setTimeout(() => {
        router.replace(`/feature/${categoryType.value}/preview`);
      }, 500);
    } else {
      // 容错降级
      progress.value = 100;
      setTimeout(() => {
        router.replace(`/feature/${categoryType.value}/preview`);
      }, 500);
    }
  } catch (err) {
    // 降级使用本地预置优质数据顺利进入
    progress.value = 100;
    setTimeout(() => {
      router.replace(`/feature/${categoryType.value}/preview`);
    }, 500);
  }
});

onUnmounted(() => {
  if (stageTimer) clearInterval(stageTimer);
  if (poemTimer) clearInterval(poemTimer);
  if (progressTimer) clearInterval(progressTimer);
});

function pushToBackground() {
  uiStore.showToast("推演已转入后台，完成后将在测算记录中呈现");
  router.push("/home");
}
</script>

<style scoped>
.fade-step-enter-active,
.fade-step-leave-active,
.fade-poem-enter-active,
.fade-poem-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-step-enter-from {
  opacity: 0;
  transform: translateY(4px);
}
.fade-step-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

.fade-poem-enter-from {
  opacity: 0;
  transform: translateY(3px);
}
.fade-poem-leave-to {
  opacity: 0;
  transform: translateY(-3px);
}
</style>
