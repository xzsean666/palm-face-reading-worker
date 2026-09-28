<template>
  <div v-if="uiStore.faucetModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
    <!-- 背景遮罩 -->
    <div
      class="fixed inset-0 bg-[#0B0E1A]/80 backdrop-blur-sm transition-opacity"
      @click="uiStore.closeFaucetModal"
    ></div>

    <!-- 弹窗主体 -->
    <div class="relative w-full max-w-[390px] bg-[#141828] border border-tj-primary/40 rounded-3xl p-5 shadow-2xl z-10 animate-fade-in max-h-[90vh] overflow-y-auto">
      <!-- 头部 -->
      <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-tj-primary/10 border border-tj-primary/30 flex items-center justify-center text-lg">
            🧪
          </div>
          <div>
            <h3 class="text-base font-bold text-tj-text-primary">测试网 USDT 水龙头</h3>
            <p class="text-[11px] text-tj-text-secondary">获取测试代币 · 体验测算与分佣</p>
          </div>
        </div>
        <button
          @click="uiStore.closeFaucetModal"
          class="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-tj-text-secondary hover:text-white"
        >
          ✕
        </button>
      </div>

      <!-- 网络与合约环境卡片 -->
      <div class="bg-white/5 border border-white/10 rounded-2xl p-3.5 mb-3.5 space-y-2 text-xs">
        <div class="flex justify-between items-center">
          <span class="text-tj-text-secondary">测试网络</span>
          <span class="font-semibold text-tj-primary px-2 py-0.5 rounded-full bg-tj-primary/10 border border-tj-primary/30">
            {{ activeChain.name }} (ID: {{ config.chainId }})
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-tj-text-secondary">USDT 合约</span>
          <div class="flex items-center gap-1 font-mono text-tj-cyan">
            <span>{{ shortenAddress(config.paymentTokenAddress) }}</span>
            <button
              @click="copy(config.paymentTokenAddress, 'USDT 合约地址')"
              class="hover:text-white text-xs"
              title="复制合约地址"
            >
              📋
            </button>
          </div>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-tj-text-secondary">分佣服务合约</span>
          <div class="flex items-center gap-1 font-mono text-tj-text-secondary">
            <span>{{ shortenAddress(config.proxyAddress) }}</span>
            <button
              @click="copy(config.proxyAddress, '服务合约代理地址')"
              class="hover:text-white text-xs"
              title="复制合约地址"
            >
              📋
            </button>
          </div>
        </div>
      </div>

      <!-- 钱包状态卡片 -->
      <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-3.5 mb-3.5 space-y-2 text-xs">
        <div class="flex justify-between items-center">
          <span class="text-tj-text-secondary">连接钱包</span>
          <span v-if="walletAddress" class="font-mono text-tj-text-primary">
            {{ shortenAddress(walletAddress) }}
          </span>
          <button
            v-else
            @click="connectWallet"
            class="px-2.5 py-1 rounded-lg bg-tj-primary/20 text-tj-primary font-semibold hover:bg-tj-primary/30"
          >
            连接钱包
          </button>
        </div>

        <template v-if="walletAddress">
          <div class="flex justify-between items-center">
            <span class="text-tj-text-secondary">当前 USDT 余额</span>
            <span class="font-bold text-sm font-num text-tj-primary">
              {{ loadingBalance ? '...' : usdtBalance.toFixed(2) }} <span class="text-xs font-sans font-normal">USDT</span>
            </span>
          </div>

          <div class="flex justify-between items-center">
            <span class="text-tj-text-secondary">网络 Gas 费余额</span>
            <span
              class="font-mono text-xs"
              :class="nativeGasBalance === 0 ? 'text-tj-danger font-semibold' : 'text-tj-text-primary'"
            >
              {{ loadingBalance ? '...' : nativeGasBalance.toFixed(4) }} {{ nativeSymbol }}
            </span>
          </div>
        </template>
      </div>

      <!-- 零 Gas 友好预警提示 -->
      <div
        v-if="walletAddress && nativeGasBalance === 0"
        class="bg-tj-danger/10 border border-tj-danger/30 rounded-2xl p-3 mb-3.5 text-xs text-[#FF8E8E] space-y-1.5"
      >
        <div class="flex items-center gap-1.5 font-bold">
          <span>⚠️</span> 缺少原生测试币 (Gas 费)
        </div>
        <p class="text-[11px] leading-relaxed text-[#FFA5A5]">
          在以太坊/EVM测试网领取代币或发起交易，需要极微量测试 Gas 币支付网络矿工费。
        </p>
        <div class="pt-1 flex flex-wrap gap-2 text-[11px]">
          <a
            v-for="link in publicGasFaucets"
            :key="link.name"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="px-2 py-0.5 rounded bg-tj-danger/20 hover:bg-tj-danger/30 text-white underline flex items-center gap-1"
          >
            {{ link.name }} ↗
          </a>
        </div>
      </div>

      <!-- 领水数量选择 -->
      <div class="mb-4">
        <label class="block text-xs text-tj-text-secondary mb-1.5">选择领取金额</label>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="amt in [100, 500, 1000]"
            :key="amt"
            @click="selectedAmount = amt"
            class="h-10 rounded-xl border text-xs font-bold font-num transition-all flex items-center justify-center"
            :class="selectedAmount === amt ? 'bg-tj-primary/20 border-tj-primary text-tj-primary shadow-gold-glow' : 'bg-white/5 border-white/10 text-tj-text-secondary hover:border-white/20'"
          >
            {{ amt }} USDT
          </button>
        </div>
      </div>

      <!-- 领水操作主按钮 -->
      <div class="space-y-2 mb-4">
        <button
          @click="handleMint"
          :disabled="minting || !walletAddress"
          class="w-full h-11 rounded-full font-bold text-xs bg-tj-grad-gold text-[#1A1405] shadow-gold-glow flex items-center justify-center gap-2 hover:brightness-110 active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <span v-if="minting" class="w-4 h-4 rounded-full border-2 border-[#1A1405] border-t-transparent animate-spin"></span>
          <span v-if="minting">{{ mintStatusText }}</span>
          <span v-else-if="!walletAddress">请先连接钱包</span>
          <span v-else>一键领取 {{ selectedAmount }} USDT 测试币</span>
        </button>

        <!-- 导入代币到 MetaMask -->
        <button
          @click="handleAddToMetaMask"
          class="w-full h-10 rounded-full border border-tj-primary/40 bg-tj-primary/10 text-tj-primary text-xs font-semibold flex items-center justify-center gap-1.5 hover:bg-tj-primary/20 active:scale-98 transition-colors"
        >
          <span>🦊</span> 将 USDT 添加至钱包 (MetaMask)
        </button>
      </div>

      <!-- 最新领取凭证信息 -->
      <div v-if="latestTxHash" class="p-2.5 rounded-xl bg-tj-cyan/10 border border-tj-cyan/30 text-[11px] text-tj-cyan mb-3 break-all">
        <div class="font-bold mb-0.5">✓ 铸造成功交易凭证:</div>
        <div class="font-mono text-[10px] text-white/80">{{ latestTxHash }}</div>
      </div>

      <!-- 底部说明 -->
      <div class="text-[11px] text-tj-text-faint text-center leading-relaxed">
        💡 提示：测试代币由 MockERC20 合约无成本铸造，仅供当前开发与测试网环境体验，不可用于真实流通。
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import type { Address } from "viem";
import { useUIStore } from "../../stores/ui";
import { useUserStore } from "../../stores/user";
import {
  config,
  activeChain,
  getUSDTBalance,
  getNativeBalance,
  mintTestTokens,
  addTokenToWallet,
  ensureTargetNetwork,
} from "../../utils/web3";

const uiStore = useUIStore();
const userStore = useUserStore();

const walletAddress = ref<Address | null>(null);
const usdtBalance = ref(0);
const nativeGasBalance = ref(0);
const loadingBalance = ref(false);
const selectedAmount = ref(1000);
const minting = ref(false);
const mintStatusText = ref("铸造中...");
const latestTxHash = ref("");

const nativeSymbol = computed(() => {
  return activeChain.nativeCurrency?.symbol || "ETH";
});

const publicGasFaucets = computed(() => {
  if (config.network === "bscTestnet" || config.chainId === 97) {
    return [
      { name: "BNB 官方水龙头", url: "https://www.bnbchain.org/en/testnet-faucet" },
      { name: "QuickNode Faucet", url: "https://faucet.quicknode.com/binance-smart-chain/bnb-testnet" },
    ];
  }
  if (config.network === "sepolia" || config.chainId === 11155111) {
    return [
      { name: "Google Cloud Faucet", url: "https://cloud.google.com/application/web3/faucet/ethereum/sepolia" },
      { name: "Sepolia PoW Faucet", url: "https://sepolia-faucet.pk910.de" },
      { name: "Infura Faucet", url: "https://www.infura.io/faucet/sepolia" },
    ];
  }
  if (config.network === "arbitrumSepolia" || config.chainId === 421614) {
    return [
      { name: "Arbitrum Faucet", url: "https://faucet.quicknode.com/arbitrum/sepolia" },
    ];
  }
  return [
    { name: "Sepolia Faucet", url: "https://cloud.google.com/application/web3/faucet/ethereum/sepolia" },
  ];
});

function shortenAddress(addr?: string): string {
  if (!addr) return "--";
  if (addr.length < 10) return addr;
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

async function copy(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    uiStore.showToast(`${label}已复制！`);
  } catch {
    uiStore.showToast("复制失败");
  }
}

async function connectWallet() {
  if (typeof window === "undefined" || !(window as any).ethereum) {
    uiStore.showToast("请先安装 MetaMask / Rabby 等 Web3 钱包插件");
    return;
  }
  try {
    const accounts = await (window as any).ethereum.request({
      method: "eth_requestAccounts",
    });
    if (accounts && accounts[0]) {
      walletAddress.value = accounts[0] as Address;
      await userStore.loginWithWallet(accounts[0]);
      await refreshBalances();
    }
  } catch (err: any) {
    uiStore.showToast(err.message || "连接钱包失败");
  }
}

async function refreshBalances() {
  if (!walletAddress.value) return;
  loadingBalance.value = true;
  try {
    const [usdt, gas] = await Promise.all([
      getUSDTBalance(walletAddress.value),
      getNativeBalance(walletAddress.value),
    ]);
    usdtBalance.value = usdt;
    nativeGasBalance.value = gas;
  } catch (err) {
    console.error("查询余额失败:", err);
  } finally {
    loadingBalance.value = false;
  }
}

async function handleMint() {
  if (!walletAddress.value) {
    await connectWallet();
    if (!walletAddress.value) return;
  }

  minting.value = true;
  mintStatusText.value = "请在钱包确认交易...";
  try {
    await ensureTargetNetwork();
    mintStatusText.value = "向区块链节点广播中...";
    const hash = await mintTestTokens(walletAddress.value, selectedAmount.value);
    latestTxHash.value = hash;
    uiStore.showToast(`成功领取 ${selectedAmount.value} USDT 测试币！`);
    await refreshBalances();
    await userStore.refreshProfile();
  } catch (err: any) {
    console.error("领水失败:", err);
    uiStore.showToast(err.message || "领取失败，请检查钱包 Gas 余额或重试");
  } finally {
    minting.value = false;
  }
}

async function handleAddToMetaMask() {
  const success = await addTokenToWallet();
  if (success) {
    uiStore.showToast("已成功添加 USDT 代币至钱包！");
  } else {
    uiStore.showToast("未能添加到钱包或已取消");
  }
}

watch(
  () => uiStore.faucetModalOpen,
  async (isOpen) => {
    if (isOpen) {
      if (userStore.user?.wallet_address && userStore.user.wallet_address.startsWith("0x")) {
        walletAddress.value = userStore.user.wallet_address as Address;
      } else if (typeof window !== "undefined" && (window as any).ethereum?.selectedAddress) {
        walletAddress.value = (window as any).ethereum.selectedAddress as Address;
      }
      if (walletAddress.value) {
        await refreshBalances();
      }
    }
  }
);

onMounted(() => {
  if (userStore.user?.wallet_address && userStore.user.wallet_address.startsWith("0x")) {
    walletAddress.value = userStore.user.wallet_address as Address;
  }
});
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
.animate-fade-in {
  animation: fadeIn 0.2s ease-out forwards;
}
</style>
