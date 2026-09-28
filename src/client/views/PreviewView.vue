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

      <!-- 综合评分指数条 3 条 (动态自适应门类) -->
      <div class="space-y-2.5 pt-2 border-t border-white/5">
        <!-- 第 1 指数 -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-tj-text-secondary">{{ scoreLabels.first }}</span>
            <span class="text-tj-primary font-bold font-num">{{ scores.wealth }} 分</span>
          </div>
          <div class="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              class="h-full bg-tj-grad-gold rounded-full transition-all duration-700 shadow-gold-glow"
              :style="{ width: `${scores.wealth}%` }"
            ></div>
          </div>
        </div>

        <!-- 第 2 指数 -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-tj-text-secondary">{{ scoreLabels.second }}</span>
            <span class="text-tj-cyan font-bold font-num">{{ scores.career }} 分</span>
          </div>
          <div class="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              class="h-full bg-tj-cyan rounded-full transition-all duration-700 shadow-cyan-glow"
              :style="{ width: `${scores.career}%` }"
            ></div>
          </div>
        </div>

        <!-- 第 3 指数 -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-tj-text-secondary">{{ scoreLabels.third }}</span>
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

const scoreLabels = computed(() => {
  const t = categoryType.value;
  if (t === "auspicious_date") {
    return { first: "天时吉星指数", second: "地利生旺指数", third: "主命契合指数" };
  }
  if (t === "phone_plate") {
    return { first: "天医财星指数", second: "延年贵人指数", third: "出入平安指数" };
  }
  if (t === "personal_naming" || t === "company_naming" || t === "name_test") {
    return { first: "三才数理指数", second: "五音音律指数", third: "喜用互补指数" };
  }
  if (t === "qimen_decision") {
    return { first: "天时机遇指数", second: "地利人和指数", third: "避险破局指数" };
  }
  if (t === "love_match") {
    return { first: "天合地合指数", second: "纳音五行指数", third: "白头偕老指数" };
  }
  return { first: "财运指数", second: "事业指数", third: "姻缘指数" };
});

const categoryBenefits: Record<string, string[]> = {
  auspicious_date: [
    "全周期良辰吉日精选清单 (公历/农历/干支)",
    "各吉日黄金仪式启动时辰 (具体至分钟与吉神)",
    "主事人八字生克与随行亲友避煞化解方案",
    "专事实操正统科仪与迎祥纳福指南",
    "专属吉日高清排盘海报与离线导出",
  ],
  personal_naming: [
    "5-6 套天赐高分吉名方案详解",
    "《诗经》《楚辞》古籍原典出处考究",
    "三才五格数理与五音声韵相生格局",
    "八字喜用神精准扶抑与命局调和",
    "专属起名祝祷书高清海报与导出",
  ],
  company_naming: [
    "5-6 套大吉企业商号精选方案库",
    "行业赛道五行相生与八十一数理吉数",
    "品牌心智穿透力与商业 Slogan 推荐",
    "商标注册可行性分析与合规建议",
    "开业风水纳财时机与品牌运势全指南",
  ],
  phone_plate: [
    "号码八星数字能量磁场深度拆解",
    "天医延年与凶星制化全息阵列",
    "机主八字喜用神生克与财运调和",
    "吉祥尾号、手机壁纸与车内车饰化解锦囊",
    "数字能量全息报告高清导出",
  ],
  love_match: [
    "双方八字日柱干支天合地合深度排盘",
    "六十甲子纳音五行与双方生肖气运契合",
    "十神心智互补与情感核心摩擦点深剖",
    "感情考验流年拐点与和合破局秘方",
    "双人八字合婚庚帖高清导出",
  ],
  qimen_decision: [
    "时空奇门排盘九星八门八神时局全览",
    "所问事项天时地利人和综合胜算概率",
    "暗藏凶险阻碍与关键时间节点瓶颈",
    "决胜军师谋略、大吉方位与破局行动方案",
    "奇门时空大盘决疑报告导出",
  ],
  future_fortune: [
    "未来周期分年逐年运程深度详批",
    "大运交接与岁运喜用神调候引动",
    "四季月令吉凶拐点与重大突破契机",
    "趋吉避凶风水与贵人引动实操指引",
    "专属流年运势推演报告导出",
  ],
  name_test: [
    "康熙字典正统繁体笔画深度考据",
    "天格人格地格总额外格三才五格吉凶详析",
    "五音音律声韵与八字喜用神调和度",
    "姓名吉凶定论与能量提升优化建议",
    "姓名测算典藏报告高清导出",
  ],
  bazi: [
    "四柱八字乾坤排盘与十神旺衰全息图",
    "五行喜用神、忌神与命局调候真机",
    "事业官禄、正偏财运与人生富贵层级",
    "婚姻家庭、健康寿元与调候改运锦囊",
    "正统子平八字命盘详批报告导出",
  ],
  palm_face: [
    "面相三停五岳与十二宫位气色微观解构",
    "手相三大主线、事业线与掌丘全息印证",
    "面手合参：心智性格、行商天赋与聚财格局",
    "面相流年关口、气色调养与转运锦囊",
    "面相手相合参全息报告高清导出",
  ],
};

const benefits = computed(() => {
  return categoryBenefits[categoryType.value] || categoryBenefits.bazi;
});

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
