<template>
  <div v-if="visible" class="fixed inset-0 z-50 bg-[#0B0E1A]/85 backdrop-blur-sm flex items-center justify-center p-4 select-none animate-fade-in">
    <div class="w-full max-w-sm bg-[#141828] border border-tj-primary/40 rounded-3xl p-5 shadow-2xl relative">
      <div class="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
        <h3 class="text-sm font-semibold text-tj-text-primary">选择推广海报模版</h3>
        <button
          @click="$emit('close')"
          class="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-tj-text-secondary hover:text-white"
        >
          ✕
        </button>
      </div>

      <!-- 3 款模版横排缩略图 -->
      <div class="grid grid-cols-3 gap-2.5 mb-5">
        <div
          v-for="tpl in templates"
          :key="tpl.id"
          @click="selectedTpl = tpl.id"
          class="rounded-xl border p-2 flex flex-col items-center justify-between cursor-pointer transition-all aspect-[3/4] relative overflow-hidden"
          :class="selectedTpl === tpl.id ? 'border-tj-primary bg-tj-primary/10 shadow-gold-glow' : 'border-white/10 bg-white/5 hover:border-white/20'"
        >
          <span v-if="selectedTpl === tpl.id" class="absolute top-1 right-1 text-[10px] text-tj-primary font-bold">✓</span>
          <div class="text-2xl mt-3">{{ tpl.icon }}</div>
          <div class="text-[11px] font-medium text-tj-text-primary text-center">{{ tpl.name }}</div>
          <div class="text-[9px] text-tj-text-faint">{{ tpl.style }}</div>
        </div>
      </div>

      <!-- 海报预览信息卡 -->
      <div class="p-3 bg-white/5 rounded-xl border border-white/5 mb-4 text-xs">
        <div class="flex justify-between items-center mb-1">
          <span class="text-tj-text-faint">内嵌专属推荐码:</span>
          <span class="font-mono text-tj-primary font-bold">{{ referralCode }}</span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-tj-text-faint">好友福利:</span>
          <span class="text-tj-cyan">新人赠送 2 次免费推演</span>
        </div>
      </div>

      <!-- 主按钮：保存海报 -->
      <button
        @click="savePoster"
        class="w-full h-11 rounded-full bg-tj-grad-gold text-[#1A1405] text-xs font-bold shadow-gold-glow hover:brightness-110 active:scale-98 transition-all flex items-center justify-center gap-1.5"
      >
        <span>📥</span> 保存海报至相册
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useUIStore } from "../../stores/ui";

defineProps<{
  visible: boolean;
  referralCode: string;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const uiStore = useUIStore();
const selectedTpl = ref("classic");

const templates = [
  { id: "classic", name: "天机玄金", style: "典雅金纹", icon: "🔮" },
  { id: "cyber", name: "赛博八卦", style: "青金矩阵", icon: "☯️" },
  { id: "fortune", name: "紫气东来", style: "祥瑞吉庆", icon: "✨" },
];

function savePoster() {
  uiStore.showToast("已保存到相册（模拟海报已下载）");
  emit("close");
}
</script>
