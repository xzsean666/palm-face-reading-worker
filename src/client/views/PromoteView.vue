<template>
  <div class="flex-1 pb-24 px-4 pt-3 select-none">
    <!-- 【未激活态】 -->
    <template v-if="!isPromoteActive">
      <div class="text-center py-8">
        <div class="text-[64px] text-tj-primary/50 mb-3 leading-none">
          🔒
        </div>
        <h2 class="text-lg font-semibold text-tj-text-primary mb-1">
          推广资格未解锁
        </h2>
        <p class="text-xs text-tj-text-secondary max-w-xs mx-auto">
          完成一次付费测算，即可获得专属推荐码并激活合伙人权益
        </p>
      </div>

      <!-- 奖励规则卡 (金色 8% 底) -->
      <div class="bg-tj-primary/8 border border-tj-primary/30 rounded-2xl p-4 mb-6 space-y-3">
        <h3 class="text-[15px] font-semibold text-tj-primary">奖励规则</h3>
        <div class="space-y-2 text-sm text-tj-text-primary">
          <div class="flex items-center gap-2.5">
            <span>🎁</span>
            <span>直推奖励 15%</span>
          </div>
          <div class="flex items-center gap-2.5">
            <span>👥</span>
            <span>间推奖励 5%</span>
          </div>
          <div class="flex items-center gap-2.5">
            <span>💎</span>
            <span>好友每付费一笔，您都得奖励</span>
          </div>
        </div>
      </div>

      <!-- 吸底主按钮：去测算 -->
      <div class="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto p-4 bg-tj-bg/95 backdrop-blur-md border-t border-white/10 z-20">
        <button
          @click="router.push('/home')"
          class="w-full h-12 rounded-full font-bold text-base transition-all flex items-center justify-center gap-2 bg-tj-grad-gold text-[#1A1405] shadow-gold-glow hover:brightness-110 active:scale-98"
        >
          去测算
        </button>
      </div>
    </template>

    <!-- 【已激活态】 -->
    <template v-else>
      <!-- 1. 收益总览卡 -->
      <div class="bg-gradient-to-br from-[#2A2110] via-tj-bg-card to-[#19150B] border border-tj-primary/40 rounded-2xl p-5 mb-4 shadow-gold-glow relative overflow-hidden">
        <div class="flex items-center justify-between mb-1">
          <span class="text-xs text-tj-text-secondary">可提现余额</span>
          <router-link
            to="/promote/earnings"
            class="px-3.5 py-1 rounded-full bg-[#1A1405] border border-tj-primary/50 text-tj-primary text-xs font-bold hover:brightness-125 transition-all shadow-sm"
          >
            提现
          </router-link>
        </div>
        <div class="text-[28px] font-bold font-num text-tj-primary mb-1">
          {{ userStore.user?.earnings_balance?.toFixed(2) || "0.00" }} <span class="text-sm font-sans font-normal">USDT</span>
        </div>
        <div class="text-[11px] text-tj-text-faint">
          累计收益 {{ userStore.user?.total_earned?.toFixed(2) || "0.00" }} USDT
        </div>
      </div>

      <!-- 2. 数据三联 (三列均分) -->
      <div class="grid grid-cols-3 divide-x divide-white/10 bg-tj-bg-card border border-white/5 rounded-2xl p-3.5 mb-4 text-center">
        <div>
          <div class="text-lg font-bold font-num text-tj-primary">{{ teamData.directCount }}</div>
          <div class="text-[11px] text-tj-text-secondary mt-0.5">直推人数</div>
        </div>
        <div>
          <div class="text-lg font-bold font-num text-tj-primary">{{ teamData.indirectCount }}</div>
          <div class="text-[11px] text-tj-text-secondary mt-0.5">间推人数</div>
        </div>
        <div>
          <div class="text-lg font-bold font-num text-tj-primary">{{ teamData.orderCount }}</div>
          <div class="text-[11px] text-tj-text-secondary mt-0.5">团队付费笔数</div>
        </div>
      </div>

      <!-- 3. 推荐码卡 -->
      <div class="bg-tj-bg-card border border-white/10 rounded-2xl p-4 mb-4 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-xs text-tj-text-secondary mb-0.5">我的推荐码</div>
            <div class="text-2xl font-bold font-mono text-tj-primary tracking-wider">
              {{ myReferralCode }}
            </div>
          </div>
          <button
            @click="copyCode(myReferralCode)"
            class="px-3.5 py-1.5 rounded-lg bg-tj-primary text-[#1A1405] text-xs font-bold hover:brightness-110 active:scale-95 transition-all"
          >
            复制
          </button>
        </div>

        <div class="pt-2 border-t border-white/5 flex items-center justify-between gap-2 text-xs">
          <span class="text-tj-text-faint truncate font-mono flex-1">
            {{ inviteUrl }}
          </span>
          <button
            @click="copyCode(inviteUrl)"
            class="text-tj-primary hover:underline font-semibold flex-shrink-0"
          >
            复制链接
          </button>
        </div>
      </div>

      <!-- 4. 按钮区 -->
      <div class="space-y-2.5 mb-4">
        <button
          @click="showPosterModal = true"
          class="w-full h-12 rounded-full font-bold text-sm transition-all flex items-center justify-center gap-2 bg-tj-grad-gold text-[#1A1405] shadow-gold-glow hover:brightness-110 active:scale-98"
        >
          <span>🎨</span> 生成海报
        </button>

        <router-link
          to="/promote/earnings"
          class="w-full h-11 rounded-full border border-white/10 text-tj-text-secondary text-xs hover:bg-white/5 active:scale-98 transition-all flex items-center justify-center"
        >
          收益明细 ›
        </router-link>
      </div>

      <!-- 5. 奖励规则卡 -->
      <div class="bg-tj-primary/8 border border-tj-primary/30 rounded-2xl p-4 mb-2 space-y-2">
        <h3 class="text-[15px] font-semibold text-tj-primary">奖励规则</h3>
        <div class="space-y-1.5 text-xs text-tj-text-primary">
          <div>• 直推奖励 15%：好友通过您的链接付费直接分成</div>
          <div>• 间推奖励 5%：好友的好友付费享二级裂变分成</div>
          <div>• 好友每付费一笔，您都得奖励</div>
        </div>
      </div>

      <!-- 6. 右下角满 10 USDT 可提现文案 -->
      <div class="text-[12px] text-tj-text-faint text-right">
        满 10 USDT 可提现
      </div>
    </template>

    <!-- 海报弹层 -->
    <SharePosterModal
      :visible="showPosterModal"
      :referralCode="myReferralCode"
      @close="showPosterModal = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { useUIStore } from "../stores/ui";
import SharePosterModal from "../components/common/SharePosterModal.vue";

const router = useRouter();
const userStore = useUserStore();
const uiStore = useUIStore();

const showPosterModal = ref(false);

const myReferralCode = computed(() => userStore.user?.referral_code || "TJ8K2M9");
const isPromoteActive = computed(() => Boolean(userStore.user?.id));

const inviteUrl = computed(() => {
  return `${window.location.origin}/invite/${myReferralCode.value}`;
});

const teamData = ref({
  directCount: 18,
  indirectCount: 64,
  orderCount: 97,
});

function copyCode(text: string) {
  navigator.clipboard.writeText(text);
  uiStore.showToast("已复制");
}
</script>
