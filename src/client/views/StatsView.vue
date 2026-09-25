<template>
  <div class="flex-1 pb-16 px-4 pt-2 select-none">
    <!-- 副菜单 Tab 切换：平台统计 vs 我的统计 -->
    <div class="grid grid-cols-2 p-1 bg-white/5 border border-white/5 rounded-xl mb-4 text-xs font-semibold">
      <button
        @click="activeTab = 'platform'"
        class="py-2 rounded-lg transition-all"
        :class="activeTab === 'platform' ? 'bg-tj-primary/15 text-tj-primary shadow-sm font-bold' : 'text-tj-text-secondary hover:text-white'"
      >
        平台统计 (公开大盘)
      </button>
      <button
        @click="activeTab = 'my'"
        class="py-2 rounded-lg transition-all"
        :class="activeTab === 'my' ? 'bg-tj-primary/15 text-tj-primary shadow-sm font-bold' : 'text-tj-text-secondary hover:text-white'"
      >
        我的统计
      </button>
    </div>

    <!-- 【平台统计】 -->
    <template v-if="activeTab === 'platform'">
      <!-- 1. 四宫格大数字 (2×2) -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="bg-tj-bg-card border border-tj-primary/20 rounded-2xl p-4 shadow-sm">
          <div class="text-[22px] font-bold font-num text-tj-primary mb-0.5">
            {{ platformStats.totalDivinations.toLocaleString() }}
          </div>
          <div class="text-[11px] text-tj-text-secondary">累计测算</div>
        </div>

        <div class="bg-tj-bg-card border border-tj-primary/20 rounded-2xl p-4 shadow-sm">
          <div class="text-[22px] font-bold font-num text-tj-primary mb-0.5">
            {{ platformStats.totalReports.toLocaleString() }}
          </div>
          <div class="text-[11px] text-tj-text-secondary">报告生成</div>
        </div>

        <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-4 shadow-sm">
          <div class="text-[22px] font-bold font-num text-tj-primary mb-0.5">
            {{ platformStats.totalUsers.toLocaleString() }}
          </div>
          <div class="text-[11px] text-tj-text-secondary">注册账户</div>
        </div>

        <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-4 shadow-sm">
          <div class="text-[22px] font-bold font-num text-tj-primary mb-0.5">
            {{ platformStats.totalUnlocks.toLocaleString() }}
          </div>
          <div class="text-[11px] text-tj-text-secondary">累计解锁</div>
        </div>
      </div>

      <!-- 2. 功能分布卡 (各功能测算次数，10 行横条图，降序) -->
      <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-4 mb-4">
        <h3 class="text-[15px] font-semibold text-tj-text-primary mb-3">各功能测算次数</h3>
        <div class="space-y-2.5">
          <div
            v-for="(item, idx) in featureDistribution"
            :key="item.name"
            class="space-y-1"
          >
            <div class="flex justify-between items-center text-xs">
              <span class="text-tj-text-primary font-medium">{{ item.name }}</span>
              <span class="text-tj-text-faint font-mono">{{ item.count.toLocaleString() }} 次</span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                class="h-full bg-tj-grad-gold rounded-full transition-all duration-500"
                :style="{ width: `${(item.count / featureDistribution[0].count) * 100}%` }"
              ></div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3. 实时动态流 (30 秒轮询) -->
      <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-4 mb-4">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-[15px] font-semibold text-tj-text-primary">实时动态</h3>
          <span class="flex items-center gap-1 text-[10px] text-tj-cyan">
            <span class="w-1.5 h-1.5 rounded-full bg-tj-cyan animate-ping"></span>
            30s 实时刷新
          </span>
        </div>

        <div class="space-y-2">
          <div
            v-for="feed in dynamicFeeds"
            :key="feed.id"
            class="text-[11px] text-tj-text-secondary py-1.5 border-b border-white/5 flex items-center justify-between"
          >
            <span>{{ feed.time }}，{{ feed.user }} 解锁了【{{ feed.action }}】报告</span>
            <span class="text-[10px] text-tj-success">已到账</span>
          </div>
        </div>
      </div>

      <!-- 4. 资金信任卡 -->
      <div class="bg-tj-bg-card border border-tj-cyan/20 rounded-2xl p-3.5 text-center text-xs text-tj-text-secondary flex items-center justify-center gap-2">
        <span>🛡️</span>
        <span>累计支付 {{ platformStats.totalUnlocks.toLocaleString() }} 笔 · 每笔分润链上可查</span>
      </div>
    </template>

    <!-- 【我的统计】 -->
    <template v-else>
      <!-- 未登录提示卡 -->
      <div v-if="!userStore.isLoggedIn" class="bg-tj-bg-card border border-tj-primary/30 rounded-2xl p-6 text-center my-6">
        <p class="text-sm text-tj-text-primary font-semibold mb-4">登录后查看您的专属统计</p>
        <router-link
          to="/login"
          class="inline-block px-6 py-2 rounded-full bg-tj-grad-gold text-[#1A1405] text-xs font-bold"
        >
          去登录
        </router-link>
      </div>

      <div v-else class="space-y-4">
        <!-- 1. 测算消费组 (三列) -->
        <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-4">
          <h3 class="text-xs font-semibold text-tj-text-secondary uppercase tracking-wider mb-3">测算与消费</h3>
          <div class="grid grid-cols-3 divide-x divide-white/10 text-center">
            <div>
              <div class="text-lg font-bold font-num text-tj-primary">{{ myStats.divineCount }}</div>
              <div class="text-[11px] text-tj-text-faint mt-0.5">我的测算 (次)</div>
            </div>
            <div>
              <div class="text-lg font-bold font-num text-tj-primary">{{ myStats.totalSpent.toFixed(2) }}</div>
              <div class="text-[11px] text-tj-text-faint mt-0.5">消费总额 (U)</div>
            </div>
            <div>
              <div class="text-lg font-bold font-num text-tj-cyan">{{ myStats.vipSaved.toFixed(2) }}</div>
              <div class="text-[11px] text-tj-text-faint mt-0.5">会员节省 (U)</div>
            </div>
          </div>
        </div>

        <!-- 2. 报告组 (三列) -->
        <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-4">
          <h3 class="text-xs font-semibold text-tj-text-secondary uppercase tracking-wider mb-3">报告与资产</h3>
          <div class="grid grid-cols-3 divide-x divide-white/10 text-center">
            <div>
              <div class="text-lg font-bold font-num text-tj-text-primary">{{ myStats.reportCount }}</div>
              <div class="text-[11px] text-tj-text-faint mt-0.5">我的报告 (份)</div>
            </div>
            <div>
              <div class="text-lg font-bold font-num text-tj-text-primary">{{ myStats.downloadCount }}</div>
              <div class="text-[11px] text-tj-text-faint mt-0.5">下载 (次)</div>
            </div>
            <div>
              <div class="text-lg font-bold font-num text-tj-text-primary">{{ myStats.shareCount }}</div>
              <div class="text-[11px] text-tj-text-faint mt-0.5">分享 (次)</div>
            </div>
          </div>
        </div>

        <!-- 3. 推广组 (多列四宫格样式) -->
        <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-4">
          <h3 class="text-xs font-semibold text-tj-text-secondary uppercase tracking-wider mb-3">合伙人推广</h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 rounded-xl bg-white/5">
              <div class="text-lg font-bold font-num text-tj-primary">{{ myStats.directUsers }}</div>
              <div class="text-[11px] text-tj-text-faint">直推人数 (人)</div>
            </div>
            <div class="p-3 rounded-xl bg-white/5">
              <div class="text-lg font-bold font-num text-tj-primary">{{ myStats.indirectUsers }}</div>
              <div class="text-[11px] text-tj-text-faint">间推人数 (人)</div>
            </div>
            <div class="p-3 rounded-xl bg-white/5">
              <div class="text-lg font-bold font-num text-tj-cyan">{{ myStats.earnedTotal.toFixed(2) }} U</div>
              <div class="text-[11px] text-tj-text-faint">累计收益</div>
            </div>
            <div class="p-3 rounded-xl bg-white/5">
              <div class="text-lg font-bold font-num text-tj-purple">{{ myStats.withdrawnTotal.toFixed(2) }} U</div>
              <div class="text-[11px] text-tj-text-faint">已提现</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { useUserStore } from "../stores/user";

const userStore = useUserStore();
const activeTab = ref<"platform" | "my">("platform");

const platformStats = ref({
  totalDivinations: 1284392,
  totalReports: 1103876,
  totalUsers: 568421,
  totalUnlocks: 892345,
});

const featureDistribution = [
  { name: "八字推测", count: 342190 },
  { name: "AI看相", count: 289410 },
  { name: "我们合不合", count: 178200 },
  { name: "测手机车牌", count: 124500 },
  { name: "未来运程", count: 98400 },
  { name: "择日吉日", count: 76200 },
  { name: "测姓名店名", count: 62100 },
  { name: "成败预测 (奇门)", count: 54900 },
  { name: "个人起名", count: 38200 },
  { name: "公司取名", count: 20245 },
];

const dynamicFeeds = ref([
  { id: 1, time: "1 分钟前", user: "139****5678", action: "八字推测" },
  { id: 2, time: "2 分钟前", user: "158****2134", action: "AI看相" },
  { id: 3, time: "3 分钟前", user: "186****9988", action: "我们合不合" },
  { id: 4, time: "5 分钟前", user: "133****4512", action: "测手机车牌" },
]);

const myStats = ref({
  divineCount: 23,
  totalSpent: 138.0,
  vipSaved: 27.6,
  reportCount: 23,
  downloadCount: 18,
  shareCount: 6,
  directUsers: 18,
  indirectUsers: 64,
  teamOrders: 97,
  earnedTotal: 256.0,
  withdrawnTotal: 80.0,
});

let timer: any = null;

onMounted(() => {
  // 30 秒轮询刷新动态流
  timer = setInterval(() => {
    const randomUser = `1${Math.floor(Math.random() * 7 + 3)}${Math.floor(Math.random() * 9)}****${Math.floor(Math.random() * 9000 + 1000)}`;
    const randomAction = featureDistribution[Math.floor(Math.random() * featureDistribution.length)].name;
    dynamicFeeds.value.unshift({
      id: Date.now(),
      time: "刚刚",
      user: randomUser,
      action: randomAction,
    });
    if (dynamicFeeds.value.length > 5) dynamicFeeds.value.pop();
  }, 30000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
