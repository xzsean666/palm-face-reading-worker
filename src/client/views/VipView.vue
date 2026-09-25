<template>
  <div class="flex-1 pb-24 px-4 pt-3 select-none">
    <!-- 【已开通态】 -->
    <template v-if="userStore.isVip">
      <!-- 1. VIP 头卡 (紫金渐变) -->
      <div class="bg-gradient-to-br from-[#2D1B4E] via-[#1C1838] to-[#141828] border border-tj-purple/50 rounded-2xl p-5 mb-5 shadow-purple-glow relative overflow-hidden">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-tj-purple/20 border border-tj-purple flex items-center justify-center text-3xl">
              👑
            </div>
            <div>
              <div class="text-lg font-bold text-white flex items-center gap-2">
                <span>尊贵的会员</span>
                <span class="px-2 py-0.2 rounded-full bg-tj-grad-vip text-white text-[10px]">VIP</span>
              </div>
              <div class="text-xs text-white/80 mt-0.5">
                {{ userStore.user?.vip_expire_at ? new Date(userStore.user.vip_expire_at * 1000).toLocaleDateString() : '2027-09-25' }} 到期
              </div>
            </div>
          </div>

          <!-- 到期前续费按钮 -->
          <button
            @click="selectedPlan = 'quarterly'; scrollToPlans()"
            class="text-xs text-tj-primary font-bold hover:underline"
          >
            续费
          </button>
        </div>

        <!-- 免费次数进度条 -->
        <div class="space-y-1.5 pt-2 border-t border-white/10">
          <div class="flex justify-between text-xs text-white/90">
            <span>本月剩余免费次数</span>
            <span class="text-tj-cyan font-bold font-num">{{ userStore.freeQuota }} / 3 次</span>
          </div>
          <div class="w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div
              class="h-full bg-tj-cyan rounded-full transition-all duration-500 shadow-cyan-glow"
              :style="{ width: `${Math.min(100, (userStore.freeQuota / 3) * 100)}%` }"
            ></div>
          </div>
        </div>
      </div>
    </template>

    <!-- 【未开通态】 -->
    <template v-else>
      <!-- 1. 未开通头卡 -->
      <div class="bg-[#141828] border border-tj-primary/30 rounded-2xl p-5 mb-5 shadow-gold-glow text-center">
        <div class="text-[48px] text-tj-primary mb-2 leading-none">
          👑
        </div>
        <h2 class="text-lg font-semibold text-tj-text-primary mb-1">
          您还未开通会员
        </h2>
        <p class="text-xs text-tj-text-secondary">
          开通后立享测算 8 折 · 每月 3 次免费测算 · 报告不限次下载
        </p>
      </div>
    </template>

    <!-- 2. 档位卡 ×3 (纵向排列，中间季度卡高亮) -->
    <div id="vip-plans" class="space-y-3 mb-6">
      <div
        v-for="plan in plans"
        :key="plan.id"
        @click="selectedPlan = plan.id"
        class="relative rounded-2xl border p-4 cursor-pointer transition-all flex items-center justify-between"
        :class="[
          selectedPlan === plan.id
            ? 'bg-tj-purple/15 border-tj-primary shadow-gold-glow border-2'
            : 'bg-tj-bg-card border-white/10 hover:border-white/20'
        ]"
      >
        <!-- 胶囊标 -->
        <span
          v-if="plan.badge"
          class="absolute top-0 right-4 -translate-y-1/2 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-tj-grad-vip text-white shadow-md"
        >
          {{ plan.badge }}
        </span>

        <div>
          <div class="text-sm font-semibold text-tj-text-primary mb-0.5">{{ plan.name }}</div>
          <div class="text-xs text-tj-text-secondary">{{ plan.subtext }}</div>
          <div class="text-[11px] text-tj-text-faint mt-1">{{ plan.summary }}</div>
        </div>

        <div class="text-right">
          <div class="text-2xl font-bold font-num text-tj-primary">
            {{ plan.price }} <span class="text-xs font-sans">USDT</span>
          </div>
          <div v-if="plan.originalPrice" class="text-xs line-through text-tj-text-faint">
            {{ plan.originalPrice }} USDT
          </div>
        </div>
      </div>
    </div>

    <!-- 3. 权益明细列表 (✓ 金色 + 14px 逐条) -->
    <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-4 mb-5 space-y-3">
      <h3 class="text-xs font-semibold text-tj-text-secondary uppercase tracking-wider pb-2 border-b border-white/5">
        会员尊享权益
      </h3>
      <div v-for="b in benefits" :key="b" class="flex items-center gap-2.5 text-sm text-tj-text-primary">
        <span class="text-tj-primary font-bold">✓</span>
        <span>{{ b }}</span>
      </div>
    </div>

    <!-- 4. FAQ 折叠区 -->
    <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-4 mb-6 space-y-3">
      <h3 class="text-xs font-semibold text-tj-text-secondary uppercase tracking-wider pb-2 border-b border-white/5">
        常见问题解答 (FAQ)
      </h3>
      <div
        v-for="(faq, fIdx) in faqs"
        :key="fIdx"
        class="border-b border-white/5 last:border-none pb-2.5"
      >
        <button
          @click="toggleFaq(fIdx)"
          class="w-full flex items-center justify-between text-left text-sm font-semibold text-tj-text-primary py-1"
        >
          <span>{{ faq.q }}</span>
          <span class="text-xs text-tj-text-secondary transform transition-transform" :class="{ 'rotate-90': openFaq === fIdx }">
            ›
          </span>
        </button>
        <p v-show="openFaq === fIdx" class="text-xs text-tj-text-secondary mt-1.5 leading-relaxed pl-1">
          {{ faq.a }}
        </p>
      </div>
    </div>

    <!-- 5. 吸底主按钮 -->
    <div class="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-4 bg-tj-bg/95 backdrop-blur-md border-t border-white/10 z-20">
      <button
        @click="handleSubscribe"
        class="w-full h-12 rounded-full font-bold text-base transition-all flex items-center justify-center gap-2 bg-tj-grad-gold text-[#1A1405] shadow-gold-glow hover:brightness-110 active:scale-98"
      >
        <span>👑</span> {{ userStore.isVip ? '立即续费' : '立即开通' }} {{ activePlan?.name }} ({{ activePlan?.price }} USDT)
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";

const router = useRouter();
const userStore = useUserStore();

const selectedPlan = ref("quarterly");
const openFaq = ref<number | null>(0);

const plans = [
  {
    id: "monthly",
    name: "月度会员",
    price: 29,
    originalPrice: null,
    subtext: "连续包月",
    summary: "测算 8 折 · 每月 3 次免费测算 · 报告不限次下载",
    badge: null,
  },
  {
    id: "quarterly",
    name: "季度会员",
    price: 69,
    originalPrice: 87,
    subtext: "省 21%",
    summary: "测算 8 折 · 每月 3 次免费测算 · 报告不限次下载",
    badge: "最受欢迎",
  },
  {
    id: "yearly",
    name: "年度会员",
    price: 199,
    originalPrice: 348,
    subtext: "省 43%",
    summary: "测算 8 折 · 每月 3 次免费测算 · 不限次基础测算",
    badge: "超值甄选",
  },
];

const benefits = [
  "测算享 8 折专属优惠",
  "每月赠送 3 次免费测算",
  "报告不限次高清下载",
  "专属 VIP 尊贵身份标识",
];

const faqs = computed(() => {
  const base = [
    { q: "免费次数当月有效吗？", a: "按月发放，当月有效，次月1日自动重置。" },
    { q: "会员到期后报告还能看吗？", a: "已生成的报告长期永久可查看与导出。" },
    { q: "开通后何时生效？", a: "支付成功立即全节点同步生效。" },
  ];
  if (userStore.isVip) {
    base.push({ q: "如何续费？", a: "到期前 7 天起可在本页直接点击续费，时长自动累加。" });
  }
  return base;
});

const activePlan = computed(() => plans.find((p) => p.id === selectedPlan.value));

function toggleFaq(idx: number) {
  openFaq.value = openFaq.value === idx ? null : idx;
}

function scrollToPlans() {
  document.getElementById("vip-plans")?.scrollIntoView({ behavior: "smooth" });
}

function handleSubscribe() {
  if (!activePlan.value) return;
  router.push({
    path: "/pay",
    query: {
      type: "vip",
      plan: activePlan.value.id,
      amount: String(activePlan.value.price),
    },
  });
}
</script>
