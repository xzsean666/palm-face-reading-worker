<template>
  <div class="flex-1 pb-16 px-4 pt-3 select-none">
    <!-- 空态 -->
    <div v-if="records.length === 0" class="text-center py-20 bg-tj-bg-card rounded-2xl border border-white/5 my-4">
      <div class="text-[96px] leading-none mb-3">🗂️</div>
      <p class="text-sm text-tj-text-secondary mb-5">您还没有测算记录</p>
      <router-link
        to="/home"
        class="inline-block px-6 py-2 rounded-full bg-tj-grad-gold text-[#1A1405] text-xs font-bold shadow-gold-glow hover:brightness-110 active:scale-95 transition-all"
      >
        去测算
      </router-link>
    </div>

    <!-- 记录列表 (行高 72px 卡片) -->
    <div v-else class="space-y-3">
      <div
        v-for="item in records"
        :key="item.id"
        @click="handleItemClick(item)"
        class="h-[72px] bg-tj-bg-card hover:bg-tj-bg-card-hover border border-white/5 hover:border-tj-primary/30 rounded-2xl px-4 flex items-center justify-between cursor-pointer transition-all active:scale-98 shadow-sm"
      >
        <!-- 左侧图标 36px 金 + 中部文案 -->
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-tj-primary/10 border border-tj-primary/30 flex items-center justify-center text-xl text-tj-primary flex-shrink-0">
            {{ item.icon }}
          </div>
          <div>
            <div class="text-sm font-semibold text-tj-text-primary">{{ item.categoryName }}</div>
            <div class="text-[11px] text-tj-text-faint font-mono mt-0.5">{{ item.time }}</div>
          </div>
        </div>

        <!-- 右侧状态标签 + 查看报告按钮 -->
        <div class="flex flex-col items-end gap-1">
          <span
            class="px-2 py-0.5 rounded text-[10px] font-medium"
            :class="[
              item.status === 'completed' ? 'bg-tj-success/15 text-tj-success' :
              item.status === 'analyzing' ? 'bg-tj-cyan/15 text-tj-cyan flex items-center gap-1' :
              'bg-white/10 text-tj-text-faint'
            ]"
          >
            <span v-if="item.status === 'analyzing'" class="w-1.5 h-1.5 rounded-full bg-tj-cyan animate-ping"></span>
            {{ item.statusText }}
          </span>

          <span
            v-if="item.status === 'completed'"
            class="text-xs text-tj-primary font-semibold hover:underline"
          >
            查看报告 ›
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const records = ref([
  {
    id: "rec_1",
    category: "bazi",
    categoryName: "八字推测",
    icon: "☯️",
    time: "2026-09-25 14:30",
    status: "completed",
    statusText: "已完成",
  },
  {
    id: "rec_2",
    category: "palm_reading",
    categoryName: "手相解秘",
    icon: "🖐️",
    time: "2026-09-24 10:18",
    status: "completed",
    statusText: "已完成",
  },
  {
    id: "rec_3",
    category: "love_match",
    categoryName: "我们合不合",
    icon: "💞",
    time: "2026-09-23 18:05",
    status: "analyzing",
    statusText: "推演中",
  },
]);

function handleItemClick(item: any) {
  if (item.status === "analyzing") {
    router.push(`/feature/${item.category}/analyzing`);
  } else {
    router.push(`/feature/${item.category}/report`);
  }
}
</script>
