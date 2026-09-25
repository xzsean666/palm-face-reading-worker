<template>
  <div class="flex-1 pb-16 px-4 pt-3 select-none">
    <!-- 1. Hero 横幅 (高 180px) -->
    <div class="h-[180px] w-full rounded-2xl bg-[#0F1424] bg-tj-grad-hero border border-tj-primary/20 p-4 mb-3 relative overflow-hidden flex flex-col justify-between shadow-lg">
      <!-- 金色斜线光轨装饰 -->
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
          <div class="text-base font-bold font-num text-tj-primary">1,284,392</div>
          <div class="text-[10px] text-tj-text-secondary mt-0.5">累计测算</div>
        </div>
        <div>
          <div class="text-base font-bold font-num text-tj-primary">1,103,876</div>
          <div class="text-[10px] text-tj-text-secondary mt-0.5">报告生成</div>
        </div>
        <div>
          <div class="text-base font-bold font-num text-tj-primary">98%</div>
          <div class="text-[10px] text-tj-text-secondary mt-0.5">好评率</div>
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
    <div class="grid grid-cols-3 gap-3 mb-6">
      <!-- 前 10 卡为功能卡 -->
      <div
        v-for="cat in divinationCategories"
        :key="cat.id"
        @click="router.push(cat.route)"
        class="h-[108px] bg-tj-bg-card hover:bg-tj-bg-card-hover border border-white/5 hover:border-tj-primary/40 rounded-xl p-2.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-95 group relative overflow-hidden shadow-sm"
      >
        <span
          v-if="cat.badge"
          class="absolute top-1 right-1 text-[9px] px-1.5 py-0.2 rounded-full font-bold"
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
        <div class="text-[10px] text-tj-text-faint truncate w-full mt-0.5">
          {{ cat.classic }}
        </div>
      </div>

      <!-- 第 11 卡：测算记录（时钟图标） -->
      <div
        @click="router.push('/me/records')"
        class="h-[108px] bg-tj-bg-card hover:bg-tj-bg-card-hover border border-white/5 hover:border-tj-primary/40 rounded-xl p-2.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-95 group shadow-sm"
      >
        <div class="text-2xl mb-1.5 group-hover:scale-110 transition-transform">
          📜
        </div>
        <div class="text-xs font-semibold text-tj-text-primary group-hover:text-tj-primary transition-colors">
          测算记录
        </div>
        <div class="text-[10px] text-tj-text-faint mt-0.5">
          历史神谕
        </div>
      </div>

      <!-- 第 12 卡：VIP 畅算直通卡 -->
      <div
        @click="router.push('/vip')"
        class="h-[108px] bg-gradient-to-br from-tj-purple/15 to-transparent border border-tj-purple/30 hover:border-tj-purple rounded-xl p-2.5 flex flex-col items-center justify-center text-center cursor-pointer transition-all active:scale-95 group shadow-sm"
      >
        <div class="text-2xl mb-1.5 group-hover:scale-110 transition-transform">
          👑
        </div>
        <div class="text-xs font-semibold text-tj-purple-light group-hover:text-white transition-colors">
          会员中心
        </div>
        <div class="text-[10px] text-tj-purple mt-0.5">
          特权畅享
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";

const router = useRouter();
const userStore = useUserStore();

const showNotice = ref(true);
const marqueeText = ref(
  "138****5678 刚刚解锁了【八字四柱排盘】完整报告 • 0x8a...3f 获得了 0.44 USDT 直推返佣 • 缘主 TJ...89 开启了双人合婚推演"
);

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
    classic: "麻衣神相",
    icon: "🖐️",
    route: "/feature/palm-face",
    badge: "热门",
    badgeClass: "bg-tj-primary text-[#1A1405]",
  },
  {
    id: "love_match",
    name: "我们合不合",
    classic: "三命通会",
    icon: "💞",
    route: "/feature/love_match/input",
    badge: "合婚",
    badgeClass: "bg-tj-purple/20 text-tj-purple border border-tj-purple/40",
  },
  {
    id: "phone_plate",
    name: "测手机车牌",
    classic: "易经数理",
    icon: "📱",
    route: "/feature/phone_plate/input",
  },
  {
    id: "name_test",
    name: "测姓名店名",
    classic: "三才五格",
    icon: "✍️",
    route: "/feature/name_test/input",
  },
  {
    id: "auspicious_date",
    name: "择日吉日",
    classic: "协纪辨方",
    icon: "📅",
    route: "/feature/auspicious_date/input",
  },
  {
    id: "future_fortune",
    name: "未来运程",
    classic: "滴天髓",
    icon: "🔮",
    route: "/feature/future_fortune/input",
  },
  {
    id: "bazi",
    name: "八字推测",
    classic: "渊海子平",
    icon: "☯️",
    route: "/feature/bazi/input",
    badge: "经典",
    badgeClass: "bg-tj-cyan/20 text-tj-cyan border border-tj-cyan/40",
  },
  {
    id: "qimen_decision",
    name: "成败预测",
    classic: "奇门遁甲",
    icon: "⚔️",
    route: "/feature/qimen_decision/input",
  },
  {
    id: "personal_naming",
    name: "个人起名",
    classic: "周易名学",
    icon: "👶",
    route: "/feature/personal_naming/input",
  },
  {
    id: "company_naming",
    name: "公司取名",
    classic: "玄空商道",
    icon: "🏢",
    route: "/feature/company_naming/input",
  },
];
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
</style>
