<template>
  <div class="flex-1 pb-16 px-4 pt-3 select-none">
    <!-- 1. 状态卡 (居中，上图标下文字) -->
    <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-6 text-center mb-4 shadow-sm">
      <div class="text-4xl mb-2">{{ isCompleted ? "✅" : "⏳" }}</div>
      <h2 class="text-base font-bold" :class="isCompleted ? 'text-tj-success' : 'text-tj-warning'">
        {{ isCompleted ? "已完成" : "待处理 / 待解锁" }}
      </h2>
      <p class="text-xs text-tj-text-secondary mt-1">
        {{ isCompleted ? "报告已全量解锁，永久可查" : "请完成支付或使用免费额度解锁查看" }}
      </p>
    </div>

    <!-- 2. 信息卡 (键值行) -->
    <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-4 mb-4 divide-y divide-white/5 space-y-3">
      <div class="flex justify-between items-center text-xs pt-1">
        <span class="text-tj-text-secondary">订单编号</span>
        <span class="font-mono text-sm text-tj-text-primary">{{ displayOrderId }}</span>
      </div>

      <div class="flex justify-between items-center text-xs pt-3">
        <span class="text-tj-text-secondary">功能类别</span>
        <span class="text-sm font-semibold text-tj-text-primary">{{ displayCategoryName }}</span>
      </div>

      <div class="flex justify-between items-center text-xs pt-3">
        <span class="text-tj-text-secondary">订单金额</span>
        <span class="text-sm font-bold font-num text-tj-primary">{{ orderAmount }} USDT</span>
      </div>

      <div class="flex justify-between items-center text-xs pt-3">
        <span class="text-tj-text-secondary">支付方式</span>
        <span class="text-sm text-tj-text-primary">{{ displayPayType }}</span>
      </div>

      <div v-if="txHash" class="flex justify-between items-center text-xs pt-3">
        <span class="text-tj-text-secondary">交易哈希</span>
        <div class="flex items-center gap-1.5 font-mono text-xs text-tj-cyan">
          <span>{{ txHash.slice(0, 10) }}…{{ txHash.slice(-8) }}</span>
          <span class="cursor-pointer" @click="copyHash">🔗</span>
        </div>
      </div>

      <div class="flex justify-between items-center text-xs pt-3">
        <span class="text-tj-text-secondary">下单时间</span>
        <span class="text-xs font-mono text-tj-text-primary">{{ createTimeStr }}</span>
      </div>
    </div>

    <!-- 3. 分润卡 (两级分润透明展示) -->
    <div v-if="directCut > 0 || indirectCut > 0" class="bg-tj-bg-card border border-white/5 rounded-2xl p-4 mb-6 space-y-2.5">
      <div v-if="directCut > 0" class="flex justify-between items-center text-xs">
        <span class="text-tj-text-secondary">直推分润 (15%)</span>
        <span class="text-sm font-semibold font-num text-tj-primary">+{{ directCut.toFixed(2) }} USDT</span>
      </div>
      <div v-if="indirectCut > 0" class="flex justify-between items-center text-xs">
        <span class="text-tj-text-secondary">间推分润 (5%)</span>
        <span class="text-sm font-semibold font-num text-tj-purple">+{{ indirectCut.toFixed(2) }} USDT</span>
      </div>
    </div>

    <!-- 4. 操作区 -->
    <button
      @click="viewReport"
      class="w-full h-12 rounded-full font-bold text-sm bg-tj-grad-gold text-[#1A1405] shadow-gold-glow hover:brightness-110 active:scale-98 transition-all flex items-center justify-center"
    >
      {{ isCompleted ? "查看完整报告" : "前往解锁报告" }}
    </button>
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

const orderId = computed(() => (route.params.id as string) || "");

const orderDetail = ref<any>(null);

onMounted(async () => {
  if (orderId.value) {
    try {
      const userId = userStore.user?.id || "guest";
      const res = await fetch(`/api/orders/${encodeURIComponent(orderId.value)}?userId=${encodeURIComponent(userId)}`);
      const json = await res.json();
      if (json.success && json.data) {
        orderDetail.value = json.data;
      }
    } catch (err) {
      console.warn("加载订单详情失败:", err);
    }
  }
});

const isCompleted = computed(() => {
  return orderDetail.value ? orderDetail.value.status === "COMPLETED" : true;
});

const displayOrderId = computed(() => orderDetail.value?.id || orderId.value || "TJ202609250001");
const displayCategory = computed(() => orderDetail.value?.category || "bazi");
const displayCategoryName = computed(() => CATEGORIES_CONFIG[displayCategory.value]?.name || "八字推测");
const orderAmount = computed(() => (orderDetail.value?.price_usdt ?? 6.0).toFixed(2));
const displayPayType = computed(() => {
  const p = orderDetail.value?.pay_type;
  if (p === "FREE_QUOTA") return "免费额度抵扣";
  if (p === "USDT_ERC20") return "USDT (ERC20 智能合约)";
  if (p === "USDT_TRC20") return "USDT (TRC20)";
  return "USDT 支付";
});

const txHash = computed(() => orderDetail.value?.tx_hash || "");
const createTimeStr = computed(() => {
  const t = orderDetail.value?.created_at;
  return t ? new Date(t).toLocaleString("zh-CN") : new Date().toLocaleString("zh-CN");
});

const directCut = computed(() => Number(orderDetail.value?.referrer_direct_cut || 0));
const indirectCut = computed(() => Number(orderDetail.value?.referrer_indirect_cut || 0));

function copyHash() {
  if (txHash.value) {
    navigator.clipboard.writeText(txHash.value);
    uiStore.showToast("交易哈希已复制");
  }
}

function viewReport() {
  if (isCompleted.value) {
    router.push({
      path: `/feature/${displayCategory.value}/report`,
      query: { orderId: displayOrderId.value },
    });
  } else {
    router.push({
      path: `/feature/${displayCategory.value}/preview`,
      query: { orderId: displayOrderId.value },
    });
  }
}
</script>
