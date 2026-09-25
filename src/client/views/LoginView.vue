<template>
  <div class="flex-1 flex flex-col justify-between px-6 pt-24 pb-8 select-none">
    <div class="text-center">
      <!-- 距顶 96px: Logo 64px 居中 -->
      <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-tj-primary/10 border-2 border-tj-primary/50 flex items-center justify-center text-tj-primary text-3xl font-display font-bold shadow-gold-glow">
        天
      </div>

      <!-- 欢迎标语 -->
      <h2 class="text-lg font-semibold text-tj-text-primary mb-2">
        欢迎来到天机 AI预测大师
      </h2>

      <!-- 福利行 -->
      <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-tj-primary/10 border border-tj-primary/30 text-xs text-tj-primary font-medium">
        <span>✨</span> 登录即送 2 次免费测算机会
      </div>
    </div>

    <!-- 按钮区 (距上 48px) -->
    <div class="mt-12 space-y-4">
      <!-- 主按钮：连接钱包登录 -->
      <button
        @click="connectWallet"
        :disabled="loading"
        class="w-full h-12 rounded-full bg-tj-grad-gold text-[#1A1405] font-semibold text-base shadow-gold-glow hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-2"
        :class="{ 'opacity-80 cursor-not-allowed': loading }"
      >
        <span v-if="loading" class="w-5 h-5 rounded-full border-2 border-[#1A1405] border-t-transparent animate-spin"></span>
        <span v-if="loading">连接中…</span>
        <span v-else-if="hasNetworkError">重试连接钱包</span>
        <span v-else class="flex items-center gap-2">
          <span>🦊</span> 连接钱包登录
        </span>
      </button>

      <!-- 次按钮：游客模式进入 -->
      <button
        @click="enterAsGuest"
        :disabled="loading"
        class="w-full h-12 rounded-full bg-white/5 border border-tj-primary/40 text-tj-primary font-medium text-base hover:bg-tj-primary/10 active:scale-98 transition-all flex items-center justify-center"
      >
        游客模式进入
      </button>
    </div>

    <!-- 底部协议区 (距底 32px) -->
    <div class="pt-8 space-y-2 text-center text-xs text-tj-text-faint">
      <div>
        登录即代表同意
        <router-link to="/about" class="text-tj-primary hover:underline">《用户协议》</router-link>
        与
        <router-link to="/about" class="text-tj-primary hover:underline">《隐私政策》</router-link>
      </div>

      <div>
        <router-link to="/about" class="text-xs text-tj-text-secondary hover:text-tj-primary transition-colors">
          协议与帮助
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { useUIStore } from "../stores/ui";

const router = useRouter();
const userStore = useUserStore();
const uiStore = useUIStore();

const loading = ref(false);
const hasNetworkError = ref(false);

async function connectWallet() {
  loading.value = true;
  hasNetworkError.value = false;

  try {
    let address = "0x" + Math.random().toString(16).slice(2, 42).padStart(40, "0");
    if (typeof (window as any).ethereum !== "undefined") {
      try {
        const accounts = await (window as any).ethereum.request({ method: "eth_requestAccounts" });
        if (accounts && accounts[0]) {
          address = accounts[0];
        }
      } catch (err: any) {
        if (err.code === 4001) {
          uiStore.showToast("已取消登录");
          return;
        }
      }
    }

    await userStore.loginWithWallet(address);
    uiStore.showToast("登录成功！已赠送 2 次免费测算额度");
    router.replace("/home");
  } catch (err: any) {
    hasNetworkError.value = true;
    uiStore.showToast("网络异常，请重试");
  } finally {
    loading.value = false;
  }
}

async function enterAsGuest() {
  loading.value = true;
  try {
    await userStore.loginAsGuest();
    uiStore.showToast("游客身份就绪，可立即开始测算");
    router.replace("/home");
  } catch {
    uiStore.showToast("网络异常，请重试");
  } finally {
    loading.value = false;
  }
}
</script>
