<template>
  <div class="flex-1 pb-24 px-4 pt-3 select-none">
    <!-- 1. 报告封面头卡 (右上胶囊标签「专属完整版」紫金渐变) -->
    <div class="bg-gradient-to-b from-[#26203D] via-tj-bg-card to-[#121626] border border-tj-primary/40 rounded-2xl p-5 mb-4 shadow-gold-glow relative overflow-hidden">
      <!-- 胶囊标签 -->
      <div class="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-tj-grad-vip text-white text-[10px] font-bold shadow-md">
        专属完整版
      </div>

      <div class="relative z-10">
        <h2 class="text-base font-semibold text-tj-primary font-display mb-1 tracking-wide">
          {{ reportTitle }}
        </h2>
        <div class="text-xs text-tj-text-secondary font-mono mb-1">
          NO.{{ reportNo }}
        </div>
        <div class="text-xs text-tj-text-secondary">
          {{ todayStr }} · {{ userStore.user?.nickname || "天机缘主" }} · {{ categoryName }} · 综合评分 {{ reportScore }}分
        </div>
      </div>
    </div>

    <!-- 2. 命盘可视化卡 (高 240px，按门类动态全息渲染) -->
    <div class="h-[240px] bg-tj-bg-card border border-tj-primary/20 rounded-2xl p-4 mb-4 relative overflow-hidden flex flex-col justify-between shadow-sm">
      <div class="flex items-center justify-between border-b border-white/5 pb-2">
        <span class="text-xs font-semibold text-tj-primary-light flex items-center gap-1.5">
          <span>🌌</span> {{ chartTitle }}
        </span>
        <span class="text-[10px] text-tj-cyan font-mono">天机共振指数: {{ reportScore }}%</span>
      </div>

      <!-- A. 看相类：三停五岳与掌纹走势 -->
      <template v-if="categoryType === 'palm_face' || categoryType === 'palm_reading' || categoryType === 'face_reading'">
        <div class="grid grid-cols-3 gap-2 my-auto text-center py-2">
          <div class="p-2 rounded-xl bg-white/5 border border-white/5">
            <div class="text-[10px] text-tj-text-faint mb-1">上停 / 离卦天庭</div>
            <div class="text-sm font-bold text-tj-primary font-display">日月角明</div>
            <div class="text-[10px] text-tj-text-secondary mt-1">少年颖悟早成</div>
          </div>
          <div class="p-2 rounded-xl bg-tj-primary/10 border border-tj-primary/40 shadow-gold-glow">
            <div class="text-[10px] text-tj-primary-light mb-1">中停 / 鼻准田宅</div>
            <div class="text-sm font-bold text-tj-primary font-display">岳耸仓丰</div>
            <div class="text-[10px] text-tj-primary mt-1">中年家财丰实</div>
          </div>
          <div class="p-2 rounded-xl bg-white/5 border border-white/5">
            <div class="text-[10px] text-tj-text-faint mb-1">下停 / 地阁颐骨</div>
            <div class="text-sm font-bold text-tj-primary font-display">方圆得配</div>
            <div class="text-[10px] text-tj-text-secondary mt-1">晚福深厚安宁</div>
          </div>
        </div>
      </template>

      <!-- B. 手机车牌类：八星磁场分布 -->
      <template v-else-if="categoryType === 'phone_plate'">
        <div class="grid grid-cols-4 gap-2 my-auto text-center py-2">
          <div class="p-2 rounded-xl bg-tj-primary/10 border border-tj-primary/30">
            <div class="text-[10px] text-tj-primary-light mb-0.5">核心吉星</div>
            <div class="text-sm font-bold text-tj-primary font-display">天医延年</div>
            <div class="text-[10px] text-tj-text-secondary mt-0.5">财智亨通</div>
          </div>
          <div class="p-2 rounded-xl bg-white/5 border border-white/5">
            <div class="text-[10px] text-tj-text-faint mb-0.5">生助吉星</div>
            <div class="text-sm font-bold text-tj-cyan font-display">生气伏位</div>
            <div class="text-[10px] text-tj-text-secondary mt-0.5">贵人蓄势</div>
          </div>
          <div class="p-2 rounded-xl bg-white/5 border border-white/5">
            <div class="text-[10px] text-tj-text-faint mb-0.5">制化凶星</div>
            <div class="text-sm font-bold text-tj-text-primary font-display">绝命有制</div>
            <div class="text-[10px] text-tj-text-secondary mt-0.5">破局新生</div>
          </div>
          <div class="p-2 rounded-xl bg-white/5 border border-white/5">
            <div class="text-[10px] text-tj-text-faint mb-0.5">综合数理</div>
            <div class="text-sm font-bold text-tj-purple-light font-display">81上吉</div>
            <div class="text-[10px] text-tj-text-secondary mt-0.5">乾象得位</div>
          </div>
        </div>
      </template>

      <!-- C. 姓名类：三才五格 -->
      <template v-else-if="categoryType === 'name_test' || categoryType === 'personal_naming' || categoryType === 'company_naming'">
        <div class="grid grid-cols-5 gap-1.5 my-auto text-center py-2">
          <div class="p-1.5 rounded-xl bg-white/5 border border-white/5">
            <div class="text-[9px] text-tj-text-faint">天格 (根)</div>
            <div class="text-xs font-bold text-tj-text-primary mt-1">大吉</div>
          </div>
          <div class="p-1.5 rounded-xl bg-tj-primary/10 border border-tj-primary/40 shadow-gold-glow">
            <div class="text-[9px] text-tj-primary-light">人格 (主)</div>
            <div class="text-xs font-bold text-tj-primary mt-1">兴隆</div>
          </div>
          <div class="p-1.5 rounded-xl bg-white/5 border border-white/5">
            <div class="text-[9px] text-tj-text-faint">地格 (前)</div>
            <div class="text-xs font-bold text-tj-text-primary mt-1">福寿</div>
          </div>
          <div class="p-1.5 rounded-xl bg-white/5 border border-white/5">
            <div class="text-[9px] text-tj-text-faint">外格 (副)</div>
            <div class="text-xs font-bold text-tj-cyan mt-1">逢贵</div>
          </div>
          <div class="p-1.5 rounded-xl bg-tj-purple/10 border border-tj-purple/30">
            <div class="text-[9px] text-tj-purple-light">总格 (后)</div>
            <div class="text-xs font-bold text-tj-purple mt-1">大成</div>
          </div>
        </div>
      </template>

      <!-- D. 八字/运程类：四柱干支与神煞 -->
      <template v-else>
        <div class="grid grid-cols-4 gap-2 my-auto text-center py-2">
          <div class="p-2 rounded-xl bg-white/5 border border-white/5">
            <div class="text-[10px] text-tj-text-faint mb-1">年柱 (祖上)</div>
            <div class="text-sm font-bold text-tj-primary font-display">甲子</div>
            <div class="text-[10px] text-tj-text-secondary mt-1">海中金</div>
          </div>
          <div class="p-2 rounded-xl bg-white/5 border border-white/5">
            <div class="text-[10px] text-tj-text-faint mb-1">月柱 (父母)</div>
            <div class="text-sm font-bold text-tj-primary font-display">丙寅</div>
            <div class="text-[10px] text-tj-text-secondary mt-1">炉中火</div>
          </div>
          <div class="p-2 rounded-xl bg-tj-primary/10 border border-tj-primary/40 shadow-gold-glow">
            <div class="text-[10px] text-tj-primary-light mb-1">日柱 (元神)</div>
            <div class="text-sm font-bold text-tj-primary font-display">戊辰</div>
            <div class="text-[10px] text-tj-primary mt-1">大林木</div>
          </div>
          <div class="p-2 rounded-xl bg-white/5 border border-white/5">
            <div class="text-[10px] text-tj-text-faint mb-1">时柱 (子嗣)</div>
            <div class="text-sm font-bold text-tj-primary font-display">丁巳</div>
            <div class="text-[10px] text-tj-text-secondary mt-1">沙中土</div>
          </div>
        </div>
      </template>

      <div class="flex items-center justify-between text-[11px] text-tj-text-faint border-t border-white/5 pt-2">
        <span>天乙贵人 · 禄马交驰</span>
        <span class="text-tj-primary">气韵纯粹 · 生化有情</span>
      </div>
    </div>

    <!-- 3. 命盘总览综述 (Overview 卡片) -->
    <div v-if="overviewText" class="bg-tj-bg-card border border-tj-primary/25 rounded-2xl p-4 mb-4 shadow-sm">
      <h3 class="text-[14px] font-semibold text-tj-primary mb-2 flex items-center gap-2">
        <span>📜</span> 局象全息总括
      </h3>
      <p class="text-[14px] text-tj-text-primary/95 leading-[1.8] text-justify">
        {{ overviewText }}
      </p>
    </div>

    <!-- 4. 分章解读区 (手风琴卡片，每章独立折叠展开) -->
    <div class="space-y-3 mb-4">
      <div
        v-for="(chapter, idx) in displayChapters"
        :key="chapter.id || idx"
        class="bg-tj-bg-card border border-white/10 rounded-2xl overflow-hidden transition-all"
      >
        <!-- 章节标题行 -->
        <button
          @click="toggleChapter(idx)"
          class="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
        >
          <div class="flex items-center gap-2.5">
            <span class="text-base">{{ getChapterIcon(idx) }}</span>
            <span class="text-[15px] font-semibold text-tj-text-primary">{{ chapter.title }}</span>
            <span v-if="chapter.tag" class="ml-1 px-2 py-0.2 rounded-md bg-white/5 border border-white/10 text-[10px] text-tj-cyan">
              {{ chapter.tag }}
            </span>
          </div>
          <span
            class="text-xs text-tj-text-secondary transform transition-transform"
            :class="{ 'rotate-90': openChapter === idx }"
          >
            ›
          </span>
        </button>

        <!-- 展开后正文 (15px/400 行高 1.8) -->
        <div
          v-show="openChapter === idx"
          class="px-4 pb-4 pt-1 border-t border-white/5 space-y-2.5"
        >
          <div
            v-for="(para, pIdx) in getParagraphs(chapter.content)"
            :key="pIdx"
            class="text-[14px] font-normal text-tj-text-primary/90 leading-[1.8] text-justify"
          >
            {{ para }}
          </div>
        </div>
      </div>
    </div>

    <!-- 5. 宗师改运锦囊 (Blessing Advice) -->
    <div v-if="blessingAdvice.length > 0" class="bg-gradient-to-br from-[#1C1828] to-[#121626] border border-tj-purple/30 rounded-2xl p-4 mb-5 space-y-2.5 shadow-sm">
      <h3 class="text-sm font-semibold text-tj-purple-light flex items-center gap-2">
        <span>✨</span> 宗师修心改运锦囊
      </h3>
      <div class="space-y-1.5">
        <div
          v-for="(tip, tIdx) in blessingAdvice"
          :key="tIdx"
          class="text-xs text-tj-text-primary/90 leading-relaxed flex items-start gap-2"
        >
          <span class="text-tj-primary mt-0.5">•</span>
          <span>{{ tip }}</span>
        </div>
      </div>
    </div>

    <!-- 6. 下载说明行 -->
    <div class="text-xs text-tj-text-faint text-center mb-6">
      非会员每月可下载 3 次，会员不限次
    </div>

    <!-- 7. 吸底双按钮 -->
    <div class="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-4 bg-tj-bg/95 backdrop-blur-md border-t border-white/10 z-20 flex gap-3">
      <!-- 主按钮：下载报告 -->
      <button
        @click="handleDownload"
        :disabled="downloading"
        class="flex-1 h-12 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 bg-tj-grad-gold text-[#1A1405] shadow-gold-glow hover:brightness-110 active:scale-98"
      >
        <span>📥</span> 下载高清报告
      </button>

      <!-- 次按钮：分享报告 (描边) -->
      <button
        @click="handleShare"
        class="flex-1 h-12 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 bg-transparent border border-tj-primary text-tj-primary hover:bg-tj-primary/10 active:scale-98"
      >
        <span>↗</span> 分享海报
      </button>
    </div>

    <!-- 8. 下载中 / 完成弹层 -->
    <div v-if="downloading" class="fixed inset-0 z-50 bg-[#0B0E1A]/85 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 select-none animate-fade-in">
      <div v-if="!downloadSuccess" class="flex flex-col items-center">
        <div class="w-16 h-16 rounded-full border-4 border-tj-primary border-t-transparent animate-spin mb-4 shadow-gold-glow"></div>
        <p class="text-sm font-semibold text-tj-text-primary">正在生成专属命盘报告…</p>
        <p class="text-xs text-tj-text-secondary mt-1">使用 Canvas 进行高清像素渲染</p>
      </div>
      <div v-else class="flex flex-col items-center">
        <div class="w-16 h-16 rounded-full bg-tj-success/20 text-tj-success flex items-center justify-center text-3xl mb-4">
          ✓
        </div>
        <p class="text-sm font-semibold text-tj-text-primary">已保存到本地</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "../stores/user";
import { useUIStore } from "../stores/ui";
import { CATEGORIES_CONFIG } from "../stores/divination";
import { exportReportToImage } from "../utils/pdf-export";

const route = useRoute();
const userStore = useUserStore();
const uiStore = useUIStore();

const categoryType = computed(() => (route.params.type as string) || "bazi");
const categoryName = computed(() => CATEGORIES_CONFIG[categoryType.value]?.name || "八字推测");

const currentOrderId = ref((route.query.orderId as string) || "");
const reportNo = ref("TJ" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "0001");
const todayStr = ref(new Date().toISOString().slice(0, 10));

const reportTitle = ref("天机专属测算报告");
const reportScore = ref(89);
const overviewText = ref("");
const blessingAdvice = ref<string[]>([]);
const openChapter = ref<number | null>(0);
const downloading = ref(false);
const downloadSuccess = ref(false);

const chartTitle = computed(() => {
  const t = categoryType.value;
  if (t === "palm_face" || t === "palm_reading" || t === "face_reading") {
    return "三停五岳与掌纹走势全息图谱";
  } else if (t === "phone_plate") {
    return "数字能量八星磁场分布矩阵";
  } else if (t === "name_test" || t === "personal_naming" || t === "company_naming") {
    return "三才五格数理气象图谱";
  } else if (t === "love_match") {
    return "双人八字纳音与日柱天合地合谱";
  } else if (t === "qimen_decision") {
    return "奇门遁甲九星八门九宫胜算阵盘";
  } else if (t === "auspicious_date") {
    return "钦天监二十八宿与黄道吉星谱";
  }
  return "四柱八字与十神全息推演图谱";
});

const defaultChapters = [
  {
    id: "ch_1",
    title: "第一章：命局总论与五行格局",
    tag: "天命底色",
    content: "日主元神秉天地中和之气，气象纯粹。主为人仁厚宽和，有容乃大，处事进退有度，深谙韬光养晦之智。五行生化各司其职，虽有微冲，亦得吉神暗合通关。",
  },
  {
    id: "ch_2",
    title: "第二章：事业官禄与行商赛道",
    tag: "仕途财运",
    content: "官星化印，多得长者贵人引荐提拔。逢关键转折年份必有权柄升级或开拓领衔大宗项目之契机。利于深耕科技、文化创意与专业技术赛道，厚积薄发。",
  },
  {
    id: "ch_3",
    title: "第三章：感情姻缘与家庭福泽",
    tag: "良缘和合",
    content: "妻妾/夫星坐禄旺之地，另一半性情温润娴静，持家有方且具极高审美与共创财智。彼此相待多一份尊重与知己之契，凡事同舟共济自能福祚绵长。",
  },
  {
    id: "ch_4",
    title: "第四章：未来流年转折与开运锦囊",
    tag: "大运拐点",
    content: "未来三年为伏脉起运期，凡事宜稳步积累打磨内核；逢岁运天乙贵人，将迎十年一遇之重大跃升机遇。以厚德载物，积善之家必有余庆。",
  },
];

const rawChapters = ref<any[]>([]);
const displayChapters = computed(() => {
  return rawChapters.value.length > 0 ? rawChapters.value : defaultChapters;
});

const chapterIcons = ["📜", "🏢", "💞", "🌿", "🔮", "🧭"];
function getChapterIcon(idx: number) {
  return chapterIcons[idx % chapterIcons.length];
}

function getParagraphs(content: string) {
  if (!content) return [];
  return content
    .split(/\n\s*\n|\n/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

function toggleChapter(idx: number) {
  openChapter.value = openChapter.value === idx ? null : idx;
}

onMounted(async () => {
  // 1. 获取 orderId
  const lastResult = sessionStorage.getItem("tj_last_result");
  let lastData: any = null;
  if (lastResult) {
    try {
      lastData = JSON.parse(lastResult);
      if (lastData.orderId) currentOrderId.value = lastData.orderId;
    } catch {}
  }

  const queryOrderId = (route.query.orderId as string) || currentOrderId.value;
  if (queryOrderId) {
    currentOrderId.value = queryOrderId;
    reportNo.value = queryOrderId;

    try {
      const res = await fetch(`/api/divine/report/${encodeURIComponent(queryOrderId)}`);
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        if (d.preview) {
          reportTitle.value = d.preview.title || d.preview.rating || reportTitle.value;
          if (typeof d.preview.score === "number") reportScore.value = d.preview.score;
        }

        const full = d.fullReport || d.full_report;
        if (full) {
          if (full.overview) overviewText.value = full.overview;
          if (Array.isArray(full.chapters) && full.chapters.length > 0) {
            rawChapters.value = full.chapters;
          }
          if (Array.isArray(full.blessingAdvice) && full.blessingAdvice.length > 0) {
            blessingAdvice.value = full.blessingAdvice;
          }
        }
      }
    } catch (err) {
      console.warn("加载报告详情失败:", err);
    }
  }

  // 2. 兼容本地缓存数据
  if (lastData?.full_report || lastData?.fullReport) {
    const full = lastData.full_report || lastData.fullReport;
    if (!overviewText.value && full.overview) overviewText.value = full.overview;
    if (rawChapters.value.length === 0 && Array.isArray(full.chapters)) {
      rawChapters.value = full.chapters;
    }
    if (blessingAdvice.value.length === 0 && Array.isArray(full.blessingAdvice)) {
      blessingAdvice.value = full.blessingAdvice;
    }
  }
});

async function handleDownload() {
  downloading.value = true;
  downloadSuccess.value = false;

  try {
    await exportReportToImage({
      title: reportTitle.value,
      categoryName: categoryName.value,
      score: reportScore.value,
      userName: userStore.user?.nickname || "天机缘主",
      date: todayStr.value,
      overview: overviewText.value || "日主元神气运畅通，天乙贵人乘旺。事业官星化印，一生多贵人扶持，后运亨通。",
    });

    downloadSuccess.value = true;
    setTimeout(() => {
      downloading.value = false;
      downloadSuccess.value = false;
    }, 1500);
  } catch (err: any) {
    downloading.value = false;
    uiStore.showToast("生成失败，请重试");
  }
}

function handleShare() {
  handleDownload();
  uiStore.showToast("长图海报已生成，可长按分享给好友！");
}
</script>
