<template>
  <div class="flex-1 pb-16 px-4 pt-3 select-none">
    <!-- 【平台大盘 (公开真实数据)】 -->
    <template v-if="activeTab === 'platform'">
      <!-- 1. 四宫格真实统计指标 (2×2) -->
      <div class="grid grid-cols-2 gap-3 mb-4">
        <div class="bg-tj-bg-card border border-tj-primary/20 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div class="text-[24px] font-bold font-num text-tj-primary mb-0.5 tracking-tight">
            {{ (platformStats.totalDivinations || 0).toLocaleString() }}
          </div>
          <div class="text-[11px] text-tj-text-secondary flex items-center gap-1">
            <span>累计测算单量</span>
            <span class="text-[9px] px-1 py-0.2 rounded bg-tj-primary/10 text-tj-primary border border-tj-primary/20">实时</span>
          </div>
        </div>

        <div class="bg-tj-bg-card border border-tj-primary/20 rounded-2xl p-4 shadow-sm relative overflow-hidden">
          <div class="text-[24px] font-bold font-num text-tj-primary mb-0.5 tracking-tight">
            {{ (platformStats.totalReports || 0).toLocaleString() }}
          </div>
          <div class="text-[11px] text-tj-text-secondary">AI报告生成</div>
        </div>

        <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-4 shadow-sm">
          <div class="text-[24px] font-bold font-num text-tj-primary mb-0.5 tracking-tight">
            {{ (platformStats.totalUsers || 0).toLocaleString() }}
          </div>
          <div class="text-[11px] text-tj-text-secondary">全网缘主账户</div>
        </div>

        <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-4 shadow-sm">
          <div class="text-[24px] font-bold font-num text-tj-cyan mb-0.5 tracking-tight">
            {{ (platformStats.totalVolumeUsdt || 0).toLocaleString() }}
            <span class="text-xs text-tj-text-secondary font-normal font-sans">U</span>
          </div>
          <div class="text-[11px] text-tj-text-secondary">累计交易结算</div>
        </div>
      </div>

      <!-- 2. 真实功能门类分布 (真实数据库降序) -->
      <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-4 mb-4 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-[15px] font-semibold text-tj-text-primary flex items-center gap-1.5">
            <span>📊</span>
            <span>各门类测算分布</span>
          </h3>
          <span class="text-[10px] text-tj-text-faint font-mono">D1 数据库真实聚合</span>
        </div>

        <div v-if="formattedDistribution.length > 0" class="space-y-3">
          <div
            v-for="(item, idx) in formattedDistribution"
            :key="item.category"
            class="space-y-1"
          >
            <div class="flex justify-between items-center text-xs">
              <span class="text-tj-text-primary font-medium flex items-center gap-1.5">
                <span class="text-[10px] font-mono text-tj-text-faint w-3.5">{{ idx + 1 }}.</span>
                <span>{{ item.name }}</span>
              </span>
              <span class="text-tj-text-secondary font-mono">{{ item.count }} 次</span>
            </div>
            <div class="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                class="h-full bg-tj-grad-gold rounded-full transition-all duration-700"
                :style="{ width: `${Math.max(6, (item.count / maxCategoryCount) * 100)}%` }"
              ></div>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-6 text-xs text-tj-text-faint">
          暂无测算统计数据，等待缘主入驻
        </div>
      </div>

      <!-- 3. 真实链上实时动态流 (脱敏钱包与真实门类，轮询更新) -->
      <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-4 mb-4 shadow-sm">
        <div class="flex items-center justify-between mb-3">
          <h3 class="text-[15px] font-semibold text-tj-text-primary flex items-center gap-1.5">
            <span>⚡</span>
            <span>链上核销实时动态</span>
          </h3>
          <span class="flex items-center gap-1.5 text-[10px] text-tj-cyan">
            <span class="w-1.5 h-1.5 rounded-full bg-tj-cyan animate-pulse"></span>
            真实上链流水
          </span>
        </div>

        <div v-if="recentFeeds.length > 0" class="space-y-2.5">
          <div
            v-for="feed in recentFeeds"
            :key="feed.id"
            class="text-[11px] text-tj-text-secondary py-1.5 border-b border-white/5 flex items-center justify-between last:border-b-0"
          >
            <div class="flex items-center gap-1.5 truncate pr-2">
              <span class="font-mono text-tj-text-primary">{{ feed.user }}</span>
              <span class="text-tj-text-faint">解锁了</span>
              <span class="text-tj-primary font-medium">【{{ feed.action }}】</span>
            </div>
            <div class="flex items-center gap-2 flex-shrink-0">
              <span class="text-[10px] text-tj-text-faint font-mono">{{ feed.time }}</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded bg-tj-success/10 text-tj-success border border-tj-success/20 font-mono">已核销</span>
            </div>
          </div>
        </div>
        <div v-else class="text-center py-6 text-xs text-tj-text-faint">
          暂无最新已完成订单
        </div>
      </div>

      <!-- 4. 智能合约链上可信验证卡 -->
      <div class="bg-tj-bg-card border border-tj-primary/20 rounded-2xl p-3.5 text-center text-xs text-tj-text-secondary flex items-center justify-center gap-2 shadow-sm">
        <span class="text-base">🛡️</span>
        <span>智能合约 ServiceCreditManager 链上存证 · 分润透明可查</span>
      </div>
    </template>

    <!-- 【我的统计 (个人真实业务数据)】 -->
    <template v-else>
      <div v-if="!userStore.isLoggedIn" class="bg-tj-bg-card border border-tj-primary/30 rounded-2xl p-6 text-center my-6">
        <div class="text-3xl mb-2">🔐</div>
        <p class="text-sm text-tj-text-primary font-semibold mb-2">连接钱包查看专属命盘统计</p>
        <p class="text-xs text-tj-text-faint mb-4">登录即可同步历次推演档案、佣金分润与提现流水</p>
        <router-link
          to="/login"
          class="inline-block px-6 py-2 rounded-full bg-tj-grad-gold text-[#1A1405] text-xs font-bold"
        >
          连接钱包 / 登录
        </router-link>
      </div>

      <div v-else class="space-y-4">
        <!-- 1. 测算与消费组 -->
        <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-4 shadow-sm">
          <h3 class="text-xs font-semibold text-tj-text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span>🔮</span>
            <span>测算推演与消费</span>
          </h3>
          <div class="grid grid-cols-3 divide-x divide-white/10 text-center">
            <div>
              <div class="text-lg font-bold font-num text-tj-primary">{{ myStats.divineCount }}</div>
              <div class="text-[11px] text-tj-text-faint mt-0.5">累计测算 (次)</div>
            </div>
            <div>
              <div class="text-lg font-bold font-num text-tj-primary">{{ myStats.totalSpent.toFixed(2) }}</div>
              <div class="text-[11px] text-tj-text-faint mt-0.5">消费金额 (USDT)</div>
            </div>
            <div>
              <div class="text-lg font-bold font-num text-tj-cyan">{{ myStats.vipSaved.toFixed(2) }}</div>
              <div class="text-[11px] text-tj-text-faint mt-0.5">会员节省 (USDT)</div>
            </div>
          </div>
        </div>

        <!-- 2. 报告与资产组 -->
        <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-4 shadow-sm">
          <h3 class="text-xs font-semibold text-tj-text-secondary uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span>📜</span>
            <span>报告档案与权益</span>
          </h3>
          <div class="grid grid-cols-2 divide-x divide-white/10 text-center">
            <div>
              <div class="text-lg font-bold font-num text-tj-text-primary">{{ myStats.reportCount }}</div>
              <div class="text-[11px] text-tj-text-faint mt-0.5">已解锁报告 (份)</div>
            </div>
            <div>
              <div class="text-lg font-bold font-num" :class="userStore.isVip ? 'text-tj-primary' : 'text-tj-text-secondary'">
                {{ userStore.isVip ? 'VIP 尊享中' : '普通用户' }}
              </div>
              <div class="text-[11px] text-tj-text-faint mt-0.5">会员身份</div>
            </div>
          </div>
        </div>

        <!-- 3. 合伙人推广佣金组 -->
        <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-4 shadow-sm">
          <h3 class="text-xs font-semibold text-tj-text-secondary uppercase tracking-wider mb-3 flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <span>🤝</span>
              <span>合伙人裂变佣金</span>
            </span>
            <router-link to="/promote" class="text-tj-primary hover:underline text-[11px] font-normal">
              进入推广中心 ›
            </router-link>
          </h3>
          <div class="grid grid-cols-2 gap-3">
            <div class="p-3 rounded-xl bg-white/5">
              <div class="text-lg font-bold font-num text-tj-primary">{{ myStats.directUsers }}</div>
              <div class="text-[11px] text-tj-text-faint">直推下级 (15%)</div>
            </div>
            <div class="p-3 rounded-xl bg-white/5">
              <div class="text-lg font-bold font-num text-tj-primary">{{ myStats.indirectUsers }}</div>
              <div class="text-[11px] text-tj-text-faint">间推裂变 (5%)</div>
            </div>
            <div class="p-3 rounded-xl bg-white/5">
              <div class="text-lg font-bold font-num text-tj-cyan">{{ myStats.earnedTotal.toFixed(2) }} U</div>
              <div class="text-[11px] text-tj-text-faint">累计分润收益</div>
            </div>
            <div class="p-3 rounded-xl bg-white/5">
              <div class="text-lg font-bold font-num text-tj-purple">{{ myStats.withdrawnTotal.toFixed(2) }} U</div>
              <div class="text-[11px] text-tj-text-faint">已提现结算</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useUserStore } from "../stores/user";

const route = useRoute();
const userStore = useUserStore();

// 与顶部 SubNavBar (/stats vs /stats?tab=my) 联动
const activeTab = computed(() => (route.query.tab === "my" ? "my" : "platform"));

const platformStats = ref({
  totalDivinations: 0,
  totalReports: 0,
  totalUsers: 0,
  totalUnlocks: 0,
  totalVolumeUsdt: 0,
  categoryDistribution: [] as { category: string; count: number }[],
});

const recentFeeds = ref<
  { id: string; user: string; action: string; amount: number; time: string }[]
>([]);

const CATEGORY_NAMES: Record<string, string> = {
  palm_face: "手相面相骨格",
  bazi: "生辰八字排盘",
  love_match: "八字合婚配对",
  phone_plate: "车牌号码吉凶",
  name_test: "姓名学五格吉凶",
  auspicious_date: "择日择吉避凶",
  future_fortune: "流年未来大运",
  qimen_decision: "奇门遁甲成败",
  personal_naming: "八字五行起名",
  company_naming: "企业公司取名",
  ziwei: "紫微斗数十二宫",
  qimen: "奇门遁甲天机",
  liuyao: "六爻金钱神课",
  meihua: "梅花易数精批",
  dream: "周公解梦神应",
  tarot: "西洋神秘塔罗",
};

const formattedDistribution = computed(() => {
  const list = platformStats.value.categoryDistribution || [];
  return list.map((item) => ({
    category: item.category,
    name: CATEGORY_NAMES[item.category] || item.category,
    count: item.count,
  }));
});

const maxCategoryCount = computed(() => {
  const list = formattedDistribution.value;
  if (!list.length) return 1;
  return Math.max(...list.map((i) => i.count), 1);
});

const myStats = ref({
  divineCount: 0,
  totalSpent: 0.0,
  vipSaved: 0.0,
  reportCount: 0,
  directUsers: 0,
  indirectUsers: 0,
  earnedTotal: 0.0,
  withdrawnTotal: 0.0,
});

let timer: any = null;

async function loadPlatformStats() {
  try {
    const res = await fetch("/api/stats/platform");
    const json = await res.json();
    if (json.success && json.data) {
      platformStats.value = json.data;
      if (Array.isArray(json.data.recentFeeds)) {
        recentFeeds.value = json.data.recentFeeds;
      }
    }
  } catch (err) {
    console.warn("加载平台大盘统计失败:", err);
  }
}

async function loadUserStats() {
  const userId = userStore.user?.id || userStore.user?.wallet_address;
  if (!userId) return;

  try {
    const res = await fetch(`/api/stats/user?userId=${encodeURIComponent(userId)}`);
    const json = await res.json();
    if (json.success && json.data) {
      const d = json.data;
      myStats.value.divineCount = d.totalDivinations ?? 0;
      myStats.value.totalSpent = d.totalSpent ?? 0.0;
      myStats.value.vipSaved = d.vipSaved ?? 0.0;
      myStats.value.reportCount = d.reportCount ?? 0;
      myStats.value.directUsers = d.directUsers ?? 0;
      myStats.value.indirectUsers = d.indirectUsers ?? 0;
      myStats.value.earnedTotal = d.totalEarned ?? 0.0;
      myStats.value.withdrawnTotal = d.totalWithdrawn ?? 0.0;
    }
  } catch (err) {
    console.warn("加载用户统计失败:", err);
  }
}

onMounted(() => {
  loadPlatformStats();
  loadUserStats();
  // 30 秒轮询更新真实平台动态
  timer = setInterval(() => {
    loadPlatformStats();
  }, 30000);
});

watch(
  () => userStore.isLoggedIn,
  (loggedIn) => {
    if (loggedIn) loadUserStats();
  }
);

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>
