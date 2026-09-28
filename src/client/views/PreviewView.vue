<template>
  <div class="flex-1 pb-28 px-4 pt-3 select-none relative overflow-hidden">
    <!-- Atmospheric Aura Highlights -->
    <div class="absolute -top-10 left-1/2 -translate-x-1/2 w-80 h-80 bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>
    <div class="absolute top-96 right-0 w-60 h-60 bg-secondary-container/20 rounded-full blur-[90px] pointer-events-none"></div>

    <!-- 1. 报告头卡 (深金底纹卡片，金云纹理与神圣几何水印) -->
    <div class="relative overflow-hidden rounded-2xl bg-surface-container-low shadow-xl p-5 mb-4 border border-tj-primary/25 text-center flex flex-col items-center">
      <!-- Golden Cloud / Nebular Sacred Texture Overlay -->
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent pointer-events-none"></div>

      <!-- Sacred Geometry Watermark SVG -->
      <svg class="absolute -right-8 -top-8 w-44 h-44 text-primary/10 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="46" stroke-dasharray="2 3" stroke-width="0.75"></circle>
        <circle cx="50" cy="50" r="34" stroke-width="0.5"></circle>
        <polygon points="50,6 88,28 88,72 50,94 12,72 12,28" stroke-width="0.5"></polygon>
        <polygon points="50,94 12,28 88,28" stroke-width="0.3"></polygon>
        <polygon points="50,6 88,72 12,72" stroke-width="0.3"></polygon>
      </svg>

      <div class="relative z-10 flex flex-col items-center">
        <!-- Occult Monogram Halo Badge -->
        <div class="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center mb-2 shadow-inner ring-1 ring-primary/30">
          <span class="text-primary text-xl">✦</span>
        </div>

        <h2 class="font-headline-sm text-base sm:text-lg font-semibold text-primary tracking-wide">
          您的专属测算报告
        </h2>
        <div class="mt-1 font-label-sm text-xs text-outline tracking-widest font-mono">
          NO.{{ reportNo }}
        </div>
        <p class="mt-1 font-body-sm text-xs text-on-surface-variant">
          {{ todayStr }} · {{ userStore.user?.nickname || "天机缘主" }} · {{ categoryName }}
        </p>
      </div>
    </div>

    <!-- 2. 综合结论区 (免费部分) -->
    <div class="bg-surface-container-low border border-white/10 rounded-2xl p-4 mb-4 space-y-4 shadow-lg relative z-10">
      <!-- Card Section Title -->
      <div class="flex items-center justify-between pb-2 border-b border-white/5">
        <div class="flex items-center gap-2">
          <span class="w-1.5 h-4 rounded-full bg-primary"></span>
          <h3 class="font-headline-sm text-[15px] font-semibold text-on-surface tracking-wide">综合结论</h3>
        </div>
        <span class="px-2 py-0.5 rounded text-xs font-semibold bg-primary/10 text-primary">已解天机</span>
      </div>

      <!-- 摘要正文 (14px/400，行高 1.8) -->
      <div class="text-sm font-normal text-on-surface/90 leading-[1.8] space-y-2.5 text-justify">
        <p v-if="previewSummary">
          {{ previewSummary }}
        </p>
        <template v-else>
          <p>
            乾造生于甲子年秋月，日元旺相，五行金水相涵，气象峥嵘。一生格局以印绶生身为本，财官互济为用，天干透乙木伤官生财，地支见申辰拱水，格局清贵，中年以后宏图大展，必成大器之象。
          </p>
          <p>
            早年行南方火运，火土相杂，稍有波折奔波，青年逢磨砺生光芒。自三十五岁起转入西方金水清纯之境，贵人相辅，运势如日中天。
          </p>
        </template>
      </div>

      <!-- 核心亮点词签 (AI 亮点提取) -->
      <div v-if="previewHighlights.length > 0" class="flex flex-wrap gap-2 pt-1">
        <span
          v-for="(hl, hIdx) in previewHighlights"
          :key="hIdx"
          class="px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/30 text-xs font-medium text-primary-fixed"
        >
          ✦ {{ hl }}
        </span>
      </div>

      <!-- 综合评分指数条 3 条 (动态自适应门类) -->
      <div class="space-y-3 pt-2 border-t border-white/5">
        <!-- 第 1 指数 -->
        <div>
          <div class="flex justify-between text-xs mb-1.5">
            <span class="text-on-surface-variant">{{ scoreLabels.first }}</span>
            <span class="text-primary font-bold font-num">{{ scores.wealth }} 分</span>
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
          <div class="flex justify-between text-xs mb-1.5">
            <span class="text-on-surface-variant">{{ scoreLabels.second }}</span>
            <span class="text-tertiary font-bold font-num">{{ scores.career }} 分</span>
          </div>
          <div class="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              class="h-full bg-tertiary rounded-full transition-all duration-700 shadow-cyan-glow"
              :style="{ width: `${scores.career}%` }"
            ></div>
          </div>
        </div>

        <!-- 第 3 指数 -->
        <div>
          <div class="flex justify-between text-xs mb-1.5">
            <span class="text-on-surface-variant">{{ scoreLabels.third }}</span>
            <span class="text-secondary font-bold font-num">{{ scores.love }} 分</span>
          </div>
          <div class="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              class="h-full bg-secondary rounded-full transition-all duration-700 shadow-purple-glow"
              :style="{ width: `${scores.love}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- 3. 付费墙 (未解锁时呈现半透模糊遮罩与权益列表) -->
    <div v-if="!isUnlocked" class="relative bg-surface-container-low border border-primary/25 rounded-2xl p-5 mb-4 overflow-hidden shadow-2xl z-10">
      <!-- 真实命理底文模糊遮罩 -->
      <div class="filter blur-md select-none opacity-40 space-y-2 pointer-events-none text-xs text-on-surface leading-relaxed">
        <p>【命盘天干地支全息流布】日主元神丙火生于酉月，财星深藏不露，中年之后宏图大展，天乙贵人与禄马齐临，命中暗藏大富之机...</p>
        <p>【流年吉凶关键拐点】逢丙午、丁未流年，岁运并临引发大变动，东南方为大吉发财方位，若把握关键契机可达成数倍飞跃...</p>
        <p>【宗师密授避煞开运】居家办公宜坐东朝西，案头置阔叶绿植生旺震宫，随身佩戴黑曜石或金质饰物以通关护元神...</p>
      </div>

      <!-- 遮罩中央锁头与特权清单 -->
      <div class="absolute inset-0 bg-surface-container-lowest/85 backdrop-blur-md flex flex-col items-center justify-center p-5 text-center">
        <!-- 40px 金色锁头徽标 -->
        <div class="w-12 h-12 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary text-2xl mb-2 shadow-gold-glow">
          🔒
        </div>
        <h4 class="text-sm font-bold text-on-surface mb-3 tracking-wide">
          解锁获取 5 大深度专属命盘特权
        </h4>

        <!-- 5 大专属权益清单 (逐条 ✓ 金) -->
        <div class="space-y-1.5 text-xs text-left max-w-[260px] mb-1">
          <div v-for="item in benefits" :key="item" class="flex items-center gap-2 text-on-surface">
            <span class="text-primary font-bold">✓</span>
            <span class="truncate">{{ item }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. 价格卡 (居中) -->
    <div v-if="!isUnlocked" class="text-center space-y-1.5 mb-4 z-10 relative">
      <div class="flex items-baseline justify-center gap-2">
        <span class="text-xs line-through text-outline">9.9 USDT</span>
        <span class="text-3xl font-bold font-num text-primary tracking-tight">
          6 <span class="text-sm font-sans font-medium">USDT</span>
        </span>
      </div>
      <div class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-secondary-container/20 text-xs text-tertiary font-medium">
        <span>💎</span> 会员 4.8 USDT (VIP 尊享 8 折特权)
      </div>
      <div v-if="userStore.freeQuota > 0" class="text-xs text-primary-fixed font-semibold pt-1">
        ✨ 您当前有 {{ userStore.freeQuota }} 次免费额度可直接抵扣！
      </div>
    </div>

    <!-- 5. 社会证明行 -->
    <div class="text-xs text-outline text-center mb-6 z-10 relative flex items-center justify-center gap-1">
      <span class="text-primary">✦</span>
      <span>128,376 位缘主已解锁本报告</span>
    </div>

    <!-- 6. 吸底主按钮 -->
    <div class="fixed bottom-0 inset-x-0 max-w-[430px] mx-auto p-3.5 bg-surface-container-lowest/90 backdrop-blur-xl border-t border-white/10 z-30 shadow-[0_-8px_24px_rgba(0,0,0,0.6)]">
      <button
        @click="handleUnlock"
        :disabled="loading"
        class="w-full h-12 rounded-full font-bold text-base transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-primary-fixed via-primary to-primary-container text-surface-container-lowest shadow-[0_4px_16px_rgba(212,175,55,0.35)] active:scale-[0.98]"
      >
        <span v-if="loading" class="w-5 h-5 rounded-full border-2 border-surface-container-lowest border-t-transparent animate-spin"></span>
        <span v-if="loading">正在解锁中...</span>
        <span v-else-if="isUnlocked">查看完整报告</span>
        <span v-else-if="userStore.freeQuota > 0">消耗免费次数解锁完整报告</span>
        <span v-else class="flex items-center gap-1.5">
          <span>🔒</span> 解锁完整报告 6 USDT
        </span>
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
