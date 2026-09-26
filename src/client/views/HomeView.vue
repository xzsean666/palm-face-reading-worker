<template>
  <div class="flex-1 pb-16 px-4 pt-3 select-none">
    <!-- 1. Hero 横幅 (高 180px) -->
    <div class="h-[180px] w-full rounded-2xl bg-[#0F1424] bg-tj-grad-hero border border-tj-primary/20 p-4 mb-3 relative overflow-hidden flex flex-col justify-between shadow-lg">
      <!-- 金色斜线光轨与星点装饰 -->
      <div class="absolute -right-8 -top-8 w-40 h-40 rounded-full bg-tj-primary/10 blur-2xl pointer-events-none"></div>
      <div class="absolute left-1/3 top-0 w-24 h-48 bg-gradient-to-b from-tj-primary/10 to-transparent transform -rotate-45 pointer-events-none"></div>

      <!-- 主副标题居中 -->
      <div class="text-center pt-2 relative z-10">
        <h1 class="text-[22px] font-semibold font-display text-transparent bg-clip-text bg-tj-grad-gold tracking-wide mb-1">
          洞察天机 · 洞见真我
        </h1>
        <p class="text-xs text-tj-text-secondary">
          AI 智库大数据推演 · 专属命盘报告
        </p>
      </div>

      <!-- 底部三项数据横排 -->
      <div class="grid grid-cols-3 divide-x divide-white/10 pt-3 border-t border-white/10 relative z-10 text-center">
        <div>
          <div class="text-base font-bold font-num text-tj-primary">{{ (homeStats.totalDivinations || 0).toLocaleString() }}</div>
          <div class="text-[10px] text-tj-text-secondary mt-0.5">累计测算</div>
        </div>
        <div>
          <div class="text-base font-bold font-num text-tj-primary">{{ (homeStats.totalReports || 0).toLocaleString() }}</div>
          <div class="text-[10px] text-tj-text-secondary mt-0.5">报告生成</div>
        </div>
        <div>
          <div class="text-base font-bold font-num text-tj-primary">99.8%</div>
          <div class="text-[10px] text-tj-text-secondary mt-0.5">契合好评率</div>
        </div>
      </div>
    </div>

    <!-- 2. 公告条 (高 32px，金色 12% 底，带右侧 ×) -->
    <div
      v-if="showNotice"
      class="h-8 rounded-lg bg-tj-primary/12 border border-tj-primary/25 px-3 flex items-center justify-between gap-2 overflow-hidden mb-3"
    >
      <div class="flex items-center gap-2 flex-1 overflow-hidden">
        <span class="text-xs flex-shrink-0">📣</span>
        <div class="flex-1 overflow-hidden whitespace-nowrap text-xs text-tj-primary-light">
          <div class="inline-block animate-marquee">
            {{ marqueeText }}
          </div>
        </div>
      </div>
      <button
        @click="showNotice = false"
        class="w-5 h-5 flex items-center justify-center text-xs text-tj-primary/70 hover:text-tj-primary flex-shrink-0"
        aria-label="关闭公告"
      >
        ✕
      </button>
    </div>

    <!-- 用户额度快捷栏 -->
    <div class="flex items-center justify-between bg-tj-bg-card border border-white/5 rounded-xl px-3.5 py-2 mb-3 text-xs">
      <div class="flex items-center gap-2">
        <span class="text-tj-primary">✨</span>
        <span class="text-tj-text-secondary">当前可用免费额度: </span>
        <span class="text-tj-cyan font-bold font-num">{{ userStore.freeQuota }} 次</span>
      </div>
      <router-link to="/vip" class="text-[11px] text-tj-primary hover:underline">
        {{ userStore.isVip ? 'VIP 已尊享' : '开通 VIP 免付费 ›' }}
      </router-link>
    </div>

    <!-- 3. 功能宫格 (3 列 × 4 行，卡高 108px，间隙 12px) -->
    <div class="grid grid-cols-3 gap-3 mb-3">
      <!-- 前 10 卡为功能卡 -->
      <div
        v-for="cat in divinationCategories"
        :key="cat.id"
        @click="handleCategoryClick(cat)"
        class="h-[108px] bg-tj-bg-card hover:bg-tj-bg-card-hover border border-white/5 hover:border-tj-primary/40 rounded-xl p-2.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-95 group relative overflow-hidden shadow-sm"
      >
        <span
          v-if="cat.badge"
          class="absolute top-1.5 right-1.5 text-[9px] px-1.5 py-0.5 rounded-full font-bold"
          :class="cat.badgeClass"
        >
          {{ cat.badge }}
        </span>

        <div class="text-2xl mb-1.5 group-hover:scale-110 transition-transform">
          {{ cat.icon }}
        </div>
        <div class="text-xs font-semibold text-tj-text-primary group-hover:text-tj-primary transition-colors truncate w-full">
          {{ cat.name }}
        </div>
        <div class="text-[10px] text-tj-text-secondary truncate w-full mt-0.5">
          {{ cat.classic }}
        </div>
      </div>

      <!-- 第 11 卡：测算记录（时钟图标，高 108px） -->
      <div
        @click="handleRecordClick"
        class="h-[108px] bg-tj-bg-card hover:bg-tj-bg-card-hover border border-white/5 hover:border-tj-primary/40 rounded-xl p-2.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-95 group shadow-sm"
      >
        <div class="text-2xl mb-1.5 group-hover:scale-110 transition-transform">
          🕒
        </div>
        <div class="text-xs font-semibold text-tj-text-primary group-hover:text-tj-primary transition-colors">
          测算记录
        </div>
        <div class="text-[10px] text-tj-text-secondary mt-0.5">
          历史神谕
        </div>
      </div>

      <!-- 第 12 格：留空 -->
      <div class="h-[108px] rounded-xl border border-transparent pointer-events-none"></div>
    </div>

    <!-- 4. 流程说明条 (高 56px 卡片) -->
    <div class="h-14 bg-tj-bg-card border border-white/5 rounded-2xl px-4 flex items-center justify-between mb-3 text-xs text-tj-text-secondary">
      <div class="flex items-center gap-1.5">
        <span class="text-tj-primary">📝</span>
        <span>① 填信息</span>
      </div>
      <span class="text-tj-text-faint">›</span>
      <div class="flex items-center gap-1.5">
        <span class="text-tj-primary">🔮</span>
        <span>② AI 推演</span>
      </div>
      <span class="text-tj-text-faint">›</span>
      <div class="flex items-center gap-1.5">
        <span class="text-tj-primary">📜</span>
        <span>③ 得报告</span>
      </div>
    </div>

    <!-- 5. 会员横幅 (高 64px 紫金渐变卡片) -->
    <div
      @click="router.push('/vip')"
      class="h-16 rounded-2xl bg-gradient-to-r from-tj-purple/25 via-[#2A1E4A] to-tj-purple/15 border border-tj-purple/40 px-4 flex items-center justify-between mb-3 cursor-pointer active:scale-98 transition-transform"
    >
      <div class="flex items-center gap-3">
        <span class="text-2xl">👑</span>
        <div>
          <div class="text-sm font-semibold text-white">开通会员 享测算 8 折</div>
          <div class="text-[11px] text-tj-text-secondary mt-0.5">尊享无限次推演特权</div>
        </div>
      </div>
      <span class="text-white/60 text-lg">›</span>
    </div>

    <!-- 6. 推广横幅 (高 64px 金色 8% 底卡片) -->
    <div
      @click="router.push('/promote')"
      class="h-16 rounded-2xl bg-tj-primary/8 border border-tj-primary/20 px-4 flex items-center justify-between mb-4 cursor-pointer active:scale-98 transition-transform"
    >
      <div class="flex items-center gap-3">
        <span class="text-2xl">🎁</span>
        <div>
          <div class="text-sm font-semibold text-tj-primary">邀请好友得奖励</div>
          <div class="text-[11px] text-tj-text-secondary mt-0.5">享高达 20% 返佣提成</div>
        </div>
      </div>
      <span class="text-tj-primary/70 text-lg">›</span>
    </div>

    <!-- 7. 帮助入口 -->
    <div class="text-center pb-6">
      <router-link to="/about" class="text-xs text-tj-text-faint hover:text-tj-primary transition-colors">
        协议与帮助
      </router-link>
    </div>

    <!-- 半屏登录引导弹窗 (未登录点击功能卡时触发) -->
    <div
      v-if="showLoginModal"
      class="fixed inset-0 z-50 flex items-end justify-center select-none"
    >
      <div
        class="fixed inset-0 bg-[#0B0E1A]/75 backdrop-blur-sm transition-opacity"
        @click="showLoginModal = false"
      ></div>
      <div class="relative w-full max-w-[430px] bg-[#141828] border-t border-tj-primary/20 rounded-t-[20px] p-5 shadow-2xl z-10 animate-slide-up">
        <div class="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 class="text-[15px] font-semibold text-tj-text-primary">登录后开始推演</h3>
          <button
            @click="showLoginModal = false"
            class="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-tj-text-secondary hover:text-white"
          >
            ✕
          </button>
        </div>
        <p class="text-xs text-tj-text-secondary my-4 leading-relaxed">
          登录即可保存推演命盘，尊享专属报告档案库与免费测算额度。
        </p>
        <button
          @click="goToLogin"
          class="w-full h-12 rounded-full font-bold text-sm bg-tj-grad-gold text-[#1A1405] shadow-gold-glow flex items-center justify-center active:scale-98 transition-transform"
        >
          去登录
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";

const router = useRouter();
const userStore = useUserStore();

const showNotice = ref(true);
const showLoginModal = ref(false);
const pendingRoute = ref<string | null>(null);

const homeStats = ref({
  totalDivinations: 0,
  totalReports: 0,
});

const marqueeText = ref(
  "缘主 0x7099...79C8 刚刚解锁了【八字排盘】报告 • 0x3C44...93BC 获得了 0.90 USDT 直推返佣 • 缘主 TJ...89 开启了双人合婚推演"
);

onMounted(async () => {
  try {
    const res = await fetch("/api/stats/platform");
    const json = await res.json();
    if (json.success && json.data) {
      homeStats.value.totalDivinations = json.data.totalDivinations || 0;
      homeStats.value.totalReports = json.data.totalReports || 0;
      if (json.data.recentFeeds && json.data.recentFeeds.length > 0) {
        const topFeed = json.data.recentFeeds[0];
        marqueeText.value = `缘主 ${topFeed.user} 刚刚解锁了【${topFeed.action}】报告 • 智能合约分润已链上结算到账`;
      }
    }
  } catch {}
});

interface DivinationCategory {
  id: string;
  name: string;
  classic: string;
  icon: string;
  route: string;
  badge?: string;
  badgeClass?: string;
}

const divinationCategories: DivinationCategory[] = [
  {
    id: "palm-face",
    name: "AI看相",
    classic: "手相面相，AI 识命理",
    icon: "🤲",
    route: "/feature/palm-face",
    badge: "热门",
    badgeClass: "text-tj-danger border border-tj-danger/40 bg-tj-danger/10",
  },
  {
    id: "love_match",
    name: "我们合不合",
    classic: "双人合盘，灵魂配对",
    icon: "💕",
    route: "/feature/love_match/input",
  },
  {
    id: "phone_plate",
    name: "测手机车牌",
    classic: "数字能量 × 八字契合度",
    icon: "🚗",
    route: "/feature/phone_plate/input",
    badge: "NEW",
    badgeClass: "text-tj-cyan border border-tj-cyan/50 bg-tj-cyan/10",
  },
  {
    id: "name_test",
    name: "测姓名店名",
    classic: "姓名吉凶，五行解析",
    icon: "🏷️",
    route: "/feature/name_test/input",
  },
  {
    id: "auspicious_date",
    name: "择日吉日",
    classic: "择吉避凶，顺天应时",
    icon: "🧭",
    route: "/feature/auspicious_date/input",
  },
  {
    id: "future_fortune",
    name: "未来运程",
    classic: "流年预测，关键节点",
    icon: "🌠",
    route: "/feature/future_fortune/input",
    badge: "热门",
    badgeClass: "text-tj-danger border border-tj-danger/40 bg-tj-danger/10",
  },
  {
    id: "bazi",
    name: "八字推测",
    classic: "命盘解析，运势推演",
    icon: "☯️",
    route: "/feature/bazi/input",
    badge: "热门",
    badgeClass: "text-tj-danger border border-tj-danger/40 bg-tj-danger/10",
  },
  {
    id: "qimen_decision",
    name: "成败预测",
    classic: "吉凶方位，成功率测算",
    icon: "🚩",
    route: "/feature/qimen_decision/input",
  },
  {
    id: "personal_naming",
    name: "个人起名",
    classic: "生辰八字，五行喜忌取名",
    icon: "🖌️",
    route: "/feature/personal_naming/input",
  },
  {
    id: "company_naming",
    name: "公司取名",
    classic: "法人命理，业务契合",
    icon: "🏢",
    route: "/feature/company_naming/input",
  },
];

function handleCategoryClick(cat: DivinationCategory) {
  if (!userStore.isLoggedIn) {
    pendingRoute.value = cat.route;
    showLoginModal.value = true;
    return;
  }
  router.push(cat.route);
}

function handleRecordClick() {
  if (!userStore.isLoggedIn) {
    pendingRoute.value = "/me/records";
    showLoginModal.value = true;
    return;
  }
  router.push("/me/records");
}

function goToLogin() {
  showLoginModal.value = false;
  router.push("/login");
}
</script>

<style scoped>
@keyframes marquee {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}
.animate-marquee {
  display: inline-block;
  white-space: nowrap;
  animation: marquee 20s linear infinite;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
.animate-slide-up {
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
