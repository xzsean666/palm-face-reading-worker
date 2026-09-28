<template>
  <div class="relative w-[220px] h-[220px] flex items-center justify-center select-none my-2">
    <!-- Outer Golden Stardust Aura (Ambient Ripple) -->
    <div class="absolute inset-0 rounded-full bg-primary/10 blur-xl animate-pulse pointer-events-none"></div>

    <!-- Layer 1: Outer 64-Hexagram Celestial Dial (Slow Clockwise Rotation 40s) -->
    <svg class="absolute inset-0 w-full h-full animate-spin-slow pointer-events-none" fill="none" viewBox="0 0 220 220">
      <circle cx="110" cy="110" r="106" stroke="#f2ca50" stroke-dasharray="2 6" stroke-opacity="0.2" stroke-width="1"></circle>
      <circle cx="110" cy="110" r="99" stroke="#f2ca50" stroke-opacity="0.35" stroke-width="0.75"></circle>
      <!-- 64 Tick Marks representing Hexagrams -->
      <g stroke="#f2ca50" stroke-opacity="0.45" stroke-width="1">
        <line x1="110" x2="110" y1="4" y2="10"></line>
        <line x1="110" x2="110" y1="210" y2="216"></line>
        <line x1="4" x2="10" y1="110" y2="110"></line>
        <line x1="210" x2="216" y1="110" y2="110"></line>
        <line stroke-opacity="0.3" x1="35" x2="40" y1="35" y2="40"></line>
        <line stroke-opacity="0.3" x1="180" x2="185" y1="35" y2="40"></line>
        <line stroke-opacity="0.3" x1="35" x2="40" y1="185" y2="180"></line>
        <line stroke-opacity="0.3" x1="180" x2="185" y1="185" y2="180"></line>
      </g>
      <!-- Tiny Astrological Telemetry glyphs -->
      <circle cx="110" cy="12" fill="#f2ca50" r="1.5"></circle>
      <circle cx="110" cy="208" fill="#f2ca50" r="1.5"></circle>
      <circle cx="12" cy="110" fill="#f2ca50" r="1.5"></circle>
      <circle cx="208" cy="110" fill="#f2ca50" r="1.5"></circle>
    </svg>

    <!-- Layer 2: Bagua Octagram Intermediate Ring (Counter-Clockwise Rotation 26s) -->
    <svg class="absolute w-[172px] h-[172px] animate-spin-reverse pointer-events-none" fill="none" viewBox="0 0 172 172">
      <circle cx="86" cy="86" r="82" stroke="#cabeff" stroke-opacity="0.25" stroke-width="1"></circle>
      <!-- Qian ☰ (Top) -->
      <g opacity="0.8" stroke="#cabeff" stroke-linecap="round" stroke-width="1.5">
        <line x1="80" x2="92" y1="12" y2="12"></line>
        <line x1="80" x2="92" y1="16" y2="16"></line>
        <line x1="80" x2="92" y1="20" y2="20"></line>
      </g>
      <!-- Kun ☷ (Bottom) -->
      <g opacity="0.8" stroke="#cabeff" stroke-linecap="round" stroke-width="1.5">
        <line x1="79" x2="84" y1="152" y2="152"></line><line x1="88" x2="93" y1="152" y2="152"></line>
        <line x1="79" x2="84" y1="156" y2="156"></line><line x1="88" x2="93" y1="156" y2="156"></line>
        <line x1="79" x2="84" y1="160" y2="160"></line><line x1="88" x2="93" y1="160" y2="160"></line>
      </g>
      <!-- Li ☲ (Right) -->
      <g opacity="0.8" stroke="#cabeff" stroke-linecap="round" stroke-width="1.5">
        <line x1="152" x2="160" y1="80" y2="80"></line>
        <line x1="152" x2="155" y1="84" y2="84"></line><line x1="157" x2="160" y1="84" y2="84"></line>
        <line x1="152" x2="160" y1="88" y2="88"></line>
      </g>
      <!-- Kan ☵ (Left) -->
      <g opacity="0.8" stroke="#cabeff" stroke-linecap="round" stroke-width="1.5">
        <line x1="12" x2="15" y1="80" y2="80"></line><line x1="17" x2="20" y1="80" y2="80"></line>
        <line x1="12" x2="20" y1="84" y2="84"></line>
        <line x1="12" x2="15" y1="88" y2="88"></line><line x1="17" x2="20" y1="88" y2="88"></line>
      </g>
      <!-- Dui ☱ (Top-Right) -->
      <g opacity="0.75" stroke="#cabeff" stroke-linecap="round" stroke-width="1.5" transform="rotate(45 86 86)">
        <line x1="80" x2="84" y1="12" y2="12"></line><line x1="88" x2="92" y1="12" y2="12"></line>
        <line x1="80" x2="92" y1="16" y2="16"></line>
        <line x1="80" x2="92" y1="20" y2="20"></line>
      </g>
      <!-- Xun ☴ (Top-Left) -->
      <g opacity="0.75" stroke="#cabeff" stroke-linecap="round" stroke-width="1.5" transform="rotate(-45 86 86)">
        <line x1="80" x2="92" y1="12" y2="12"></line>
        <line x1="80" x2="92" y1="16" y2="16"></line>
        <line x1="80" x2="84" y1="20" y2="20"></line><line x1="88" x2="92" y1="20" y2="20"></line>
      </g>
      <!-- Gen ☶ (Bottom-Left) -->
      <g opacity="0.75" stroke="#cabeff" stroke-linecap="round" stroke-width="1.5" transform="rotate(-135 86 86)">
        <line x1="80" x2="92" y1="12" y2="12"></line>
        <line x1="80" x2="84" y1="16" y2="16"></line><line x1="88" x2="92" y1="16" y2="16"></line>
        <line x1="80" x2="84" y1="20" y2="20"></line><line x1="88" x2="92" y1="20" y2="20"></line>
      </g>
      <!-- Zhen ☳ (Bottom-Right) -->
      <g opacity="0.75" stroke="#cabeff" stroke-linecap="round" stroke-width="1.5" transform="rotate(135 86 86)">
        <line x1="80" x2="84" y1="12" y2="12"></line><line x1="88" x2="92" y1="12" y2="12"></line>
        <line x1="80" x2="84" y1="16" y2="16"></line><line x1="88" x2="92" y1="16" y2="16"></line>
        <line x1="80" x2="92" y1="20" y2="20"></line>
      </g>
    </svg>

    <!-- Layer 3: Cyan Telemetry Orbital Ring (Active Progress Ring) -->
    <svg class="absolute w-[136px] h-[136px] -rotate-90 pointer-events-none" viewBox="0 0 136 136">
      <circle cx="68" cy="68" fill="none" r="58" stroke="#1c1f2c" stroke-width="3"></circle>
      <circle
        class="transition-all duration-500 ease-out"
        cx="68"
        cy="68"
        fill="none"
        r="58"
        stroke="#59e0f0"
        stroke-dasharray="364.4"
        :stroke-dashoffset="364.4 * (1 - (progress || 0) / 100)"
        stroke-linecap="round"
        stroke-width="3.5"
      ></circle>
    </svg>

    <!-- Dynamic Particle Orbit Dots -->
    <div class="absolute w-full h-full pointer-events-none animate-[spin_12s_linear_infinite]">
      <span class="absolute top-2 left-1/2 w-1.5 h-1.5 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_8px_#f2ca50]"></span>
    </div>
    <div class="absolute w-[80%] h-[80%] pointer-events-none animate-[spin_8s_linear_infinite_reverse]">
      <span class="absolute bottom-1 right-6 w-1 h-1 rounded-full bg-tertiary shadow-[0_0_6px_#59e0f0]"></span>
    </div>

    <!-- Layer 4: Central Taiji & Tianji Cosmic Eye Emissive Seal -->
    <div class="relative w-24 h-24 rounded-full bg-surface-container-lowest/90 backdrop-blur-md flex flex-col items-center justify-center shadow-[inset_0_0_20px_rgba(242,202,80,0.18)] border border-primary/25 z-10">
      <!-- Ambient Taiji Micro Silhouette -->
      <div class="relative w-8 h-8 opacity-90 mb-0.5 animate-spin-taichi">
        <svg class="w-full h-full" fill="none" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="15" stroke="#f2ca50" stroke-opacity="0.6" stroke-width="1.2"></circle>
          <path d="M16 1 A 15 15 0 0 1 16 31 A 7.5 7.5 0 0 1 16 16 A 7.5 7.5 0 0 0 16 1 Z" fill="#f2ca50" fill-opacity="0.85"></path>
          <circle cx="16" cy="8.5" fill="#0b0e1a" r="2"></circle>
          <circle cx="16" cy="23.5" fill="#f2ca50" r="2"></circle>
          <ellipse cx="16" cy="16" rx="5" ry="3" stroke="#59e0f0" stroke-width="1.2"></ellipse>
          <circle cx="16" cy="16" fill="#59e0f0" r="1.2"></circle>
        </svg>
      </div>
      <!-- Numeric Telemetry -->
      <div class="flex items-baseline justify-center">
        <span class="text-xl font-bold font-num text-[#e0e1f3] tracking-tight">{{ progress ?? 96 }}</span>
        <span class="text-xs text-tertiary font-semibold ml-0.5">%</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  progress?: number;
}>();
</script>
