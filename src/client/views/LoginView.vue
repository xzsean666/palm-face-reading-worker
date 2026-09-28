<template>
  <div class="flex-1 flex flex-col justify-between px-6 pt-16 pb-8 select-none relative overflow-hidden min-h-[calc(100vh-56px)]">
    <!-- 背景流光装饰 -->
    <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-tj-primary/10 blur-3xl pointer-events-none"></div>
    <div class="absolute bottom-10 right-0 w-60 h-60 rounded-full bg-tj-purple/10 blur-3xl pointer-events-none"></div>

    <!-- 顶部品牌视觉 -->
    <div class="text-center relative z-10">
      <!-- 居中徽章 Logo -->
      <div class="relative w-20 h-20 mx-auto mb-4 flex items-center justify-center">
        <div class="absolute inset-0 rounded-full border-2 border-tj-primary/30 animate-pulse"></div>
        <div class="w-16 h-16 rounded-full bg-[#141828] border-2 border-tj-primary flex items-center justify-center text-tj-primary text-3xl font-display font-bold shadow-gold-glow">
          天
        </div>
      </div>

      <!-- 品牌名称与标语 -->
      <h1 class="text-xl font-bold font-display text-tj-primary tracking-widest mb-1.5">
        天机 AI预测大师
      </h1>
      <p class="text-xs text-tj-text-secondary tracking-wider mb-4">
        东方古法玄学 · 洞悉因果天机
      </p>

      <!-- 福利标识行 -->
      <div class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-tj-primary/10 border border-tj-primary/30 text-xs text-tj-primary font-medium shadow-sm">
        <span>✨</span> 首次连接即赠 2 次免费推演额度
      </div>
    </div>

    <!-- 核心表单与操作区 -->
    <div class="my-8 space-y-4 relative z-10">
      <!-- 邀请码输入卡片 (选填 / 可选) -->
      <div class="bg-tj-bg-card border border-tj-primary/25 rounded-2xl p-4 shadow-sm">
        <div class="flex items-center justify-between mb-2">
          <label class="text-xs font-semibold text-tj-text-primary flex items-center gap-1.5">
            <span>🎟️</span> 专属邀请码
          </label>
          <span class="text-[11px] px-2 py-0.5 rounded-full bg-tj-primary/15 border border-tj-primary/30 text-tj-primary font-medium">
            选填 (可选)
          </span>
        </div>

        <div class="relative">
          <input
            v-model="inviteCode"
            type="text"
            maxlength="10"
            placeholder="请输入邀请码 (无邀请码可留空)"
            class="w-full h-11 px-3.5 pr-8 rounded-xl bg-[#0B0E1A] border border-white/10 focus:border-tj-primary text-sm font-mono uppercase tracking-wider text-tj-primary placeholder:text-tj-text-faint outline-none transition-colors"
          />
          <button
            v-if="inviteCode"
            @click="inviteCode = ''"
            type="button"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center text-tj-text-faint hover:text-white"
            aria-label="清空"
          >
            ✕
          </button>
        </div>

        <div v-if="inviteCodeAutoFilled" class="text-[11px] text-tj-cyan mt-1.5 flex items-center gap-1">
          <span>✓</span> 已自动应用好友推荐码
        </div>
        <p v-else class="text-[11px] text-tj-text-faint mt-1.5 leading-relaxed">
          首次登录可输入好友邀请码建立结缘关系；若无推荐人直接点击连接即可。
        </p>
      </div>

      <!-- 主按钮：连接钱包登录 -->
      <button
        @click="connectWallet"
        :disabled="loading"
        class="w-full h-12 rounded-full bg-tj-grad-gold text-[#1A1405] font-bold text-base shadow-gold-glow hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
        :class="{ 'opacity-80 cursor-not-allowed': loading }"
      >
        <span v-if="loading" class="w-5 h-5 rounded-full border-2 border-[#1A1405] border-t-transparent animate-spin"></span>
        <span v-if="loading">正在连接钱包…</span>
        <span v-else-if="hasNetworkError">重试连接钱包</span>
        <span v-else class="flex items-center gap-2">
          <span>🦊</span> 连接 Web3 钱包登录
        </span>
      </button>

      <!-- 次按钮：游客模式进入 -->
      <button
        @click="enterAsGuest"
        :disabled="loading"
        class="w-full h-11 rounded-full bg-white/5 border border-tj-primary/40 text-tj-primary font-medium text-sm hover:bg-tj-primary/10 active:scale-98 transition-all flex items-center justify-center gap-1.5"
      >
        <span>👤</span> 暂无钱包，以游客模式体验
      </button>

      <!-- 钱包生态兼容提示 -->
      <div class="text-center pt-1">
        <span class="text-[11px] text-tj-text-faint">
          支持 MetaMask · OKX · TokenPocket · Phantom 等 EVM 钱包
        </span>
      </div>
    </div>

    <!-- 底部协议区 -->
    <div class="pt-4 space-y-2 text-center text-xs text-tj-text-faint relative z-10">
      <div>
        登录即代表同意
        <router-link to="/about" class="text-tj-primary hover:underline">《用户协议》</router-link>
        与
        <router-link to="/about" class="text-tj-primary hover:underline">《隐私政策》</router-link>
      </div>

      <div>
        <router-link to="/about" class="text-xs text-tj-text-secondary hover:text-tj-primary transition-colors">
          关于天机与免责声明
        </router-link>
      </div>
    </div>

    <!-- 未检测到钱包引导弹层 -->
    <div v-if="showNoWalletModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B0E1A]/80 backdrop-blur-sm select-none">
      <div class="w-full max-w-[340px] bg-[#141828] border border-tj-primary/30 rounded-2xl p-5 shadow-2xl animate-fade-in text-center">
        <div class="w-12 h-12 mx-auto mb-3 rounded-full bg-tj-warning/15 border border-tj-warning/30 flex items-center justify-center text-2xl">
          🦊
        </div>
        <h3 class="text-base font-semibold text-tj-text-primary mb-1.5">未检测到 Web3 钱包</h3>
        <p class="text-xs text-tj-text-secondary mb-4 leading-relaxed text-left">
          当前环境未检测到浏览器 Web3 钱包扩展。若您在微信或普通手机浏览器中，建议复制链接并在 <span class="text-tj-primary">OKX</span>、<span class="text-tj-primary">MetaMask</span> 或 <span class="text-tj-primary">TokenPocket</span> App 的内置浏览器中打开。
        </p>

        <div class="space-y-2.5">
          <button
            @click="continueWithSimulatedWallet"
            class="w-full h-10 rounded-xl bg-tj-grad-gold text-[#1A1405] font-bold text-xs shadow-gold-glow active:scale-98 transition-all flex items-center justify-center"
          >
            使用模拟体验钱包进入
          </button>
          <button
            @click="enterAsGuestFromModal"
            class="w-full h-10 rounded-xl bg-white/5 border border-tj-primary/40 text-tj-primary font-medium text-xs hover:bg-tj-primary/10 active:scale-98 transition-all flex items-center justify-center"
          >
            以游客身份继续
          </button>
          <button
            @click="showNoWalletModal = false"
            class="w-full h-9 text-xs text-tj-text-faint hover:text-white transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { useUIStore } from "../stores/ui";
import { ensureTargetNetwork } from "../utils/web3";

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();
const uiStore = useUIStore();

const loading = ref(false);
const hasNetworkError = ref(false);
const inviteCode = ref("");
const inviteCodeAutoFilled = ref(false);
const showNoWalletModal = ref(false);

onMounted(() => {
  // 检查 URL 参数或本地暂存的邀请码
  const queryCode = (route.query.ref || route.query.invite || route.query.code) as string | undefined;
  const cachedCode = localStorage.getItem("tj_pending_referrer_code");

  if (queryCode && queryCode.trim()) {
    inviteCode.value = queryCode.trim().toUpperCase();
    inviteCodeAutoFilled.value = true;
  } else if (cachedCode && cachedCode.trim()) {
    inviteCode.value = cachedCode.trim().toUpperCase();
    inviteCodeAutoFilled.value = true;
  }
});

function getCleanReferrerCode(): string | undefined {
  const code = inviteCode.value.trim().toUpperCase();
  return code || undefined;
}

function handleLoginSuccess() {
  uiStore.showToast("登录成功！已获赠 2 次免费推演额度");
  const target = (route.query.redirect as string) || "/home";
  router.replace(target);
}

async function connectWallet() {
  loading.value = true;
  hasNetworkError.value = false;

  try {
    const hasEthereum = typeof window !== "undefined" && typeof (window as any).ethereum !== "undefined";

    if (!hasEthereum) {
      loading.value = false;
      showNoWalletModal.value = true;
      return;
    }

    // 1. 唤起钱包授权账户
    let accounts: string[] = [];
    try {
      accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
    } catch (err: any) {
      if (err.code === 4001) {
        uiStore.showToast("已取消钱包授权");
        return;
      }
      throw err;
    }

    if (!accounts || accounts.length === 0) {
      uiStore.showToast("未检测到有效钱包账户");
      return;
    }

    const walletAddress = accounts[0];

    // 2. 尝试引导切换至支持的链网络 (容错降级)
    try {
      await ensureTargetNetwork();
    } catch (netErr) {
      console.warn("网络切换提醒:", netErr);
    }

    // 3. 提交登录并绑定可选推荐码
    await userStore.loginWithWallet(walletAddress, getCleanReferrerCode());
    handleLoginSuccess();
  } catch (err: any) {
    console.error("钱包登录失败:", err);
    hasNetworkError.value = true;
    uiStore.showToast(err.message || "钱包连接失败，请重试");
  } finally {
    loading.value = false;
  }
}

async function continueWithSimulatedWallet() {
  showNoWalletModal.value = false;
  loading.value = true;
  try {
    const randomHex = Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
    const mockAddress = `0x${randomHex}`;
    await userStore.loginWithWallet(mockAddress, getCleanReferrerCode());
    handleLoginSuccess();
  } catch (err: any) {
    uiStore.showToast(err.message || "登录异常，请重试");
  } finally {
    loading.value = false;
  }
}

async function enterAsGuest() {
  loading.value = true;
  try {
    await userStore.loginAsGuest(getCleanReferrerCode());
    uiStore.showToast("游客身份就绪，可立即开始测算");
    const target = (route.query.redirect as string) || "/home";
    router.replace(target);
  } catch {
    uiStore.showToast("网络异常，请重试");
  } finally {
    loading.value = false;
  }
}

function enterAsGuestFromModal() {
  showNoWalletModal.value = false;
  enterAsGuest();
}
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
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
