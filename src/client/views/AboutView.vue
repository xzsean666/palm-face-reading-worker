<template>
  <div class="flex-1 pb-16 px-4 pt-3 select-none flex flex-col justify-between">
    <div class="space-y-3">
      <!-- 1. 使用指引 (折叠卡) -->
      <div class="bg-tj-bg-card border border-white/10 rounded-2xl overflow-hidden">
        <button
          @click="openGuide = !openGuide"
          class="w-full px-4 py-3.5 flex items-center justify-between text-left"
        >
          <span class="text-sm font-semibold text-tj-text-primary flex items-center gap-2">
            <span>📖</span> 使用指引
          </span>
          <span class="text-xs text-tj-text-faint transform transition-transform" :class="{ 'rotate-90': openGuide }">
            ›
          </span>
        </button>
        <div v-show="openGuide" class="px-4 pb-4 pt-1 text-xs text-tj-text-secondary leading-relaxed border-t border-white/5 space-y-1.5">
          <p>• <strong>免费次数</strong>：在「我的 - 资产行」实时查看，注册即送 2 次；</p>
          <p>• <strong>会员权益</strong>：在「会员中心」开通后享测算 8 折与无限次免扣减畅读；</p>
          <p>• <strong>报告下载</strong>：在「完整报告页」底部操作生成高清长图及 PDF 保存。</p>
        </div>
      </div>

      <!-- 2. 免责声明 (展开全文) -->
      <div class="bg-tj-bg-card border border-[#FF5C6C]/20 rounded-2xl p-4 space-y-2">
        <h3 class="text-sm font-semibold text-tj-danger flex items-center gap-1.5">
          <span>🛡️</span> 免责声明
        </h3>
        <p class="text-xs text-tj-text-secondary leading-[1.8] text-justify">
          本平台所有测算内容均由 AI 生成，仅供娱乐参考，不构成任何投资、医疗、法律或其他决策建议。请理性看待测算结果，切勿迷信。本平台不对任何基于测算内容作出的行为及其后果承担责任。未成年人禁止使用本平台。
        </p>
      </div>

      <!-- 3. 用户协议 (整行入口 ›) -->
      <div
        @click="showAgreement = true"
        class="h-12 bg-tj-bg-card border border-white/5 rounded-2xl px-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
      >
        <span class="text-sm font-medium text-tj-text-primary">用户协议</span>
        <span class="text-xs text-tj-text-faint">›</span>
      </div>

      <!-- 4. 隐私政策 (整行入口 ›) -->
      <div
        @click="showPrivacy = true"
        class="h-12 bg-tj-bg-card border border-white/5 rounded-2xl px-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
      >
        <span class="text-sm font-medium text-tj-text-primary">隐私政策</span>
        <span class="text-xs text-tj-text-faint">›</span>
      </div>
    </div>

    <!-- 5. 页脚：品牌名 + 版本号 -->
    <div class="text-center py-6 text-xs text-tj-text-faint space-y-1">
      <div class="font-display font-semibold text-tj-primary-light">天机 AI预测大师</div>
      <div class="font-mono text-[11px]">V1.0.0</div>
    </div>

    <!-- 协议详情弹窗 -->
    <div v-if="showAgreement || showPrivacy" class="fixed inset-0 z-50 bg-[#0B0E1A]/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div class="w-full max-w-sm bg-[#141828] border border-white/10 rounded-2xl p-5 shadow-2xl space-y-3">
        <div class="flex justify-between items-center border-b border-white/10 pb-2">
          <h4 class="text-sm font-bold text-tj-text-primary">{{ showAgreement ? '用户协议' : '隐私政策' }}</h4>
          <button @click="showAgreement = false; showPrivacy = false;" class="text-xs text-tj-text-secondary">✕</button>
        </div>
        <div class="text-xs text-tj-text-secondary leading-relaxed max-h-60 overflow-y-auto space-y-2">
          <p>本协议为天机 AI预测大师与用户之间的正式约定。用户在使用本应用生成推演前已确认知晓传统玄学算法模型属于泛娱乐与传统文化探索性质。</p>
          <p>我们承诺遵循严格的隐私保护标准，不在服务器端永久留存原始生物人脸和掌纹图像，用户数据受到边缘端点对点加密保护。</p>
        </div>
        <button
          @click="showAgreement = false; showPrivacy = false;"
          class="w-full h-10 rounded-full bg-tj-primary text-[#1A1405] text-xs font-bold"
        >
          我已知晓
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const openGuide = ref(true);
const showAgreement = ref(false);
const showPrivacy = ref(false);
</script>
