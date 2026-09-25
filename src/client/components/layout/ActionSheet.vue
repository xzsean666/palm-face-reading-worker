<template>
  <div v-if="uiStore.actionSheetOpen" class="fixed inset-0 z-50 flex items-end justify-center select-none">
    <!-- 遮罩层 -->
    <div
      class="fixed inset-0 bg-[#0B0E1A]/75 backdrop-blur-sm transition-opacity"
      @click="uiStore.closeActionSheet"
    ></div>

    <!-- 弹层主体 (底部弹起，圆角 20px 20px 0 0) -->
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
        <div class="text-[11px] text-tj-text-faint tracking-wider uppercase mb-1">我的服务</div>
        <div class="divide-y divide-white/5">
          <button
            @click="navigate('/me/records')"
            class="w-full h-[50px] flex items-center justify-between text-left text-sm text-tj-text-primary hover:text-tj-primary"
          >
            <span class="flex items-center gap-2.5">
              <span class="text-base">📜</span> 测算历史记录
            </span>
            <span class="text-xs text-tj-text-secondary">查看全部 ›</span>
          </button>
          <button
            @click="navigate('/promote/earnings')"
            class="w-full h-[50px] flex items-center justify-between text-left text-sm text-tj-text-primary hover:text-tj-primary"
          >
            <span class="flex items-center gap-2.5">
              <span class="text-base">💰</span> 推广收益与提现
            </span>
            <span class="text-xs text-tj-cyan">15% 返佣 ›</span>
          </button>
          <button
            @click="navigate('/vip')"
            class="w-full h-[50px] flex items-center justify-between text-left text-sm text-tj-text-primary hover:text-tj-primary"
          >
            <span class="flex items-center gap-2.5">
              <span class="text-base">👑</span> 开通 / 续费 VIP
            </span>
            <span class="text-xs text-tj-primary">特权无限看 ›</span>
          </button>
        </div>
      </div>

      <!-- 分组 2: 分享与邀请 -->
      <div class="mt-4">
        <div class="text-[11px] text-tj-text-faint tracking-wider uppercase mb-1">裂变分享</div>
        <div class="divide-y divide-white/5">
          <button
            @click="copyReferralCode"
            class="w-full h-[50px] flex items-center justify-between text-left text-sm text-tj-text-primary hover:text-tj-primary"
          >
            <span class="flex items-center gap-2.5">
              <span class="text-base">📋</span> 复制专属推荐码
            </span>
            <span class="text-xs font-mono text-tj-primary-light bg-tj-primary/10 px-2 py-0.5 rounded">
              {{ userStore.user?.referral_code || "点击获取" }}
            </span>
          </button>
          <button
            @click="navigate(`/invite/${userStore.user?.referral_code || 'TJ88888'}`)"
            class="w-full h-[50px] flex items-center justify-between text-left text-sm text-tj-text-primary hover:text-tj-primary"
          >
            <span class="flex items-center gap-2.5">
              <span class="text-base">🎨</span> 生成邀请落地页海报
            </span>
            <span class="text-xs text-tj-text-secondary">直推 15% ›</span>
          </button>
        </div>
      </div>

      <!-- 分组 3: 其他 -->
      <div class="mt-4 pb-2">
        <div class="text-[11px] text-tj-text-faint tracking-wider uppercase mb-1">支持与帮助</div>
        <div class="divide-y divide-white/5">
          <button
            @click="showBindModal"
            class="w-full h-[50px] flex items-center justify-between text-left text-sm text-tj-text-primary hover:text-tj-primary"
          >
            <span class="flex items-center gap-2.5">
              <span class="text-base">🔗</span> 绑定上级邀请人
            </span>
            <span class="text-xs text-tj-text-secondary">{{ userStore.user?.referrer_id ? '已绑定' : '未绑定 ›' }}</span>
          </button>
          <button
            @click="contactService"
            class="w-full h-[50px] flex items-center justify-between text-left text-sm text-tj-text-primary hover:text-tj-primary"
          >
            <span class="flex items-center gap-2.5">
              <span class="text-base">💬</span> 联系在线玄学顾问
            </span>
            <span class="text-xs text-tj-text-secondary">咨询 ›</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";
import { useUIStore } from "../../stores/ui";
import { useUserStore } from "../../stores/user";

const router = useRouter();
const uiStore = useUIStore();
const userStore = useUserStore();

function navigate(path: string) {
  uiStore.closeActionSheet();
  router.push(path);
}

function copyReferralCode() {
  const code = userStore.user?.referral_code || "TJ88888";
  navigator.clipboard.writeText(code);
  uiStore.showToast(`推荐码【${code}】已复制到剪贴板！`);
  uiStore.closeActionSheet();
}

function showBindModal() {
  uiStore.closeActionSheet();
  const code = prompt("请输入 7 位邀请人专属推荐码 (如 TJ7X9K2):");
  if (code && code.trim()) {
    fetch("/api/user/bind-referrer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userStore.user?.id || "guest", referrerCode: code.trim() }),
    })
      .then((res) => res.json())
      .then((d) => {
        uiStore.showToast(d.message || (d.success ? "绑定成功！" : "绑定失败"));
        userStore.refreshProfile();
      });
  }
}

function contactService() {
  uiStore.closeActionSheet();
  uiStore.showToast("微信客服: TianjiMaster_AI (工作日 9:00-21:00)");
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
</style>
