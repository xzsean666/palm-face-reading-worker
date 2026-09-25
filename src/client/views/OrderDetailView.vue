<template>
  <div class="flex-1 pb-16 px-4 pt-3 select-none">
    <!-- 1. 状态卡 (居中，上图标下文字) -->
    <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-6 text-center mb-4 shadow-sm">
      <div class="text-4xl mb-2">✅</div>
      <h2 class="text-base font-bold text-tj-success">已完成</h2>
      <p class="text-xs text-tj-text-secondary mt-1">报告已全量解锁，永久可查</p>
    </div>

    <!-- 2. 信息卡 (键值行) -->
    <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-4 mb-4 divide-y divide-white/5 space-y-3">
      <div class="flex justify-between items-center text-xs pt-1">
        <span class="text-tj-text-secondary">订单编号</span>
        <span class="font-mono text-sm text-tj-text-primary">{{ orderId }}</span>
      </div>

      <div class="flex justify-between items-center text-xs pt-3">
        <span class="text-tj-text-secondary">功能</span>
        <span class="text-sm font-semibold text-tj-text-primary">八字推测</span>
      </div>

      <div class="flex justify-between items-center text-xs pt-3">
        <span class="text-tj-text-secondary">金额</span>
        <span class="text-sm font-bold font-num text-tj-primary">6 USDT</span>
      </div>

      <div class="flex justify-between items-center text-xs pt-3">
        <span class="text-tj-text-secondary">支付链</span>
        <span class="text-sm text-tj-text-primary">TRC20</span>
      </div>

      <div class="flex justify-between items-center text-xs pt-3">
        <span class="text-tj-text-secondary">交易哈希</span>
        <div class="flex items-center gap-1.5 font-mono text-xs text-tj-cyan">
          <span>0x78ab93…182734</span>
          <span class="cursor-pointer" @click="copyHash">🔗</span>
        </div>
      </div>

      <div class="flex justify-between items-center text-xs pt-3">
        <span class="text-tj-text-secondary">下单时间</span>
        <span class="text-xs font-mono text-tj-text-primary">2026-09-25 14:30:12</span>
      </div>

      <div class="flex justify-between items-center text-xs pt-3">
        <span class="text-tj-text-secondary">支付时间</span>
        <span class="text-xs font-mono text-tj-text-primary">2026-09-25 14:30:45</span>
      </div>
    </div>

    <!-- 3. 分润卡 (两级分润透明展示) -->
    <div class="bg-tj-bg-card border border-white/5 rounded-2xl p-4 mb-6 space-y-2.5">
      <div class="flex justify-between items-center text-xs">
        <span class="text-tj-text-secondary">直推分润</span>
        <span class="text-sm font-semibold font-num text-tj-primary">0.90 USDT</span>
      </div>
      <div class="flex justify-between items-center text-xs">
        <span class="text-tj-text-secondary">间推分润</span>
        <span class="text-sm font-semibold font-num text-tj-purple">0.30 USDT</span>
      </div>
    </div>

    <!-- 4. 操作区 -->
    <button
      @click="router.push('/feature/bazi/report')"
      class="w-full h-12 rounded-full font-bold text-sm bg-tj-grad-gold text-[#1A1405] shadow-gold-glow hover:brightness-110 active:scale-98 transition-all flex items-center justify-center"
    >
      查看报告
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUIStore } from "../stores/ui";

const route = useRoute();
const router = useRouter();
const uiStore = useUIStore();

const orderId = computed(() => (route.params.id as string) || "TJ202609250001");

function copyHash() {
  navigator.clipboard.writeText("0x78ab93cde89124fab0918237198274abc1293847192837491827349182734912");
  uiStore.showToast("交易哈希已复制");
}
</script>
