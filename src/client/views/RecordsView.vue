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
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "../stores/user";
import { CATEGORIES_CONFIG } from "../stores/divination";

const router = useRouter();
const userStore = useUserStore();

interface RecordItem {
  id: string;
  category: string;
  categoryName: string;
  icon: string;
  time: string;
  status: "completed" | "analyzing" | "pending";
  statusText: string;
}

const records = ref<RecordItem[]>([]);
const loading = ref(true);

onMounted(async () => {
  loading.value = true;
  try {
    const userId = userStore.user?.id || userStore.user?.wallet_address || "guest";
    const res = await fetch(`/api/orders?userId=${encodeURIComponent(userId)}`);
    const json = await res.json();

    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      records.value = json.data.map((o: any) => {
        const catInfo = CATEGORIES_CONFIG[o.category] || {
          name: o.category || "天机推演",
          icon: "🔮",
        };
        const dateStr = o.created_at
          ? new Date(o.created_at).toLocaleString("zh-CN", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "刚刚";

        const isCompleted = o.status === "COMPLETED";
        return {
          id: o.id,
          category: o.category,
          categoryName: catInfo.name,
          icon: catInfo.icon,
          time: dateStr,
          status: isCompleted ? "completed" : "pending",
          statusText: isCompleted ? "已完成" : "待解锁",
        };
      });
    }
  } catch (err) {
    console.warn("加载历史测算记录失败:", err);
  } finally {
    loading.value = false;
  }
});

function handleItemClick(item: RecordItem) {
  if (item.status === "completed") {
    router.push({
      path: `/feature/${item.category}/report`,
      query: { orderId: item.id },
    });
  } else {
    router.push({
      path: `/feature/${item.category}/preview`,
      query: { orderId: item.id },
    });
  }
}
</script>
