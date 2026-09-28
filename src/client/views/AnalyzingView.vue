<template>
  <div class="flex-1 flex flex-col justify-between items-center px-4 pt-3 pb-6 select-none relative overflow-hidden min-h-[calc(100vh-3.5rem)]">
    <!-- Dynamic Ambient Cosmic Glow -->
    <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-secondary-container/20 blur-[100px] pointer-events-none"></div>
    <div class="absolute top-48 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full bg-primary/10 blur-[80px] pointer-events-none"></div>

    <!-- 失败状态展示 -->
    <div v-if="hasError" class="flex-1 flex flex-col items-center justify-center text-center my-auto relative z-10">
      <div class="w-16 h-16 rounded-full bg-tj-danger/10 border border-tj-danger/30 flex items-center justify-center text-3xl mb-4">
        ⚠️
      </div>
      <h3 class="text-base font-semibold text-on-surface mb-2">
        推演未成功，已为您自动退款
      </h3>
      <p class="text-xs text-on-surface-variant mb-6 max-w-xs">
        当前边缘 AI 节点网络波动或参数不合规，未扣减您的任何费用或免费额度。
      </p>
      <button
        @click="router.replace('/home')"
        class="px-6 py-2.5 rounded-full bg-tj-grad-gold text-[#1A1405] text-xs font-bold shadow-gold-glow active:scale-95 transition-transform"
      >
        返回首页
      </button>
    </div>

    <!-- 正常推演状态 -->
    <template v-else>
      <div class="h-1"></div>

      <!-- 220px 核心算法星盘组件 (垂直居中) -->
      <div class="relative flex flex-col items-center justify-center w-full max-w-sm z-10">
        <!-- 罗盘与八卦动效组件 -->
        <AstroCompass :progress="progress" />

        <!-- 当前阶段文案指示 -->
        <div class="flex flex-col items-center text-center mt-3 w-full">
          <div class="flex items-center gap-2 mb-1">
            <span class="inline-block w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
            <p class="text-base sm:text-lg text-on-surface font-semibold tracking-wide">
              {{ currentStageTitle }}
            </p>
          </div>
          <p class="text-xs text-on-surface-variant/80">
            基于东方星象与 Web3 零知识证明算法协同推演
          </p>

          <div
            v-if="streamingSnippet"
            class="mt-2 px-3 py-0.5 rounded-full bg-tertiary/10 border border-tertiary/30 text-[11px] text-tertiary font-mono truncate max-w-[280px] animate-pulse"
          >
            ⚡ {{ streamingSnippet }}
          </div>
        </div>

        <!-- 四步流程阶段卡片 (Stage Flow Stepper Indicator) -->
        <div class="w-full mt-4 px-1">
          <div class="bg-surface-container-low/90 backdrop-blur-md rounded-xl p-4 shadow-sm border border-white/5">
            <div class="flex flex-col gap-3">
              <!-- Step 1: 连接AI智库 -->
              <div class="flex items-center gap-3">
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors"
                  :class="getStepStatus(1).bgClass"
                >
                  <span v-if="getStepStatus(1).isDone" class="text-primary text-xs font-bold">✓</span>
                  <div v-else-if="getStepStatus(1).isCurrent" class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></div>
                  <span v-else class="w-1.5 h-1.5 rounded-full bg-outline"></span>
                </div>
                <div class="flex-1 flex items-center justify-between min-w-0">
                  <span :class="getStepStatus(1).textClass">连接AI智库</span>
                  <span :class="getStepStatus(1).badgeClass">{{ getStepStatus(1).label }}</span>
                </div>
              </div>

              <!-- Step 2: 排布命盘象数 -->
              <div class="flex items-center gap-3">
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors"
                  :class="getStepStatus(2).bgClass"
                >
                  <span v-if="getStepStatus(2).isDone" class="text-primary text-xs font-bold">✓</span>
                  <div v-else-if="getStepStatus(2).isCurrent" class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></div>
                  <span v-else class="w-1.5 h-1.5 rounded-full bg-outline"></span>
                </div>
                <div class="flex-1 flex items-center justify-between min-w-0">
                  <span :class="getStepStatus(2).textClass">排布命盘象数</span>
                  <span :class="getStepStatus(2).badgeClass">{{ getStepStatus(2).label }}</span>
                </div>
              </div>

              <!-- Step 3: 推演五行格局 -->
              <div class="flex items-center gap-3">
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors"
                  :class="getStepStatus(3).bgClass"
                >
                  <span v-if="getStepStatus(3).isDone" class="text-primary text-xs font-bold">✓</span>
                  <div v-else-if="getStepStatus(3).isCurrent" class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></div>
                  <span v-else class="w-1.5 h-1.5 rounded-full bg-outline"></span>
                </div>
                <div class="flex-1 flex items-center justify-between min-w-0">
                  <span :class="getStepStatus(3).textClass">推演五行格局</span>
                  <span :class="getStepStatus(3).badgeClass">{{ getStepStatus(3).label }}</span>
                </div>
              </div>

              <!-- Step 4: 专属报告生成 -->
              <div class="flex items-center gap-3">
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors"
                  :class="getStepStatus(4).bgClass"
                >
                  <span v-if="getStepStatus(4).isDone" class="text-primary text-xs font-bold">✓</span>
                  <div v-else-if="getStepStatus(4).isCurrent" class="w-2 h-2 rounded-full bg-tertiary animate-pulse"></div>
                  <span v-else class="w-1.5 h-1.5 rounded-full bg-outline"></span>
                </div>
                <div class="flex-1 flex items-center justify-between min-w-0">
                  <span :class="getStepStatus(4).textClass">专属报告生成</span>
                  <span :class="getStepStatus(4).badgeClass">{{ getStepStatus(4).label }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 底部区域 (诗句轮播与后台推演) -->
      <div class="w-full flex flex-col items-center text-center pb-3 z-10">
        <!-- 距底 96px 诗句轮播 (12px --tj-text-faint) -->
        <div class="h-6 flex items-center justify-center text-center mb-3 px-4 opacity-80">
          <transition name="fade-poem" mode="out-in">
            <p :key="currentPoemIndex" class="text-xs text-on-surface-variant font-display tracking-widest leading-relaxed">
              「{{ poems[currentPoemIndex] }}」
            </p>
          </transition>
        </div>

        <!-- 次级幽灵动作按钮：「后台推演」 -->
        <button
          @click="pushToBackground"
          class="h-11 px-6 rounded-full bg-surface-container-high/80 text-secondary border border-secondary/20 font-label-md text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 hover:bg-surface-container-high active:scale-95 transition-all shadow-sm"
          type="button"
        >
          <svg class="w-4 h-4 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" stroke-width="2" stroke-linecap="round" />
            <rect x="14" y="4" width="4" height="16" rx="1" stroke-width="2" stroke-linecap="round" />
          </svg>
          <span>后台推演</span>
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
const progress = ref(15);
const currentStageIndex = ref(0);
const currentPoemIndex = ref(0);
const hasError = ref(false);
const liveStageMessage = ref("");
const streamingSnippet = ref("");
const isPushingToBackground = ref(false);

const defaultStages = [
  "正在连接 AI 智库大数据…",
  "正在排布您的专属命盘…",
  "正在推演五行格局…",
  "正在生成您的专属报告…",
];

const currentStageTitle = computed(() => {
  return liveStageMessage.value || defaultStages[currentStageIndex.value];
});

const poems = [
  "天行健，君子以自强不息；地势坤，君子以厚德载物",
  "一命二运三风水，四积阴德五读书",
  "顺天应时，动静咸宜，善易者不卜",
  "祸兮福之所倚，福兮祸之所伏",
];

let stageTimer: any = null;
let poemTimer: any = null;
let progressSimTimer: any = null;
let abortController: AbortController | null = null;

function getStepStatus(stepIndex: number) {
  const p = progress.value;
  if (stepIndex === 1) {
    if (p < 25) {
      return {
        isDone: false,
        isCurrent: true,
        label: "连接中",
        bgClass: "bg-tertiary/20",
        textClass: "text-xs font-medium text-tertiary",
        badgeClass: "text-[11px] text-tertiary animate-pulse font-medium",
      };
    }
    return {
      isDone: true,
      isCurrent: false,
      label: "已就绪",
      bgClass: "bg-primary/20",
      textClass: "text-xs text-on-surface font-normal",
      badgeClass: "text-[11px] text-primary font-medium",
    };
  }
  if (stepIndex === 2) {
    if (p < 25) {
      return {
        isDone: false,
        isCurrent: false,
        label: "等待中",
        bgClass: "bg-surface-container-highest",
        textClass: "text-xs text-on-surface/50 font-normal",
        badgeClass: "text-[11px] text-outline",
      };
    }
    if (p < 55) {
      return {
        isDone: false,
        isCurrent: true,
        label: "推演中",
        bgClass: "bg-tertiary/20",
        textClass: "text-xs font-medium text-tertiary",
        badgeClass: "text-[11px] text-tertiary animate-pulse font-medium",
      };
    }
    return {
      isDone: true,
      isCurrent: false,
      label: "已完成",
      bgClass: "bg-primary/20",
      textClass: "text-xs text-on-surface font-normal",
      badgeClass: "text-[11px] text-primary font-medium",
    };
  }
  if (stepIndex === 3) {
    if (p < 55) {
      return {
        isDone: false,
        isCurrent: false,
        label: "等待中",
        bgClass: "bg-surface-container-highest",
        textClass: "text-xs text-on-surface/50 font-normal",
        badgeClass: "text-[11px] text-outline",
      };
    }
    if (p < 85) {
      return {
        isDone: false,
        isCurrent: true,
        label: "推演中",
        bgClass: "bg-tertiary/20",
        textClass: "text-xs font-medium text-tertiary",
        badgeClass: "text-[11px] text-tertiary animate-pulse font-medium",
      };
    }
    return {
      isDone: true,
      isCurrent: false,
      label: "已完成",
      bgClass: "bg-primary/20",
      textClass: "text-xs text-on-surface font-normal",
      badgeClass: "text-[11px] text-primary font-medium",
    };
  }
  // Step 4
  if (p < 85) {
    return {
      isDone: false,
      isCurrent: false,
      label: "等待中",
      bgClass: "bg-surface-container-highest",
      textClass: "text-xs text-on-surface/50 font-normal",
      badgeClass: "text-[11px] text-outline",
    };
  }
  if (p < 100) {
    return {
      isDone: false,
      isCurrent: true,
      label: "生成中",
      bgClass: "bg-tertiary/20",
      textClass: "text-xs font-medium text-tertiary",
      badgeClass: "text-[11px] text-tertiary animate-pulse font-medium",
    };
  }
  return {
    isDone: true,
    isCurrent: false,
    label: "已完成",
    bgClass: "bg-primary/20",
    textClass: "text-xs text-on-surface font-normal",
    badgeClass: "text-[11px] text-primary font-medium",
  };
}

onMounted(async () => {
  // 阶段轮播
  stageTimer = setInterval(() => {
    currentStageIndex.value = (currentStageIndex.value + 1) % defaultStages.length;
  }, 2400);

  // 诗句 3.5s 轮播
  poemTimer = setInterval(() => {
    currentPoemIndex.value = (currentPoemIndex.value + 1) % poems.length;
  }, 3500);

  // 平滑进度仿真
  progressSimTimer = setInterval(() => {
    if (progress.value < 94) {
      const increment = Math.floor(Math.random() * 3) + 1;
      progress.value = Math.min(94, progress.value + increment);
    }
  }, 1200);

  try {
    const rawForm = sessionStorage.getItem("tj_current_form");
    const formData = rawForm ? JSON.parse(rawForm) : {};

    // 1. 创建测算订单
    let currentUserId = userStore.user?.id;
    if (!currentUserId || currentUserId === "guest") {
      let localGuestId = typeof window !== "undefined" ? localStorage.getItem("tj_user_id") : null;
      if (!localGuestId || localGuestId === "guest") {
        localGuestId = `guest_${Math.random().toString(36).slice(2, 10)}`;
        if (typeof window !== "undefined") {
          localStorage.setItem("tj_user_id", localGuestId);
        }
      }
      currentUserId = localGuestId;
    }

    const payType = userStore.isVip || userStore.freeQuota > 0 ? "FREE_QUOTA" : "USDT_TRC20";

    const submitRes = await fetch("/api/divine/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: currentUserId,
        category: categoryType.value,
        inputData: formData,
        imageBase64: formData.imageBase64,
        payType,
      }),
    });

    const submitJson = await submitRes.json();
    if (!submitJson.success || !submitJson.data?.orderId) {
      throw new Error(submitJson.error || "创建订单失败");
    }

    // 立即同步后端最新剩余免费额度，避免前端滞后
    if (typeof submitJson.data?.userFreeQuota === "number") {
      userStore.updateFreeQuota(submitJson.data.userFreeQuota);
    }

    const orderId = submitJson.data.orderId;
    progress.value = Math.max(progress.value, 30);

    // 2. 建立真实 SSE 流式推演连接
    abortController = new AbortController();
    const streamRes = await fetch(`/api/divine/stream?orderId=${encodeURIComponent(orderId)}`, {
      signal: abortController.signal,
    });

    if (!streamRes.ok || !streamRes.body) {
      throw new Error("SSE 推演流连接失败");
    }

    const reader = streamRes.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let reportData: any = null;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n\n");
      buffer = lines.pop() || "";

      for (const block of lines) {
        if (!block.trim()) continue;
        const eventMatch = block.match(/event:\s*([^\n]+)/);
        const dataMatch = block.match(/data:\s*([\s\S]+)/);

        if (eventMatch && dataMatch) {
          const eventType = eventMatch[1].trim();
          let payload: any = null;
          try {
            payload = JSON.parse(dataMatch[1].trim());
          } catch {
            payload = dataMatch[1].trim();
          }

          if (eventType === "stage") {
            if (payload?.title) {
              liveStageMessage.value = `${payload.title}…`;
            }
            if (payload?.step === 1) progress.value = Math.max(progress.value, 35);
            if (payload?.step === 2) progress.value = Math.max(progress.value, 60);
            if (payload?.step === 3) progress.value = Math.max(progress.value, 82);
          } else if (eventType === "chunk") {
            if (payload?.text) {
              streamingSnippet.value = payload.text.trim().slice(-30);
              if (progress.value < 96) {
                progress.value = Math.min(96, progress.value + 1);
              }
            }
          } else if (eventType === "complete") {
            reportData = payload;
            progress.value = 100;
            liveStageMessage.value = "推演圆满完成，正在呈现报告…";
          } else if (eventType === "error") {
            console.warn("推演流收到异常通知:", payload);
          }
        }
      }
    }

    // 3. 推演完成，存储结果并跳转
    sessionStorage.setItem(
      "tj_last_result",
      JSON.stringify(
        reportData || {
          orderId,
          category: categoryType.value,
          isUnlocked: Boolean(submitJson.data.isCompleted),
        }
      )
    );

    setTimeout(() => {
      if (reportData?.isUnlocked || submitJson.data.isCompleted) {
        router.replace(`/feature/${categoryType.value}/report?orderId=${orderId}`);
      } else {
        router.replace(`/feature/${categoryType.value}/preview?orderId=${orderId}`);
      }
    }, 600);
  } catch (err: any) {
    console.warn("推演连接进入离线仿真模式:", err);
    // 平滑仿真推演全流程，确保动效与阶段切换丝滑呈现
    let simStep = 1;
    const simInterval = setInterval(() => {
      progress.value = Math.min(100, progress.value + 18);
      if (progress.value >= 35 && simStep < 2) {
        simStep = 2;
        liveStageMessage.value = "正在排布您的专属命盘…";
      } else if (progress.value >= 60 && simStep < 3) {
        simStep = 3;
        liveStageMessage.value = "正在推演五行格局…";
      } else if (progress.value >= 85 && simStep < 4) {
        simStep = 4;
        liveStageMessage.value = "正在生成您的专属报告…";
      }

      if (progress.value >= 100) {
        clearInterval(simInterval);
        setTimeout(() => {
          router.replace(`/feature/${categoryType.value}/preview`);
        }, 1000);
      }
    }, 800);
  }
});

onUnmounted(() => {
  if (stageTimer) clearInterval(stageTimer);
  if (poemTimer) clearInterval(poemTimer);
  if (progressSimTimer) clearInterval(progressSimTimer);
  if (abortController && !isPushingToBackground.value) {
    abortController.abort();
  }
});

function pushToBackground() {
  isPushingToBackground.value = true;
  uiStore.showToast("已转至后台计算，推演完成后将推送通知");
  router.push("/me/records");
}
</script>

<style scoped>
.fade-poem-enter-active,
.fade-poem-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
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
