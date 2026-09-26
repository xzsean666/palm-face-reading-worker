<template>
  <div class="flex-1 pb-16 px-4 pt-3 flex flex-col justify-between select-none">
    <div>
      <!-- 1. 功能头图区 (高 200px) -->
      <div class="h-[200px] w-full rounded-2xl bg-[#0F1424] bg-tj-grad-hero border border-tj-primary/20 p-5 mb-4 relative overflow-hidden flex flex-col items-center justify-center text-center shadow-lg">
        <!-- 光轨背景效果 -->
        <div class="absolute -right-6 -bottom-6 w-36 h-36 rounded-full bg-tj-primary/10 blur-2xl pointer-events-none"></div>

        <div class="text-[56px] text-tj-primary mb-2 leading-none">
          🤲
        </div>
        <h2 class="text-xl font-semibold font-display text-transparent bg-clip-text bg-tj-grad-gold mb-1">
          掌中乾坤，五官玄机
        </h2>
        <p class="text-xs text-tj-text-secondary">
          解读手掌纹路，窥探命运玄机
        </p>
      </div>

      <!-- 选项卡列表 (高 88px 卡片) -->
      <div class="space-y-3 mb-4">
        <!-- 选项卡 1：手相解秘 -->
        <div
          @click="selectFeature('palm_reading')"
          class="h-[88px] bg-tj-bg-card hover:bg-tj-bg-card-hover border border-white/10 hover:border-tj-primary/50 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all active:scale-98 shadow-sm group"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-white/5 group-hover:bg-tj-primary/15 flex items-center justify-center text-[40px] leading-none transition-colors">
              🖐️
            </div>
            <div>
              <h3 class="text-base font-semibold text-tj-text-primary group-hover:text-tj-primary transition-colors">
                手相解秘
              </h3>
              <p class="text-xs text-tj-text-secondary mt-0.5">
                解读手掌纹路，透析命局与健康
              </p>
            </div>
          </div>
          <span class="text-sm text-tj-text-faint group-hover:text-tj-primary transition-colors">
            ›
          </span>
        </div>

        <!-- 选项卡 2：面相玄机 -->
        <div
          @click="selectFeature('face_reading')"
          class="h-[88px] bg-tj-bg-card hover:bg-tj-bg-card-hover border border-white/10 hover:border-tj-purple/50 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all active:scale-98 shadow-sm group"
        >
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-white/5 group-hover:bg-tj-purple/15 flex items-center justify-center text-[40px] leading-none transition-colors">
              🧑
            </div>
            <div>
              <h3 class="text-base font-semibold text-tj-text-primary group-hover:text-tj-purple-light transition-colors">
                面相玄机
              </h3>
              <p class="text-xs text-tj-text-secondary mt-0.5">
                观相貌知命理，AI 深度解读十二宫
              </p>
            </div>
          </div>
          <span class="text-sm text-tj-text-faint group-hover:text-tj-purple-light transition-colors">
            ›
          </span>
        </div>

        <!-- 选项卡 3：面手合参 (旗舰) -->
        <div
          @click="selectFeature('palm_face')"
          class="h-[88px] bg-gradient-to-r from-tj-primary/10 via-tj-bg-card to-tj-purple/10 hover:border-tj-primary/60 border border-tj-primary/30 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all active:scale-98 shadow-gold-glow group relative overflow-hidden"
        >
          <span class="absolute top-0 right-3 px-2 py-0.5 rounded-b-md bg-tj-grad-gold text-[#1A1405] text-[9px] font-bold">
            旗舰合参
          </span>
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 rounded-xl bg-tj-primary/15 flex items-center justify-center text-[36px] leading-none">
              🔮
            </div>
            <div>
              <h3 class="text-base font-semibold text-tj-primary flex items-center gap-1.5">
                面手合参
              </h3>
              <p class="text-xs text-tj-text-secondary mt-0.5">
                天圆地方全息共振，六大相局综合详批
              </p>
            </div>
          </div>
          <span class="text-sm text-tj-primary font-bold">
            ›
          </span>
        </div>
      </div>

      <!-- 4. 拍摄要求区 -->
      <div class="bg-tj-bg-card border border-white/5 rounded-2xl p-4 text-xs text-tj-text-faint space-y-2">
        <div class="font-semibold text-tj-text-secondary flex items-center gap-1.5">
          <span>📷</span> 拍摄要求
        </div>
        <div class="space-y-1 pl-1 text-[11px] leading-relaxed">
          <div>• <strong>手相规范</strong>：手掌自然张开、正对镜头平放、确保光线充足纹路清晰。</div>
          <div>• <strong>面相规范</strong>：面部正对镜头、五官无遮挡、不戴帽子墨镜、避免美颜与强滤镜。</div>
          <div>• <strong>面手合参</strong>：可同时上传手掌与面部高清照片，AI 自动进行跨维度命理校对。</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

function selectFeature(type: "palm_reading" | "face_reading" | "palm_face") {
  router.push(`/feature/${type}/input`);
}
</script>
