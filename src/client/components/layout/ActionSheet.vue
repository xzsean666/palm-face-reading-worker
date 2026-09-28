<template>
  <div>
    <!-- 主动作面板 (底部弹起，圆角 20px 20px 0 0) -->
    <div v-if="uiStore.actionSheetOpen" class="fixed inset-0 z-50 flex items-end justify-center select-none">
      <!-- 遮罩层 -->
      <div
        class="fixed inset-0 bg-[#0B0E1A]/75 backdrop-blur-sm transition-opacity"
        @click="uiStore.closeActionSheet"
      ></div>

      <!-- 弹层主体 -->
      <div class="relative w-full max-w-[430px] bg-[#141828] border-t border-tj-primary/20 rounded-t-[20px] p-5 shadow-2xl z-10 max-h-[85vh] overflow-y-auto animate-slide-up">
        <!-- 弹层顶部栏 -->
        <div class="flex items-center justify-between pb-3 border-b border-white/10">
          <h3 class="text-[15px] font-semibold text-tj-text-primary">快捷功能</h3>
          <button
            @click="uiStore.closeActionSheet"
            class="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-tj-text-secondary hover:text-white"
          >
            ✕
          </button>
        </div>

        <!-- 分组 1: 我的 -->
        <div class="mt-4">
          <div class="text-xs text-tj-text-faint tracking-wider uppercase mb-1">我的</div>
          <div class="divide-y divide-white/5">
            <button
              @click="handleAuthNavigate('/me/records')"
              class="w-full h-[52px] flex items-center justify-between text-left text-sm text-tj-text-primary hover:text-tj-primary"
            >
              <span class="flex items-center gap-2.5">
                <span class="text-xl">📜</span> 测算记录
              </span>
              <span class="text-xs text-tj-text-secondary">›</span>
            </button>
            <button
              @click="handleAuthNavigate('/me')"
              class="w-full h-[52px] flex items-center justify-between text-left text-sm text-tj-text-primary hover:text-tj-primary"
            >
              <span class="flex items-center gap-2.5">
                <span class="text-xl">📑</span> 我的订单
              </span>
              <span class="text-xs text-tj-text-secondary">›</span>
            </button>
            <button
              @click="handleAuthNavigate('/promote/earnings')"
              class="w-full h-[52px] flex items-center justify-between text-left text-sm text-tj-text-primary hover:text-tj-primary"
            >
              <span class="flex items-center gap-2.5">
                <span class="text-xl">💰</span> 收益与提现
              </span>
              <span class="text-xs text-tj-cyan">明细 ›</span>
            </button>
            <button
              @click="showNotificationToast"
              class="w-full h-[52px] flex items-center justify-between text-left text-sm text-tj-text-primary hover:text-tj-primary"
            >
              <span class="flex items-center gap-2.5">
                <span class="text-xl">🔔</span> 消息通知
              </span>
              <span class="text-xs text-tj-text-secondary">暂无未读 ›</span>
            </button>
          </div>
        </div>

        <!-- 分组 2: 分享 -->
        <div class="mt-4">
          <div class="text-xs text-tj-text-faint tracking-wider uppercase mb-1">分享</div>
          <div class="divide-y divide-white/5">
            <button
              @click="handleShareAction('poster')"
              class="w-full h-[52px] flex items-center justify-between text-left text-sm"
              :class="isPromoteActive ? 'text-tj-text-primary hover:text-tj-primary' : 'text-tj-text-faint opacity-50 cursor-not-allowed'"
            >
              <span class="flex items-center gap-2.5">
                <span class="text-xl">🎨</span> 生成邀请海报
              </span>
              <span class="text-xs text-tj-text-secondary">›</span>
            </button>
            <button
              @click="handleShareAction('copy')"
              class="w-full h-[52px] flex items-center justify-between text-left text-sm"
              :class="isPromoteActive ? 'text-tj-text-primary hover:text-tj-primary' : 'text-tj-text-faint opacity-50 cursor-not-allowed'"
            >
              <span class="flex items-center gap-2.5">
                <span class="text-xl">📋</span> 复制推荐码
              </span>
              <span v-if="isPromoteActive" class="text-xs font-mono text-tj-primary-light bg-tj-primary/10 px-2 py-0.5 rounded">
                {{ userStore.user?.referral_code || "复制" }}
              </span>
              <span v-else class="text-xs text-tj-text-faint">未激活</span>
            </button>
            <button
              @click="handleShareRecentReport"
              class="w-full h-[52px] flex items-center justify-between text-left text-sm text-tj-text-primary hover:text-tj-primary"
            >
              <span class="flex items-center gap-2.5">
                <span class="text-xl">↗</span> 分享最近报告
              </span>
              <span class="text-xs text-tj-text-secondary">›</span>
            </button>
          </div>
        </div>

        <!-- 分组 3: 其他 -->
        <div class="mt-4 pb-2">
          <div class="text-xs text-tj-text-faint tracking-wider uppercase mb-1">其他</div>
          <div class="divide-y divide-white/5">
            <!-- 测试币水龙头 (测试网专属) -->
            <button
              v-if="isTestnet()"
              @click="openFaucet"
              class="w-full h-[52px] flex items-center justify-between text-left text-sm text-tj-cyan hover:text-white"
            >
              <span class="flex items-center gap-2.5">
                <span class="text-xl">🧪</span> 测试网水龙头
              </span>
              <span class="text-xs px-2 py-0.5 rounded-full bg-tj-cyan/20 border border-tj-cyan/40 text-tj-cyan">
                免费领 USDT ›
              </span>
            </button>
            <!-- 已绑定上级时隐藏 -->
            <button
              v-if="!userStore.user?.referrer_id"
              @click="openBindModal"
              class="w-full h-[52px] flex items-center justify-between text-left text-sm text-tj-text-primary hover:text-tj-primary"
            >
              <span class="flex items-center gap-2.5">
                <span class="text-xl">🔗</span> 绑定邀请码
              </span>
              <span class="text-xs text-tj-primary">去绑定 ›</span>
            </button>
            <button
              @click="contactService"
              class="w-full h-[52px] flex items-center justify-between text-left text-sm text-tj-text-primary hover:text-tj-primary"
            >
              <span class="flex items-center gap-2.5">
                <span class="text-xl">💬</span> 客服中心
              </span>
              <span class="text-xs text-tj-text-secondary">咨询 ›</span>
            </button>
            <button
              @click="navigate('/about')"
              class="w-full h-[52px] flex items-center justify-between text-left text-sm text-tj-text-primary hover:text-tj-primary"
            >
              <span class="flex items-center gap-2.5">
                <span class="text-xl">⚙️</span> 设置
              </span>
              <span class="text-xs text-tj-text-secondary">关于与协议 ›</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 绑定邀请人弹层 (替代原生 prompt) -->
    <div v-if="bindModalOpen" class="fixed inset-0 z-60 flex items-center justify-center p-4 select-none">
      <div class="fixed inset-0 bg-[#0B0E1A]/80 backdrop-blur-sm" @click="bindModalOpen = false"></div>
      <div class="relative w-full max-w-[340px] bg-[#141828] border border-tj-primary/30 rounded-2xl p-5 shadow-2xl z-10 animate-fade-in">
        <h3 class="text-base font-semibold text-tj-text-primary text-center mb-1">绑定邀请人</h3>
        <p class="text-xs text-tj-text-secondary text-center mb-4 leading-relaxed">
          输入 7 位邀请人专属推荐码 (如 TJ7X9K2)
        </p>
        <input
          v-model="referralInput"
          type="text"
          maxlength="10"
          placeholder="请输入邀请码"
          class="w-full h-11 px-3 rounded-xl bg-[#1B2138] border border-white/10 text-center font-mono text-sm text-tj-primary uppercase focus:border-tj-primary outline-none mb-4"
        />
        <div class="flex gap-2">
          <button
            @click="bindModalOpen = false"
            class="flex-1 h-10 rounded-xl border border-white/10 text-xs text-tj-text-secondary hover:bg-white/5 active:scale-98 transition-all"
          >
            取消
          </button>
          <button
            @click="submitBind"
            :disabled="binding"
            class="flex-1 h-10 rounded-xl bg-tj-grad-gold text-[#1A1405] font-bold text-xs shadow-gold-glow flex items-center justify-center active:scale-98 transition-all disabled:opacity-50"
          >
            <span v-if="binding">绑定中...</span>
            <span v-else>绑定邀请人</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useUIStore } from "../../stores/ui";
import { useUserStore } from "../../stores/user";
import { isTestnet } from "../../utils/web3";

const router = useRouter();
const uiStore = useUIStore();
const userStore = useUserStore();

const bindModalOpen = ref(false);
const referralInput = ref("");
const binding = ref(false);

function openFaucet() {
  uiStore.closeActionSheet();
  uiStore.openFaucetModal();
}

const isPromoteActive = computed(() => {
  return (
    (userStore.user?.total_earned ?? 0) > 0 ||
    (userStore.user?.is_vip ?? 0) === 1 ||
    Boolean(userStore.user?.earnings_balance && userStore.user.earnings_balance > 0)
  );
});

function navigate(path: string) {
  uiStore.closeActionSheet();
  router.push(path);
}

function handleAuthNavigate(path: string) {
  uiStore.closeActionSheet();
  if (!userStore.isLoggedIn) {
    uiStore.showToast("请先登录");
    router.push("/login");
    return;
  }
  router.push(path);
}

function showNotificationToast() {
  uiStore.closeActionSheet();
  uiStore.showToast("暂无未读消息通知");
}

function handleShareAction(type: "poster" | "copy") {
  if (!isPromoteActive.value) {
    uiStore.showToast("完成一次付费测算后可用");
    return;
  }
  uiStore.closeActionSheet();
  const code = userStore.user?.referral_code || "TJ88888";
  if (type === "copy") {
    navigator.clipboard.writeText(code);
    uiStore.showToast(`推荐码【${code}】已复制到剪贴板！`);
  } else {
    router.push(`/invite/${code}`);
  }
}

function handleShareRecentReport() {
  uiStore.closeActionSheet();
  if (!userStore.isLoggedIn) {
    uiStore.showToast("请先登录查看报告");
    router.push("/login");
    return;
  }
  router.push("/me/records");
}

function openBindModal() {
  uiStore.closeActionSheet();
  referralInput.value = "";
  bindModalOpen.value = true;
}

async function submitBind() {
  const code = referralInput.value.trim();
  if (!code) {
    uiStore.showToast("请输入邀请码");
    return;
  }

  binding.value = true;
  try {
    const res = await fetch("/api/user/bind-referrer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: userStore.user?.id || "guest",
        referrerCode: code,
      }),
    });
    const d = await res.json();
    if (d.success) {
      uiStore.showToast("绑定邀请人成功！");
      bindModalOpen.value = false;
      userStore.refreshProfile();
    } else {
      uiStore.showToast(d.message || d.error || "绑定失败，请检查邀请码");
    }
  } catch (err: any) {
    uiStore.showToast(err.message || "网络异常，请重试");
  } finally {
    binding.value = false;
  }
}

function contactService() {
  uiStore.closeActionSheet();
  uiStore.showToast("玄学顾问客服微信号: TianjiMaster_AI");
}
</script>

<style scoped>
@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
.animate-slide-up {
  animation: slideUp 0.25s ease-out forwards;
}

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
