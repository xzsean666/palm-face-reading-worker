<template>
  <transition name="toast-fade">
    <div
      v-if="uiStore.toastMessage"
      class="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl bg-black/90 text-[#F3EFE3] text-sm font-medium border border-tj-primary/30 shadow-2xl backdrop-blur-md pointer-events-none text-center max-w-[85vw] whitespace-pre-wrap select-none"
    >
      {{ uiStore.toastMessage }}
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useUIStore } from "../../stores/ui";

const uiStore = useUIStore();
</script>

<style scoped>
.toast-fade-enter-active,
.toast-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, 10px);
}
</style>
