<template>
  <div class="flex-1 pb-24 px-4 pt-3 select-none">
    <!-- 1. 订单卡 (四行键值) -->
    <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-4 mb-4 space-y-3">
      <div class="flex justify-between items-center text-xs">
        <span class="text-tj-text-secondary">功能名称</span>
        <span class="text-sm font-semibold text-tj-text-primary">{{ featureName }}</span>
      </div>
      <div class="flex justify-between items-center text-xs">
        <span class="text-tj-text-secondary">报告类型</span>
        <span class="text-sm font-semibold text-tj-primary-light">专属完整版</span>
      </div>
      <div class="flex justify-between items-center text-xs">
        <span class="text-tj-text-secondary">订单编号</span>
        <span class="text-xs font-mono text-tj-text-primary">{{ orderNo }}</span>
      </div>
      <div class="flex justify-between items-center text-xs">
        <span class="text-tj-text-secondary">下单时间</span>
        <span class="text-xs font-mono text-tj-text-primary">{{ orderTime }}</span>
      </div>
    </div>

    <!-- 2. 金额卡 (居中 28px/700 金) -->
    <div class="text-center py-4 mb-4 bg-tj-bg-card border border-tj-primary/20 rounded-2xl shadow-sm">
      <div class="text-xs text-tj-text-secondary mb-1">应付金额</div>
      <div class="text-[28px] font-bold font-num text-tj-primary">
        {{ selectedMethod === 'free' ? '0.00' : amount }} <span class="text-base font-sans font-normal">USDT</span>
      </div>
    </div>

    <!-- 3. 支付方式 (单选卡片组) -->
    <div class="space-y-2.5 mb-5">
      <div class="text-xs font-semibold text-tj-text-primary mb-1">选择支付与核销方式</div>

      <!-- 智能合约 USDT 支付 -->
      <div
        @click="selectedMethod = 'contract'"
        class="relative p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between"
        :class="selectedMethod === 'contract' ? 'bg-tj-primary/10 border-tj-primary shadow-gold-glow' : 'bg-tj-bg-card border-white/10 hover:border-white/20'"
      >
        <span v-if="selectedMethod === 'contract'" class="absolute top-2 right-2 text-xs text-tj-primary font-bold">✓</span>
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-lg">
            💎
          </div>
          <div>
            <div class="text-sm font-semibold text-tj-text-primary">USDT 智能合约支付</div>
            <div class="text-[11px] text-tj-primary-light">推荐 · 链上智能合约结算 · 自动分润 (15%/5%)</div>
          </div>
        </div>
      </div>

      <!-- 免费次数抵扣 -->
      <div
        @click="hasFreeQuota && (selectedMethod = 'free')"
        class="relative p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between"
        :class="[
          !hasFreeQuota ? 'opacity-40 cursor-not-allowed bg-tj-bg-card border-white/5' :
          selectedMethod === 'free' ? 'bg-tj-cyan/15 border-tj-cyan shadow-cyan-glow' : 'bg-tj-bg-card border-white/10 hover:border-white/20'
        ]"
      >
        <span v-if="selectedMethod === 'free'" class="absolute top-2 right-2 text-xs text-tj-cyan font-bold">✓</span>
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-white/5 flex items-center justify-center text-lg">
            ✨
          </div>
          <div>
            <div class="text-sm font-semibold text-tj-text-primary">免费次数抵扣</div>
            <div class="text-[11px] text-tj-cyan">剩余 {{ userStore.freeQuota }} 次测算机会</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. 推荐信息行 -->
    <div class="text-xs text-tj-text-faint text-center mb-2">
      推荐人：{{ userStore.user?.referrer_id ? userStore.user.referrer_id.slice(0, 10) + '...' : '平台直属' }}
    </div>

    <!-- 5. 退款承诺行 -->
    <div class="text-xs text-tj-cyan text-center flex items-center justify-center gap-1.5 mb-2">
      <span>🛡️</span> 链上智能合约资金托管 · 自动结算
    </div>

    <!-- 6. 协议行 -->
    <div class="text-xs text-tj-text-faint text-center mb-6">
      支付即代表同意
      <router-link to="/about" class="text-tj-primary hover:underline">《服务协议》</router-link>
    </div>

    <!-- 7. 吸底主按钮 -->
    <div class="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-4 bg-tj-bg/95 backdrop-blur-md border-t border-white/10 z-20">
      <button
        @click="handlePay"
        :disabled="paying"
        class="w-full h-12 rounded-full font-bold text-base transition-all flex items-center justify-center gap-2 bg-tj-grad-gold text-[#1A1405] shadow-gold-glow hover:brightness-110 active:scale-98"
      >
        <span v-if="paying" class="w-5 h-5 rounded-full border-2 border-[#1A1405] border-t-transparent animate-spin"></span>
        <span v-if="paying">正在链上交互中…</span>
        <span v-else-if="selectedMethod === 'free'" class="flex items-center gap-2">
          <span>✨</span> 确认抵扣并查看完整报告
        </span>
        <span v-else class="flex items-center gap-2">
          <span>👛</span> 立即支付 {{ amount }} USDT
        </span>
      </button>
    </div>

    <!-- 链上确认中全屏遮罩 -->
    <div v-if="confirmingOnChain" class="fixed inset-0 z-50 bg-[#0B0E1A]/90 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 select-none">
      <div class="w-20 h-20 rounded-full border-4 border-tj-primary border-t-transparent animate-spin mb-4 shadow-gold-glow"></div>
      <h3 class="text-base font-bold text-tj-text-primary mb-2">智能合约交互中</h3>
      <p class="text-xs text-tj-primary-light font-mono max-w-xs mb-2 bg-white/5 py-1.5 px-3 rounded-xl border border-tj-primary/30">
        {{ chainProgressText || '正在广播交易至区块链节点...' }}
      </p>
      <p class="text-[11px] text-tj-text-secondary max-w-xs">
        智能合约正在执行充值、点数核销及推荐人多级分润分发...
      </p>
    </div>

    <!-- 首次付费成功庆祝弹窗 🎉 -->
    <div v-if="showSuccessCelebration" class="fixed inset-0 z-50 bg-[#0B0E1A]/85 backdrop-blur-md flex items-center justify-center p-6 select-none animate-fade-in">
      <div class="w-full max-w-sm bg-[#141828] border-2 border-tj-primary/50 rounded-3xl p-6 text-center shadow-gold-glow relative">
        <div class="text-5xl mb-3">🎉</div>
        <h3 class="text-lg font-bold text-tj-text-primary mb-1 font-display">
          支付成功！已解锁完整报告
        </h3>
        <p class="text-xs text-tj-text-secondary mb-4">
          恭喜您荣升天机合伙人，已获得您的专属推荐码
        </p>

        <!-- 专属推荐码大字框 -->
        <div class="bg-white/5 border border-tj-primary/40 rounded-2xl p-4 mb-4">
          <div class="text-[11px] text-tj-text-faint mb-1">您的专属推广码（享15%直推返佣）</div>
          <div class="text-2xl font-bold font-mono text-tj-primary tracking-wider">
            {{ userStore.user?.referral_code || 'TJ88888' }}
          </div>
        </div>

        <div class="flex gap-2.5 mb-4">
          <button
            @click="copyCode"
            class="flex-1 h-10 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-white font-semibold transition-colors"
          >
            复制推荐码
          </button>
          <button
            @click="router.push(`/invite/${userStore.user?.referral_code || 'TJ88888'}`)"
            class="flex-1 h-10 rounded-xl bg-tj-primary/20 border border-tj-primary text-xs text-tj-primary font-semibold transition-colors"
          >
            生成邀请海报
          </button>
        </div>

        <button
          @click="proceedToReport"
          class="w-full h-11 rounded-full bg-tj-grad-gold text-[#1A1405] text-xs font-bold shadow-gold-glow hover:brightness-110 active:scale-95 transition-all"
        >
          继续阅读完整报告 ›
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import type { Address } from "viem";
import { useUserStore } from "../stores/user";
import { useUIStore } from "../stores/ui";
import { CATEGORIES_CONFIG } from "../stores/divination";
import { executePayAndConsume } from "../utils/web3";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const uiStore = useUIStore();

const payType = computed(() => (route.query.type as string) || "single");
const category = computed(() => (route.query.category as string) || "bazi");
const planKey = computed(() => (route.query.plan as string) || "quarterly");
const existingOrderId = computed(() => (route.query.orderId as string) || "");

const featureName = computed(() => {
  if (payType.value === "vip") {
    const planNames: Record<string, string> = {
      monthly: "月度 VIP 会员",
      quarterly: "季度 VIP 会员",
      yearly: "年度 VIP 会员",
    };
    return planNames[planKey.value] || "VIP 会员服务";
  }
  return CATEGORIES_CONFIG[category.value]?.name || "八字推测";
});

const amount = computed(() => (route.query.amount as string) || (payType.value === "vip" ? "69" : "6"));

const selectedMethod = ref<"contract" | "free">("contract");
const hasFreeQuota = computed(() => payType.value !== "vip" && userStore.freeQuota > 0);

const orderNo = ref(existingOrderId.value || ("TJ" + new Date().toISOString().slice(0, 10).replace(/-/g, "") + "0001"));
const orderTime = ref(new Date().toLocaleString());

const paying = ref(false);
const confirmingOnChain = ref(false);
const chainProgressText = ref("");
const showSuccessCelebration = ref(false);
const confirmedOrderId = ref("");

async function handlePay() {
  if (selectedMethod.value === "free" && payType.value !== "vip") {
    // 免费抵扣
    paying.value = true;
    try {
      const res = await fetch("/api/orders/use-free-quota", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userStore.user?.id || "guest",
          category: category.value,
          orderId: existingOrderId.value || undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        uiStore.showToast("已成功抵扣免费额度！");
        await userStore.refreshProfile();
        const targetOrderId = data.data?.order?.id || existingOrderId.value;
        router.push({
          path: `/feature/${category.value}/report`,
          query: targetOrderId ? { orderId: targetOrderId } : undefined,
        });
      } else {
        uiStore.showToast(data.error || "核销失败");
      }
    } catch {
      uiStore.showToast("请求失败，请重试");
    } finally {
      paying.value = false;
    }
    return;
  }

  // USDT 智能合约支付
  paying.value = true;
  confirmingOnChain.value = true;
  chainProgressText.value = "准备与智能合约交互...";

  try {
    let userAddress = userStore.user?.wallet_address;
    if (!userAddress && typeof (window as any).ethereum !== "undefined") {
      const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts[0]) {
        userAddress = accounts[0];
        await userStore.loginWithWallet(userAddress);
      }
    }

    if (!userAddress || !userAddress.startsWith("0x")) {
      throw new Error("请先连接 Web3 钱包（MetaMask / Rabby 等）");
    }

    // 1. 获取推荐人链上地址
    chainProgressText.value = "查询推荐人信息...";
    const refRes = await fetch(`/api/user/referrer-info?userId=${encodeURIComponent(userStore.user?.id || userAddress)}`);
    const refJson = await refRes.json();
    const referrerWalletAddress = refJson.data?.referrerWalletAddress;

    let targetOrderId = existingOrderId.value;

    // 2. 若是测算订单且尚无 orderId，创建后端测算订单
    if (payType.value !== "vip" && !targetOrderId) {
      chainProgressText.value = "创建测算订单...";
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userStore.user?.id || userAddress,
          category: category.value,
          subcategory: (route.query.sub as string) || undefined,
          payType: "USDT_ERC20",
          inputData: {},
        }),
      });
      const orderData = await orderRes.json();
      if (!orderData.success || !orderData.data?.id) {
        throw new Error(orderData.error || "创建订单失败");
      }
      targetOrderId = orderData.data.id;
    }

    confirmedOrderId.value = targetOrderId;

    // 3. 执行链上交互 (Approve -> Deposit -> Consume)
    const payResult = await executePayAndConsume({
      userAddress: userAddress as Address,
      amountUsdt: parseFloat(amount.value),
      referrerAddress: referrerWalletAddress as Address,
      onProgress: (stepMsg) => {
        chainProgressText.value = stepMsg;
      },
    });

    // 4. 同步后端状态
    if (payType.value === "vip") {
      chainProgressText.value = "正在开通 VIP 会员权益...";
      const vipRes = await fetch("/api/vip/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userStore.user?.id || userAddress,
          planKey: planKey.value,
          txHash: payResult.consumeTxHash,
        }),
      });
      const vipJson = await vipRes.json();
      if (!vipJson.success) {
        throw new Error(vipJson.error || "VIP 开通同步失败");
      }
    } else {
      chainProgressText.value = "正在同步后端订单并解锁完整报告...";
      const payApiRes = await fetch(`/api/orders/${targetOrderId}/pay`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userStore.user?.id || userAddress,
          payType: "USDT_ERC20",
          txHash: payResult.consumeTxHash,
        }),
      });
      const payApiJson = await payApiRes.json();

      if (!payApiJson.success) {
        throw new Error(payApiJson.error || "订单结算同步失败");
      }
    }

    await userStore.refreshProfile();
    showSuccessCelebration.value = true;
  } catch (err: any) {
    console.error("支付异常:", err);
    uiStore.showToast(err.message || "支付失败，请检查钱包余额或重试");
  } finally {
    paying.value = false;
    confirmingOnChain.value = false;
  }
}

function copyCode() {
  const code = userStore.user?.referral_code || "TJ88888";
  navigator.clipboard.writeText(code);
  uiStore.showToast(`推荐码【${code}】已复制！`);
}

function proceedToReport() {
  showSuccessCelebration.value = false;
  if (payType.value === "vip") {
    router.push("/vip");
  } else {
    router.push({
      path: `/feature/${category.value}/report`,
      query: confirmedOrderId.value ? { orderId: confirmedOrderId.value } : undefined,
    });
  }
}
</script>
