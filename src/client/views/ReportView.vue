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

    <!-- 2. 命盘可视化卡 (高 240px，按门类渲染) -->
    <div class="h-[240px] bg-tj-bg-card border border-tj-primary/20 rounded-2xl p-4 mb-4 relative overflow-hidden flex flex-col justify-between shadow-sm">
      <div class="flex items-center justify-between border-b border-white/5 pb-2">
        <span class="text-xs font-semibold text-tj-primary-light flex items-center gap-1.5">
          <span>🌌</span> 命盘全息推演图谱
        </span>
        <span class="text-[10px] text-tj-cyan font-mono">五行平衡指数: 89%</span>
      </div>

      <!-- 八字四柱或相理全息排盘可视化示意 -->
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

      <div class="flex items-center justify-between text-[11px] text-tj-text-faint border-t border-white/5 pt-2">
        <span>天乙贵人 · 文昌星入命</span>
        <span class="text-tj-primary">身旺印绶格局</span>
      </div>
    </div>

    <!-- 3. 分章解读区 (手风琴卡片，每章独立折叠展开) -->
    <div class="space-y-3 mb-6">
      <div
        v-for="(chapter, idx) in chapters"
        :key="idx"
        class="bg-tj-bg-card border border-white/10 rounded-2xl overflow-hidden transition-all"
      >
        <!-- 章节标题行 -->
        <button
          @click="toggleChapter(idx)"
          class="w-full px-4 py-3.5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
        >
          <div class="flex items-center gap-2.5">
            <span class="text-base">{{ chapter.icon }}</span>
            <span class="text-[15px] font-semibold text-tj-text-primary">{{ chapter.title }}</span>
          </div>
          <span
            class="text-xs text-tj-text-secondary transform transition-transform"
            :class="{ 'rotate-90': openChapter === idx }"
          >
            ›
          </span>
        </button>

        <!-- 展开后正文 (15px/400 行高 1.8 + 章内小标题金色 14px/600) -->
        <div
          v-show="openChapter === idx"
          class="px-4 pb-4 pt-1 border-t border-white/5 space-y-3"
        >
          <div v-for="(sub, sIdx) in chapter.sections" :key="sIdx" class="space-y-1">
            <h4 class="text-sm font-semibold text-tj-primary-light">
              {{ sub.subtitle }}
            </h4>
            <p class="text-[15px] font-normal text-tj-text-primary/90 leading-[1.8] text-justify">
              {{ sub.content }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. 下载说明行 -->
    <div class="text-xs text-tj-text-faint text-center mb-6">
      非会员每月可下载 3 次，会员不限次
    </div>

    <!-- 5. 吸底双按钮 -->
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

    <!-- 6. 下载中 / 完成弹层 -->
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
import { ref, computed } from "vue";
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

const reportNo = ref("TJ" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "0001");
const todayStr = ref(new Date().toISOString().slice(0, 10));

const openChapter = ref<number | null>(0);
const downloading = ref(false);
const downloadSuccess = ref(false);

const chapters = [
  {
    title: "第一章：命局总论与五行格局",
    icon: "📜",
    sections: [
      {
        subtitle: "◆ 元神强弱与气象定格",
        content: "日主戊土生于寅月，木旺司权，然坐下辰土通根，干透丙丁二火生扶，气象纯粹。主为人仁厚宽和，有容乃大，处事进退有度，深谙韬光养晦之智。",
      },
      {
        subtitle: "◆ 喜用神与全局枢纽",
        content: "命盘以火为印星、土为比劫，喜火土相助以御春木之克。金为食伤吐秀，水为财星滋润，行运逢土金之地最为发越。",
      },
    ],
  },
  {
    title: "第二章：事业官禄与升迁机运",
    icon: "🏢",
    sections: [
      {
        subtitle: "◆ 官星佩印，权柄在握",
        content: "寅木七杀有丙火转化生身，化杀为权，多得关键长者引荐提拔。逢蛇年、马年必有权柄升级或领衔大宗项目之契机。",
      },
      {
        subtitle: "◆ 贵人方位与合宜行业",
        content: "正南与正东为命格生旺之方，利于战略管理、新质生产力、文化创意与科技商贸等赛道，求谋事半功倍。",
      },
    ],
  },
  {
    title: "第三章：感情姻缘与家庭福泽",
    icon: "💞",
    sections: [
      {
        subtitle: "◆ 夫妻宫吉曜，相得益彰",
        content: "妻宫坐辰，水库滋养，另一半性情温厚娴静，持家有方，且具极高审美与共创财智。彼此相待多一份尊重与包容，则福祚绵长。",
      },
    ],
  },
  {
    title: "第四章：健康平安与身心调养",
    icon: "🌿",
    sections: [
      {
        subtitle: "◆ 五行脏腑与季节宜忌",
        content: "春季木旺克土，脾胃与消化系统需多加节制调护。宜清淡温补，早卧早起，常适度静坐调息以养元气。",
      },
    ],
  },
  {
    title: "第五章：流年运势与转折契机",
    icon: "🔮",
    sections: [
      {
        subtitle: "◆ 近三年大运波澜预测",
        content: "今明两年为伏脉起运期，凡事宜稳步积累打磨内核；后年岁运并临天乙贵人，将迎十年一遇之重大跃升机遇，宜果断出击。",
      },
    ],
  },
  {
    title: "第六章：吉凶方位与开运指南",
    icon: "🧭",
    sections: [
      {
        subtitle: "◆ 天机避凶锦囊",
        content: "【幸运色彩】：暖金、米白、暗红为护身气色；【吉祥数理】：5、8、9 可作为签约与居住楼层吉祥参考；【行事真谛】：以厚德载物，积善之家必有余庆。",
      },
    ],
  },
];

function toggleChapter(idx: number) {
  openChapter.value = openChapter.value === idx ? null : idx;
}

async function handleDownload() {
  downloading.value = true;
  downloadSuccess.value = false;

  try {
    await exportReportToImage({
      title: "乾坤定格 · 紫气东来之相",
      categoryName: categoryName.value,
      score: 88,
      userName: userStore.user?.nickname || "天机缘主",
      date: todayStr.value,
      overview: "日主戊土生于寅月，木旺司权，坐下通根，天乙贵人乘旺。事业官星化印，一生多贵人扶持，中晚运愈发昌盛。",
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
