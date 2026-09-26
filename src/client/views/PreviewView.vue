<template>
  <div class="flex-1 pb-24 px-4 pt-3 select-none">
    <!-- 1. 报告头卡 (深金底纹卡片，金云纹理 8%) -->
    <div class="bg-gradient-to-b from-[#26203D] via-tj-bg-card to-[#121626] border border-tj-primary/30 rounded-2xl p-5 mb-4 shadow-gold-glow text-center relative overflow-hidden">
      <!-- 金云微光晕 -->
      <div class="absolute inset-0 bg-tj-primary/5 pointer-events-none"></div>

      <div class="relative z-10">
        <h2 class="text-base font-semibold text-tj-primary font-display mb-1 tracking-wide">
          您的专属测算报告
        </h2>
        <div class="text-xs text-tj-text-secondary font-mono mb-1">
          NO.{{ reportNo }}
        </div>
        <div class="text-xs text-tj-text-secondary">
          {{ todayStr }} · {{ userStore.user?.nickname || "天机缘主" }} · {{ categoryName }}
        </div>
      </div>
    </div>

    <!-- 2. 综合结论区 (免费部分) -->
    <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-4 mb-4 space-y-4">
      <div class="flex items-center justify-between pb-2 border-b border-white/5">
        <h3 class="text-[15px] font-semibold text-tj-text-primary flex items-center gap-2">
          <span class="w-1.5 h-3.5 bg-tj-primary rounded-full"></span>
          综合结论
        </h3>
        <span class="text-xs font-semibold text-tj-primary">
          {{ previewTitle }} · 评分 {{ scores.total }}
        </span>
      </div>

      <!-- 摘要正文 (14px/400，行高 1.8) -->
      <div class="text-sm font-normal text-tj-text-primary/90 leading-[1.8] space-y-2 text-justify">
        <p v-if="previewSummary">
          {{ previewSummary }}
        </p>
        <template v-else>
          <p>
            先天命盘气象清华，乾坤相生，主聪敏灵慧，具宏阔抱负。五行中和，木火之气相涵，能得贵人提携，行事沉稳而决断果敢。
          </p>
          <p>
            中年前后必见气运蜕变，吉星入命宫与官禄宫，适合开拓创新赛道、聚合团队资材。
          </p>
          <p>
            情感层面水润木荣，夫妻宫清和有度，善解人意，相处多有知己之契，凡事同舟共济自能家宅丰隆。
          </p>
        </template>
      </div>

      <!-- 核心亮点词签 (AI 亮点提取) -->
      <div v-if="previewHighlights.length > 0" class="flex flex-wrap gap-2 pt-1">
        <span
          v-for="(hl, hIdx) in previewHighlights"
          :key="hIdx"
          class="px-2.5 py-1 rounded-lg bg-tj-primary/10 border border-tj-primary/30 text-xs font-medium text-tj-primary-light"
        >
          ✦ {{ hl }}
        </span>
      </div>

      <!-- 综合评分指数条 3 条 (财运 / 事业 / 姻缘) -->
      <div class="space-y-2.5 pt-2 border-t border-white/5">
        <!-- 财运指数 -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-tj-text-secondary">财运指数</span>
            <span class="text-tj-primary font-bold font-num">{{ scores.wealth }} 分</span>
          </div>
          <div class="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              class="h-full bg-tj-grad-gold rounded-full transition-all duration-700 shadow-gold-glow"
              :style="{ width: `${scores.wealth}%` }"
            ></div>
          </div>
        </div>

        <!-- 事业指数 -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-tj-text-secondary">事业指数</span>
            <span class="text-tj-cyan font-bold font-num">{{ scores.career }} 分</span>
          </div>
          <div class="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              class="h-full bg-tj-cyan rounded-full transition-all duration-700 shadow-cyan-glow"
              :style="{ width: `${scores.career}%` }"
            ></div>
          </div>
        </div>

        <!-- 姻缘指数 -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-tj-text-secondary">姻缘指数</span>
            <span class="text-tj-purple font-bold font-num">{{ scores.love }} 分</span>
          </div>
          <div class="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              class="h-full bg-tj-purple rounded-full transition-all duration-700 shadow-purple-glow"
              :style="{ width: `${scores.love}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. 付费墙 (未解锁时呈现 200px 模糊遮罩与权益列表) -->
    <div v-if="!isUnlocked" class="relative bg-tj-bg-card border border-tj-primary/30 rounded-2xl p-5 mb-4 overflow-hidden">
      <!-- 模糊底文 -->
      <div class="filter blur-md select-none opacity-30 space-y-3 pointer-events-none">
        <div class="h-4 bg-white/20 rounded w-3/4"></div>
        <div class="h-3 bg-white/10 rounded w-full"></div>
        <div class="h-3 bg-white/10 rounded w-5/6"></div>
        <div class="h-4 bg-white/20 rounded w-2/3"></div>
        <div class="h-3 bg-white/10 rounded w-full"></div>
      </div>

      <!-- 遮罩中央 -->
      <div class="absolute inset-0 bg-[#0B0E1A]/85 backdrop-blur-md flex flex-col items-center justify-center p-5 text-center">
        <div class="text-[40px] text-tj-primary mb-2 leading-none">
          🔒
        </div>
        <h4 class="text-sm font-bold text-tj-text-primary mb-3">
          解锁获取 5 大深度专属命盘特权
        </h4>

        <!-- 5 大专属权益清单 (逐条 ✓ 金) -->
        <div class="space-y-1.5 text-xs text-left max-w-[240px] mb-2">
          <div v-for="item in benefits" :key="item" class="flex items-center gap-2 text-tj-text-primary">
            <span class="text-tj-primary font-bold">✓</span>
            <span>{{ item }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. 价格卡 (居中) -->
    <div v-if="!isUnlocked" class="text-center space-y-1 mb-4">
      <div class="flex items-baseline justify-center gap-2">
        <span class="text-xs line-through text-tj-text-faint">9.9 USDT</span>
        <span class="text-[26px] font-bold font-num text-tj-primary">
          6 <span class="text-sm font-sans">USDT</span>
        </span>
      </div>
      <div class="text-xs text-tj-cyan font-medium">
        会员 4.8 USDT (VIP 长期无限畅享)
      </div>
      <div v-if="userStore.freeQuota > 0" class="text-xs text-tj-primary-light font-semibold">
        ✨ 您当前有 {{ userStore.freeQuota }} 次免费额度可直接抵扣！
      </div>
    </div>

    <!-- 5. 社会证明行 -->
    <div class="text-xs text-tj-text-faint text-center mb-6">
      128,376 位缘主已解锁本报告
    </div>

    <!-- 6. 吸底主按钮 -->
    <div class="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-4 bg-tj-bg/95 backdrop-blur-md border-t border-white/10 z-20">
      <button
        @click="handleUnlock"
        :disabled="loading"
        class="w-full h-12 rounded-full font-bold text-base transition-all flex items-center justify-center gap-2 bg-tj-grad-gold text-[#1A1405] shadow-gold-glow hover:brightness-110 active:scale-98"
      >
        <span v-if="loading" class="w-5 h-5 rounded-full border-2 border-[#1A1405] border-t-transparent animate-spin"></span>
        <span v-if="loading">正在解锁中...</span>
        <span v-else-if="isUnlocked">查看完整报告</span>
        <span v-else-if="userStore.freeQuota > 0">消耗免费次数解锁完整报告</span>
        <span v-else>解锁完整报告 6 USDT</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { useUIStore } from "../stores/ui";
import { CATEGORIES_CONFIG } from "../stores/divination";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const uiStore = useUIStore();

const categoryType = computed(() => (route.params.type as string) || "bazi");
const categoryName = computed(() => CATEGORIES_CONFIG[categoryType.value]?.name || "八字推测");

const currentOrderId = ref((route.query.orderId as string) || "");
const loading = ref(false);
const isUnlocked = ref(false);

const reportNo = ref("TJ" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "0001");
const todayStr = ref(new Date().toISOString().slice(0, 10));

const previewTitle = ref("乾元大吉局");
const previewSummary = ref("");
const previewHighlights = ref<string[]>([]);

const scores = ref({
  total: 88,
  wealth: 82,
  career: 75,
  love: 68,
});

const benefits = [
  "完整命盘解析",
  "流年运势详解",
  "吉凶方位指南",
  "专属开运建议",
  "PDF 报告下载",
];

onMounted(async () => {
  if (userStore.isVip) {
    isUnlocked.value = true;
  }

  // 1. 获取 orderId
  const lastResult = sessionStorage.getItem("tj_last_result");
  let lastData: any = null;
  if (lastResult) {
    try {
      lastData = JSON.parse(lastResult);
      if (lastData.orderId) {
        currentOrderId.value = lastData.orderId;
      }
      if (lastData.isUnlocked) {
        isUnlocked.value = true;
      }
    } catch {}
  }

  const queryOrderId = (route.query.orderId as string) || currentOrderId.value;
  if (queryOrderId) {
    currentOrderId.value = queryOrderId;
    reportNo.value = queryOrderId;

    // 2. 从后端加载真实推演预览数据
    try {
      const res = await fetch(`/api/divine/report/${encodeURIComponent(queryOrderId)}`);
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (d.preview) {
          previewTitle.value = d.preview.title || d.preview.rating || previewTitle.value;
          previewSummary.value = d.preview.summary || "";
          previewHighlights.value = Array.isArray(d.preview.highlights) ? d.preview.highlights : [];
          if (typeof d.preview.score === "number") {
            scores.value.total = d.preview.score;
            scores.value.wealth = Math.min(100, Math.round(d.preview.score * 0.95));
            scores.value.career = Math.min(100, Math.round(d.preview.score * 0.9));
            scores.value.love = Math.min(100, Math.round(d.preview.score * 0.85));
          }
          if (Array.isArray(d.preview.radar)) {
            for (const r of d.preview.radar) {
              if (r.label?.includes("财")) scores.value.wealth = r.value;
              if (r.label?.includes("前程") || r.label?.includes("事业")) scores.value.career = r.value;
              if (r.label?.includes("情") || r.label?.includes("缘")) scores.value.love = r.value;
            }
          }
        }
        if (d.isUnlocked) {
          isUnlocked.value = true;
        }
      }
    } catch (err) {
      console.warn("加载报告预览失败，使用本地缓存:", err);
    }
  }

  // 3. 兼容检查本地缓存
  if (lastData?.preview && !previewSummary.value) {
    previewTitle.value = lastData.preview.title || previewTitle.value;
    previewSummary.value = lastData.preview.summary || "";
    previewHighlights.value = lastData.preview.highlights || [];
    if (lastData.preview.score) {
      scores.value.total = lastData.preview.score;
      scores.value.wealth = Math.min(100, Math.round(lastData.preview.score * 0.95));
      scores.value.career = Math.min(100, Math.round(lastData.preview.score * 0.9));
      scores.value.love = Math.min(100, Math.round(lastData.preview.score * 0.85));
    }
  }
});

async function handleUnlock() {
  if (isUnlocked.value) {
    router.push({
      path: `/feature/${categoryType.value}/report`,
      query: currentOrderId.value ? { orderId: currentOrderId.value } : undefined,
    });
    return;
  }

  // 若用户有免费额度直接核销
  if (userStore.freeQuota > 0) {
    loading.value = true;
    try {
      const res = await fetch("/api/order/use-free-quota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userStore.user?.id || "guest",
          category: categoryType.value,
          orderId: currentOrderId.value || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        isUnlocked.value = true;
        uiStore.showToast("已使用免费额度解锁报告！");
        await userStore.refreshProfile();
        router.push({
          path: `/feature/${categoryType.value}/report`,
          query: currentOrderId.value ? { orderId: currentOrderId.value } : undefined,
        });
      } else {
        uiStore.showToast(data.error || "核销失败");
      }
    } catch {
      uiStore.showToast("网络异常，请重试");
    } finally {
      loading.value = false;
    }
  } else {
    // 跳转 P08 支付页
    router.push({
      path: "/pay",
      query: {
        category: categoryType.value,
        orderId: currentOrderId.value || undefined,
        type: "single",
        amount: "6",
      },
    });
  }
}
</script>
