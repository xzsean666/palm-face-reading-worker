<template>
  <div v-if="visible" class="fixed inset-0 z-50 bg-[#0B0E1A]/85 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fade-in">
    <div class="w-full max-w-sm bg-[#141828] border border-tj-cyan/40 rounded-3xl p-5 shadow-2xl relative">
      <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <h3 class="text-sm font-semibold text-tj-text-primary">智能合约提现</h3>
        <button
          @click="$emit('close')"
          class="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-tj-text-secondary hover:text-white"
        >
          ✕
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-tj-text-secondary">提现金额 (USDT)</span>
            <span class="text-tj-cyan font-mono">当前可用点数: {{ availableBalance.toFixed(2) }} U</span>
          </div>
          <div class="relative">
            <input
              v-model.number="amount"
              type="number"
              step="0.01"
              min="10"
              placeholder="最低 10 USDT"
              class="w-full h-11 px-3 pr-16 rounded-xl bg-white/5 border border-white/10 text-xs text-tj-text-primary focus:border-tj-cyan outline-none"
            />
            <button
              type="button"
              @click="amount = availableBalance"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-tj-cyan hover:underline font-semibold"
            >
              全部
            </button>
          </div>
        </div>

        <div>
          <label class="block text-xs text-tj-text-secondary mb-1">收款地址 (EVM 钱包)</label>
          <input
            v-model="address"
            type="text"
            placeholder="输入您的 USDT 钱包收款地址 (0x...)"
            class="w-full h-11 px-3 rounded-xl bg-white/5 border text-xs text-tj-text-primary font-mono focus:border-tj-cyan outline-none"
            :class="addressError ? 'border-tj-danger' : 'border-white/10'"
          />
          <span v-if="addressError" class="text-[10px] text-tj-danger mt-1 block">
            地址格式不正确
          </span>
        </div>

        <!-- 规则行 -->
        <div class="text-[11px] text-tj-text-faint leading-relaxed bg-white/5 p-3 rounded-xl border border-white/5">
          链上智能合约直提 · 最少 10 USDT 才能提现 · 0 手续费 · 实时到账
        </div>

        <!-- 主按钮：提交 -->
        <button
          type="submit"
          :disabled="submitting"
          class="w-full h-11 rounded-full bg-tj-cyan/20 border border-tj-cyan text-tj-cyan text-xs font-bold hover:bg-tj-cyan/30 active:scale-98 transition-all flex items-center justify-center gap-1.5"
        >
          <span v-if="submitting" class="w-4 h-4 rounded-full border-2 border-tj-cyan border-t-transparent animate-spin"></span>
          <span v-if="submitting">合约出块中...</span>
          <span v-else>确认链上提现</span>
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import type { Address } from "viem";
import { useUIStore } from "../../stores/ui";
import { useUserStore } from "../../stores/user";
import { executeWithdraw } from "../../utils/web3";

const props = defineProps<{
  visible: boolean;
  availableBalance: number;
  defaultAddress?: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "success"): void;
}>();

const uiStore = useUIStore();
const userStore = useUserStore();
const amount = ref<number | null>(null);
const address = ref(props.defaultAddress || "");
const addressError = ref(false);
const submitting = ref(false);

watch(
  () => props.defaultAddress,
  (val) => {
    if (val && !address.value) address.value = val;
  }
);

async function handleSubmit() {
  addressError.value = false;

  if (props.availableBalance < 10) {
    uiStore.showToast("可用余额不足 10 USDT");
    return;
  }
  if (!amount.value || amount.value < 10) {
    uiStore.showToast("最低提现 10 USDT");
    return;
  }
  if (amount.value > props.availableBalance) {
    uiStore.showToast("提现金额超出可用余额");
    return;
  }
  if (!address.value || !address.value.trim().startsWith("0x") || address.value.trim().length !== 42) {
    addressError.value = true;
    return;
  }

  submitting.value = true;
  try {
    // 1. 调用智能合约 withdraw
    const txHash = await executeWithdraw(address.value.trim() as Address, amount.value);

    // 2. 同步后端记录
    await fetch("/api/promote/sync-withdrawal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userStore.user?.id || address.value.trim(),
        amount: amount.value,
        txHash,
        payoutAddress: address.value.trim(),
      }),
    });

    uiStore.showToast("合约提现成功！USDT 已到账");
    await userStore.refreshProfile();
    emit("success");
    emit("close");
  } catch (err: any) {
    console.error("提现失败:", err);
    uiStore.showToast(err.message || "提现失败，请检查钱包");
  } finally {
    submitting.value = false;
  }
}
</script>
