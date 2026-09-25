<template>
  <div class="relative w-[220px] h-[220px] flex items-center justify-center select-none">
    <!-- 外层光晕背景 -->
    <div class="absolute inset-0 rounded-full bg-tj-primary/5 blur-xl"></div>

    <!-- 1. 罗盘外环 (顺时针 8s/圈) -->
    <div class="absolute inset-0 rounded-full border border-tj-primary/30 animate-spin-compass">
      <!-- 罗盘外环天干刻度点 -->
      <div class="absolute top-1 left-1/2 -translate-x-1/2 text-[9px] text-tj-primary/80 font-display">甲</div>
      <div class="absolute bottom-1 left-1/2 -translate-x-1/2 text-[9px] text-tj-primary/80 font-display">庚</div>
      <div class="absolute left-1 top-1/2 -translate-y-1/2 text-[9px] text-tj-primary/80 font-display">丙</div>
      <div class="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-tj-primary/80 font-display">壬</div>
    </div>

    <!-- 2. 八卦内环 (逆时针 12s/圈) -->
    <div class="absolute inset-5 rounded-full border border-dashed border-tj-primary/40 animate-spin-reverse-bagua flex items-center justify-center">
      <div class="absolute top-1 text-[11px] text-tj-primary font-bold">☰</div>
      <div class="absolute bottom-1 text-[11px] text-tj-primary font-bold">☷</div>
      <div class="absolute left-1 text-[11px] text-tj-primary font-bold">☵</div>
      <div class="absolute right-1 text-[11px] text-tj-primary font-bold">☲</div>
      <div class="absolute top-4 right-4 text-[10px] text-tj-primary/70">☱</div>
      <div class="absolute top-4 left-4 text-[10px] text-tj-primary/70">☴</div>
      <div class="absolute bottom-4 right-4 text-[10px] text-tj-primary/70">☶</div>
      <div class="absolute bottom-4 left-4 text-[10px] text-tj-primary/70">☳</div>
    </div>

    <!-- 3. 三层同心圆刻度与光晕 -->
    <div class="absolute inset-10 rounded-full border border-tj-cyan/30 shadow-cyan-glow animate-pulse"></div>

    <!-- 4. 中心太极缓转 -->
    <div class="w-16 h-16 rounded-full bg-[#141828] border-2 border-tj-primary flex items-center justify-center text-tj-primary text-3xl font-display font-bold shadow-gold-glow animate-spin-taichi">
      ☯
    </div>

    <!-- 5. 飘散金色粒子 -->
    <div class="absolute -top-1 right-1/4 w-1.5 h-1.5 rounded-full bg-tj-primary shadow-gold-glow animate-ping opacity-75"></div>
    <div class="absolute -bottom-2 left-1/3 w-1.5 h-1.5 rounded-full bg-tj-cyan shadow-cyan-glow animate-ping opacity-75" style="animation-delay: 1s;"></div>
  </div>
</template>

<script setup lang="ts">
// AstroCompass 220px 乾坤罗盘
</script>

<style scoped>
@keyframes spinCompass {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes spinReverseBagua {
  from {
    transform: rotate(360deg);
  }
  to {
    transform: rotate(0deg);
  }
}

@keyframes spinTaichi {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin-compass {
  animation: spinCompass 8s linear infinite;
}

.animate-spin-reverse-bagua {
  animation: spinReverseBagua 12s linear infinite;
}

.animate-spin-taichi {
  animation: spinTaichi 20s linear infinite;
}
</style>
