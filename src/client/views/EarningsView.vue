<template>
  <div class="flex-1 pb-16 px-4 pt-3 select-none">
    <!-- 1. 余额卡 -->
    <div class="bg-tj-bg-card border border-tj-primary/30 rounded-2xl p-4 mb-4 flex items-center justify-between shadow-sm">
      <div>
        <div class="text-xs text-tj-text-secondary mb-0.5">可提现余额</div>
        <div class="text-xl font-bold font-num text-tj-primary mb-1">
          {{ userStore.user?.earnings_balance?.toFixed(2) || "0.00" }} <span class="text-xs font-sans">USDT</span>
        </div>
        <div class="text-[11px] text-tj-text-faint">
          累计已提现 {{ userStore.user?.total_withdrawn?.toFixed(2) || "0.00" }} USDT
        </div>
      </div>

      <button
        @click="showWithdrawModal = true"
        class="h-10 px-5 rounded-full bg-tj-grad-gold text-[#1A1405] text-xs font-bold shadow-gold-glow hover:brightness-110 active:scale-95 transition-all"
      >
        提现
      </button>
    </div>

    <!-- 2. 分段 Tab 控件 -->
    <div class="grid grid-cols-2 p-1 bg-white/5 border border-white/5 rounded-xl mb-4 text-xs font-semibold">
      <button
        @click="activeTab = 'earnings'"
        class="py-2 rounded-lg transition-all"
        :class="activeTab === 'earnings' ? 'bg-tj-primary/12 text-tj-primary shadow-sm font-bold' : 'text-tj-text-secondary hover:text-white'"
      >
        收益记录
      </button>
      <button
        @click="activeTab = 'withdrawals'"
        class="py-2 rounded-lg transition-all"
        :class="activeTab === 'withdrawals' ? 'bg-tj-primary/12 text-tj-primary shadow-sm font-bold' : 'text-tj-text-secondary hover:text-white'"
      >
        提现记录
      </button>
    </div>

    <!-- 3. 收益记录列表 -->
    <template v-if="activeTab === 'earnings'">
      <div v-if="earningsList.length === 0" class="text-center py-16 bg-tj-bg-card rounded-2xl border border-white/5">
        <span class="text-4xl block mb-2">💰</span>
        <p class="text-sm text-tj-text-secondary mb-4">您还没有收益</p>
        <router-link
          to="/promote"
          class="px-5 py-2 rounded-full bg-tj-grad-gold text-[#1A1405] text-xs font-bold shadow-gold-glow"
        >
          去推广
        </router-link>
      </div>

      <div v-else class="space-y-2.5">
        <div
          v-for="item in earningsList"
          :key="item.id"
          class="h-16 bg-tj-bg-card border border-white/5 rounded-2xl px-4 flex items-center justify-between"
        >
          <div class="flex items-center gap-3">
            <span
              class="px-2 py-0.5 rounded text-[10px] font-bold"
              :class="item.type === 'direct' ? 'bg-tj-primary text-[#1A1405]' : 'bg-tj-purple text-white'"
            >
              {{ item.type === 'direct' ? '直推 15%' : '间推 5%' }}
            </span>
            <div>
              <div class="text-[13px] text-tj-text-primary">{{ item.source }}</div>
              <div class="text-[11px] text-tj-text-faint font-mono mt-0.5">{{ item.time }}</div>
            </div>
          </div>
          <div class="text-sm font-bold font-num text-tj-primary">
            +{{ item.amount }} USDT
          </div>
        </div>
      </div>
    </template>

    <!-- 4. 提现记录列表 -->
    <template v-else>
      <div v-if="withdrawalsList.length === 0" class="text-center py-16 bg-tj-bg-card rounded-2xl border border-white/5">
        <span class="text-4xl block mb-2">📜</span>
        <p class="text-sm text-tj-text-secondary">暂无提现记录</p>
      </div>

      <div v-else class="space-y-2.5">
        <div
          v-for="w in withdrawalsList"
          :key="w.id"
          class="h-16 bg-tj-bg-card border border-white/5 rounded-2xl px-4 flex items-center justify-between"
        >
          <div>
            <div class="text-sm font-bold font-num text-tj-text-primary">
              −{{ w.amount }} USDT
            </div>
            <div class="text-[11px] text-tj-text-faint font-mono mt-0.5">{{ w.time }}</div>
          </div>
          <span
            class="px-2 py-0.5 rounded text-[10px] font-medium"
            :class="[
              w.status === 'completed' ? 'bg-tj-success/15 text-tj-success' :
              w.status === 'pending' ? 'bg-tj-warning/15 text-tj-warning' : 'bg-tj-danger/15 text-tj-danger'
            ]"
          >
            {{ w.status === 'completed' ? '已到账' : w.status === 'pending' ? '审核中' : '已拒绝' }}
          </span>
        </div>
      </div>
    </template>

    <!-- 5. 提现弹窗组件 -->
    <WithdrawModal
      :visible="showWithdrawModal"
      :availableBalance="userStore.user?.earnings_balance || 0"
      :defaultAddress="userStore.user?.wallet_address || ''"
      @close="showWithdrawModal = false"
      @success="onWithdrawSuccess"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "../stores/user";
import WithdrawModal from "../components/common/WithdrawModal.vue";

const userStore = useUserStore();
const activeTab = ref<"earnings" | "withdrawals">("earnings");
const showWithdrawModal = ref(false);

const earningsList = ref([
  { id: "e1", type: "direct", source: "海*** 解锁了八字推测", amount: "0.90", time: "2026-09-25 14:32" },
  { id: "e2", type: "indirect", source: "云*** 开通了月度会员", amount: "1.45", time: "2026-09-25 11:20" },
  { id: "e3", type: "direct", source: "剑*** 解锁了手相解秘", amount: "0.90", time: "2026-09-24 19:40" },
]);

const withdrawalsList = ref([
  { id: "w1", amount: "50.00", status: "completed", time: "2026-09-23 10:15" },
  { id: "w2", amount: "30.00", status: "completed", time: "2026-09-20 16:50" },
]);

function onWithdrawSuccess() {
  userStore.refreshProfile();
  withdrawalsList.value.unshift({
    id: "w_" + Date.now(),
    amount: "10.00",
    status: "pending",
    time: new Date().toLocaleString(),
  });
}
</script>
