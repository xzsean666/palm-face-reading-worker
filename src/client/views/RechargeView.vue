<template>
  <div class="flex-1 pb-24 px-4 pt-3 select-none">
    <!-- 1. 顶部返回与标题 -->
    <div class="flex items-center justify-between mb-4">
      <button
        @click="handleBack"
        class="w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-tj-text-secondary hover:text-white transition-colors"
      >
        ‹
      </button>
      <h2 class="text-base font-bold text-tj-text-primary">服务点数充值</h2>
      <div class="w-9"></div>
    </div>

    <!-- 2. 若由支付页跳转而来，展示差额提示卡 -->
    <div
      v-if="neededAmount"
      class="bg-tj-primary/10 border border-tj-primary/40 rounded-2xl p-3.5 mb-4 animate-fade-in"
    >
      <div class="flex items-start gap-2.5">
        <span class="text-lg">💡</span>
        <div>
          <div class="text-xs font-bold text-tj-primary mb-0.5">
            当前测算点数不足提醒
          </div>
          <div class="text-xs text-tj-text-secondary leading-relaxed">
            您本次测算尚需 <span class="font-bold text-tj-primary font-mono">{{ neededAmount }} USDT</span>。充值完成后可直接一键返回继续完成支付。
          </div>
        </div>
      </div>
    </div>

    <!-- 3. 账户资产卡 (钱包余额 + 当前点数) -->
    <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-4 mb-4 space-y-3 shadow-sm">
      <div class="flex justify-between items-center text-xs pb-2 border-b border-white/5">
        <span class="text-tj-text-secondary">当前连接钱包</span>
        <span class="font-mono text-tj-text-primary text-[11px]">{{ displayAddress }}</span>
      </div>

      <div class="grid grid-cols-2 divide-x divide-white/10 pt-1 text-center">
        <div>
          <div class="text-xs text-tj-text-secondary mb-0.5">钱包 USDT 余额</div>
          <div class="text-lg font-bold font-num text-tj-text-primary">
            {{ walletUsdtBalance !== null ? walletUsdtBalance.toFixed(2) : "..." }} <span class="text-xs font-sans">U</span>
          </div>
        </div>

        <div>
          <div class="text-xs text-tj-primary-light mb-0.5">当前可用服务点数</div>
          <div class="text-lg font-bold font-num text-tj-primary">
            {{ creditBalance !== null ? creditBalance.toFixed(2) : "..." }} <span class="text-xs font-sans">点</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 测试网领水提示卡（仅测试网环境显示） -->
    <div
      v-if="isTestnet()"
      class="bg-tj-cyan/10 border border-tj-cyan/30 rounded-2xl p-3 mb-4 text-xs space-y-2"
    >
      <div class="flex items-center justify-between text-tj-cyan">
        <span class="font-semibold">🧪 测试网快捷领水</span>
        <button
          @click="handleQuickMint"
          :disabled="minting"
          class="px-2.5 py-0.5 rounded-full bg-tj-cyan/20 border border-tj-cyan/50 text-tj-cyan hover:bg-tj-cyan/30 text-[11px] font-bold disabled:opacity-50"
        >
          {{ minting ? '领水中...' : '一键领 1,000 U' }}
        </button>
      </div>
      <div class="text-[11px] text-tj-text-secondary">
        若钱包内测试 USDT 不足，可直接点击领水快速获取测试代币。
      </div>
    </div>

    <!-- 4. 充值档位选择 -->
    <div class="mb-4 space-y-2.5">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-tj-text-primary">选择充值档位</span>
        <span class="text-[11px] text-tj-text-faint">1 USDT = 1 服务点数</span>
      </div>

      <!-- 快速补齐差额按钮（若存在 neededAmount 且不在常用档位中） -->
      <button
        v-if="neededAmount && !presetAmounts.includes(Number(neededAmount))"
        @click="selectAmount(Number(neededAmount))"
        class="w-full p-3 rounded-2xl border text-left flex items-center justify-between transition-all"
        :class="selectedAmount === Number(neededAmount) && !isCustom ? 'bg-tj-primary/15 border-tj-primary shadow-gold-glow' : 'bg-tj-bg-card border-white/10 hover:border-white/20'"
      >
        <div class="flex items-center gap-2">
          <span class="text-base">🎯</span>
          <div>
            <div class="text-sm font-bold text-tj-primary">精准补齐测算差额</div>
            <div class="text-[11px] text-tj-text-secondary">正好满足当前测算所需金额</div>
          </div>
        </div>
        <div class="text-base font-bold font-num text-tj-primary">
          {{ neededAmount }} <span class="text-xs font-sans">USDT</span>
        </div>
      </button>

      <!-- 预设充值档位网格 -->
      <div class="grid grid-cols-2 gap-2.5">
        <div
          v-for="item in planPresets"
          :key="item.amount"
          @click="selectAmount(item.amount)"
          class="relative p-3.5 rounded-2xl border transition-all cursor-pointer text-left"
          :class="[
            selectedAmount === item.amount && !isCustom
              ? 'bg-tj-primary/15 border-tj-primary shadow-gold-glow'
              : 'bg-tj-bg-card border-white/10 hover:border-white/20'
          ]"
        >
          <span
            v-if="item.badge"
            class="absolute top-0 right-2 -translate-y-1/2 px-2 py-0.2 rounded-full text-[9px] font-bold bg-tj-grad-gold text-[#1A1405] shadow-sm"
          >
            {{ item.badge }}
          </span>

          <div class="text-lg font-bold font-num text-tj-primary mb-0.5">
            {{ item.amount }} <span class="text-xs font-sans font-normal">USDT</span>
          </div>
          <div class="text-xs text-tj-text-primary font-medium">{{ item.title }}</div>
          <div class="text-[10px] text-tj-text-faint mt-0.5">{{ item.desc }}</div>
        </div>
      </div>
    </div>

    <!-- 5. 自定义输入金额 -->
    <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-4 mb-4 space-y-2">
      <div class="flex items-center justify-between text-xs">
        <span class="font-semibold text-tj-text-primary">自定义充值金额</span>
        <span class="text-[11px] text-tj-text-faint">最低 1 USDT 起充</span>
      </div>

      <div class="relative flex items-center">
        <input
          type="number"
          v-model="customInput"
          @focus="isCustom = true"
          @input="onCustomInput"
          placeholder="请输入充值金额"
          class="w-full h-11 bg-white/5 border rounded-xl px-3 pr-16 text-sm text-tj-text-primary font-num outline-none transition-colors"
          :class="isCustom ? 'border-tj-primary shadow-sm' : 'border-white/10 focus:border-tj-primary'"
          min="1"
          step="any"
        />
        <span class="absolute right-3 text-xs font-bold text-tj-text-secondary">USDT</span>
      </div>
    </div>

    <!-- 6. 推广分润与点数规则说明卡片 -->
    <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-3.5 mb-6 text-xs space-y-2">
      <div class="text-xs font-semibold text-tj-primary flex items-center gap-1.5">
        <span>🛡️</span> 平台服务点数与分润规则
      </div>
      <ul class="text-[11px] text-tj-text-secondary space-y-1.5 list-disc pl-4 leading-relaxed">
        <li>
          <strong class="text-tj-text-primary">点数使用：</strong>充值存入您的链上个人服务点数余额（1 USDT = 1 点数），随时可用于各项 AI 测算及会员抵扣，点数永久有效。
        </li>
        <li>
          <strong class="text-tj-primary">消费才享奖励：</strong>充值过程仅增加点数资产，<span class="text-tj-primary underline">充值不发放推广奖励</span>。推荐人分润（直推 15%、间推 5%）仅在您<strong>实际发起测算消费核销（Consume）时</strong>由智能合约及系统自动结算。
        </li>
      </ul>
    </div>

    <!-- 7. 吸底主按钮 -->
    <div class="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-4 bg-tj-bg/95 backdrop-blur-md border-t border-white/10 z-20">
      <button
        @click="handleRecharge"
        :disabled="recharging || effectiveAmount <= 0"
        class="w-full h-12 rounded-full font-bold text-base transition-all flex items-center justify-center gap-2 bg-tj-grad-gold text-[#1A1405] shadow-gold-glow hover:brightness-110 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span v-if="recharging" class="w-5 h-5 rounded-full border-2 border-[#1A1405] border-t-transparent animate-spin"></span>
        <span v-if="recharging">正在链上充值中…</span>
        <span v-else class="flex items-center gap-2">
          <span>💳</span> 立即充值 {{ effectiveAmount }} USDT 服务点数
        </span>
      </button>
    </div>

    <!-- 链上充值全屏遮罩 -->
    <div
      v-if="confirmingOnChain"
      class="fixed inset-0 z-50 bg-[#0B0E1A]/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 select-none"
    >
      <div class="w-20 h-20 rounded-full border-4 border-tj-primary border-t-transparent animate-spin mb-4 shadow-gold-glow"></div>
      <h3 class="text-base font-bold text-tj-text-primary mb-2">服务点数充值中</h3>
      <p class="text-xs text-tj-primary-light font-mono max-w-xs mb-2 bg-white/5 py-1.5 px-3 rounded-xl border border-tj-primary/30">
        {{ chainProgressText || '正在广播交易至区块链节点...' }}
      </p>
      <p class="text-[11px] text-tj-text-secondary max-w-xs">
        智能合约正在存入您的点数账户，充值完成后即可直接消费抵扣测算...
      </p>
    </div>

    <!-- 充值成功弹窗 🎉 -->
    <div
      v-if="showSuccessModal"
      class="fixed inset-0 z-50 bg-[#0B0E1A]/85 backdrop-blur-md flex items-center justify-center p-6 select-none animate-fade-in"
    >
      <div class="w-full max-w-sm bg-[#141828] border-2 border-tj-primary/50 rounded-3xl p-6 text-center shadow-gold-glow relative">
        <div class="text-5xl mb-3">🎉</div>
        <h3 class="text-lg font-bold text-tj-text-primary mb-1 font-display">
          充值成功！
        </h3>
        <p class="text-xs text-tj-text-secondary mb-4">
          已成功到账 <span class="text-tj-primary font-bold font-num">{{ lastRechargedAmount }} USDT</span> 服务点数
        </p>

        <div class="bg-white/5 border border-tj-primary/30 rounded-2xl p-3.5 mb-4 text-xs text-tj-text-secondary">
          当前最新可用点数：<span class="text-base font-bold text-tj-primary font-mono">{{ creditBalance?.toFixed(2) }}</span> 点
        </div>

        <div class="space-y-2.5">
          <button
            v-if="redirectPath"
            @click="proceedToRedirect"
            class="w-full h-11 rounded-full bg-tj-grad-gold text-[#1A1405] text-xs font-bold shadow-gold-glow hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <span>✨</span> 返回继续完成测算支付 ›
          </button>
          <button
            @click="router.push('/home')"
            class="w-full h-10 rounded-full bg-white/10 hover:bg-white/15 text-xs text-white font-semibold transition-colors"
          >
            返回首页推演
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { Address } from "viem";
import { useUserStore } from "../stores/user";
import { useUIStore } from "../stores/ui";
import {
  executeDeposit,
  getUSDTBalance,
  getServiceBalance,
  mintTestTokens,
  isTestnet,
} from "../utils/web3";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const uiStore = useUIStore();

const redirectPath = computed(() => (route.query.redirect as string) || "");
const neededAmount = computed(() => (route.query.needed as string) || "");

const walletUsdtBalance = ref<number | null>(null);
const creditBalance = ref<number | null>(null);

const presetAmounts = [10, 30, 50, 100];
const planPresets = [
  { amount: 10, title: "初阶推演", desc: "入门体验 1~2 次测算", badge: null },
  { amount: 30, title: "热门推荐", desc: "可约测算 5 次深度解读", badge: "推荐" },
  { amount: 50, title: "超值畅享", desc: "多门类综合推演", badge: null },
  { amount: 100, title: "至尊无忧", desc: "家庭命盘及全年咨询", badge: "尊享" },
];

const selectedAmount = ref<number>(
  neededAmount.value && !isNaN(Number(neededAmount.value))
    ? Math.max(1, Math.ceil(Number(neededAmount.value)))
    : 30
);
const customInput = ref<string>("");
const isCustom = ref(false);

const effectiveAmount = computed(() => {
  if (isCustom.value) {
    const parsed = parseFloat(customInput.value);
    return isNaN(parsed) || parsed <= 0 ? 0 : parsed;
  }
  return selectedAmount.value;
});

const displayAddress = computed(() => {
  const addr = userStore.user?.wallet_address;
  if (!addr) return "未连接钱包";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
});

const recharging = ref(false);
const confirmingOnChain = ref(false);
const chainProgressText = ref("");
const showSuccessModal = ref(false);
const lastRechargedAmount = ref(0);
const minting = ref(false);

function selectAmount(amt: number) {
  isCustom.value = false;
  selectedAmount.value = amt;
  customInput.value = "";
}

function onCustomInput() {
  isCustom.value = true;
}

async function refreshBalances() {
  let addr = userStore.user?.wallet_address;
  if (!addr && typeof window !== "undefined" && (window as any).ethereum?.selectedAddress) {
    addr = (window as any).ethereum.selectedAddress;
  }
  if (addr && addr.startsWith("0x")) {
    try {
      const [u, c] = await Promise.all([
        getUSDTBalance(addr as Address),
        getServiceBalance(addr as Address),
      ]);
      walletUsdtBalance.value = u;
      creditBalance.value = c;
      userStore.onChainBalance = c;
      userStore.usdtBalance = u;
    } catch (e) {
      console.warn("查询余额失败:", e);
    }
  }
}

onMounted(async () => {
  await refreshBalances();
});

async function handleQuickMint() {
  let addr = userStore.user?.wallet_address;
  if (!addr && typeof (window as any).ethereum !== "undefined") {
    const accs = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
    if (accs && accs[0]) {
      addr = accs[0];
      await userStore.loginWithWallet(accs[0]);
    }
  }
  if (!addr || !addr.startsWith("0x")) {
    uiStore.showToast("请先连接钱包");
    return;
  }

  minting.value = true;
  try {
    uiStore.showToast("正在向测试合约铸造 1,000 USDT...");
    await mintTestTokens(addr as Address, 1000);
    uiStore.showToast("✓ 成功领取 1,000 USDT 测试币！");
    await refreshBalances();
  } catch (err: any) {
    console.error("领水失败:", err);
    uiStore.showToast(err.message || "领取失败，请检查钱包 Gas 余额或重试");
  } finally {
    minting.value = false;
  }
}

async function handleRecharge() {
  const amt = effectiveAmount.value;
  if (amt <= 0) {
    uiStore.showToast("请输入有效的充值金额");
    return;
  }

  recharging.value = true;
  confirmingOnChain.value = true;
  chainProgressText.value = "准备与智能合约交互...";

  try {
    let userAddress = userStore.user?.wallet_address;
    if (!userAddress && typeof (window as any).ethereum !== "undefined") {
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts[0]) {
        userAddress = accounts[0] as string;
        await userStore.loginWithWallet(accounts[0] as string);
      }
    }

    if (!userAddress || !userAddress.startsWith("0x")) {
      throw new Error("请先连接 Web3 钱包");
    }

    // 1. 获取推荐人地址
    chainProgressText.value = "查询推荐人信息...";
    const refRes = await fetch(`/api/user/referrer-info?userId=${encodeURIComponent(userStore.user?.id || userAddress)}`);
    const refJson = await refRes.json();
    const referrerWalletAddress = refJson.data?.referrerWalletAddress;

    // 2. 执行 Deposit 充值
    await executeDeposit({
      userAddress: userAddress as Address,
      amountUsdt: amt,
      referrerAddress: referrerWalletAddress as Address,
      onProgress: (stepMsg) => {
        chainProgressText.value = stepMsg;
      },
    });

    lastRechargedAmount.value = amt;
    await refreshBalances();
    showSuccessModal.value = true;
  } catch (err: any) {
    console.error("充值异常:", err);
    uiStore.showToast(err.message || "充值失败，请检查钱包余额或重试");
  } finally {
    recharging.value = false;
    confirmingOnChain.value = false;
  }
}

function handleBack() {
  if (redirectPath.value) {
    router.push(redirectPath.value);
  } else {
    router.back();
  }
}

function proceedToRedirect() {
  showSuccessModal.value = false;
  if (redirectPath.value) {
    router.push(redirectPath.value);
  } else {
    router.push("/home");
  }
}
</script>
