<template>
  <div class="space-y-2 select-none">
    <div class="flex items-center justify-between">
      <label class="block text-xs font-semibold text-tj-text-primary">
        {{ label }} <span v-if="required" class="text-tj-danger">*</span>
      </label>

      <!-- 公历 / 农历切换胶囊开关 (如果启用) -->
      <div v-if="allowCalendarSwitch" class="flex items-center p-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px]">
        <button
          type="button"
          @click="calendarType = 'solar'"
          class="px-2 py-0.5 rounded-md transition-colors"
          :class="calendarType === 'solar' ? 'bg-tj-primary text-[#1A1405] font-bold' : 'text-tj-text-faint hover:text-white'"
        >
          阳历(公历)
        </button>
        <button
          type="button"
          @click="calendarType = 'lunar'"
          class="px-2 py-0.5 rounded-md transition-colors"
          :class="calendarType === 'lunar' ? 'bg-tj-primary text-[#1A1405] font-bold' : 'text-tj-text-faint hover:text-white'"
        >
          阴历(农历)
        </button>
      </div>
    </div>

    <!-- 日期选择输入框 -->
    <div class="relative">
      <input
        :value="dateValue"
        type="date"
        :required="required"
        @input="onDateInput"
        class="w-full h-11 px-3 rounded-xl bg-[#141828] border border-white/10 text-tj-text-primary text-xs focus:border-tj-primary outline-none transition-colors"
      />
    </div>

    <!-- 时辰选择器 (若 includeTime 为 true) -->
    <div v-if="includeTime" class="pt-1">
      <label class="block text-[11px] text-tj-text-secondary mb-1">
        出生时辰 (地支十二时)
      </label>
      <select
        :value="timeValue"
        @change="onTimeChange"
        class="w-full h-11 px-3 rounded-xl bg-[#141828] border border-white/10 text-tj-text-primary text-xs focus:border-tj-primary outline-none transition-colors"
      >
        <option value="子时 (23:00 - 01:00)">子时 (23:00 - 01:00)</option>
        <option value="丑时 (01:00 - 03:00)">丑时 (01:00 - 03:00)</option>
        <option value="寅时 (03:00 - 05:00)">寅时 (03:00 - 05:00)</option>
        <option value="卯时 (05:00 - 07:00)">卯时 (05:00 - 07:00)</option>
        <option value="辰时 (07:00 - 09:00)">辰时 (07:00 - 09:00)</option>
        <option value="巳时 (09:00 - 11:00)">巳时 (09:00 - 11:00)</option>
        <option value="午时 (11:00 - 13:00)">午时 (11:00 - 13:00)</option>
        <option value="未时 (13:00 - 15:00)">未时 (13:00 - 15:00)</option>
        <option value="申时 (15:00 - 17:00)">申时 (15:00 - 17:00)</option>
        <option value="酉时 (17:00 - 19:00)">酉时 (17:00 - 19:00)</option>
        <option value="戌时 (19:00 - 21:00)">戌时 (19:00 - 21:00)</option>
        <option value="亥时 (21:00 - 23:00)">亥时 (21:00 - 23:00)</option>
        <option value="不清楚时辰">不清楚出生时辰 (按子平正盘推演)</option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = withDefaults(
  defineProps<{
    dateValue?: string;
    timeValue?: string;
    label?: string;
    required?: boolean;
    includeTime?: boolean;
    allowCalendarSwitch?: boolean;
  }>(),
  {
    dateValue: "1995-08-08",
    timeValue: "午时 (11:00 - 13:00)",
    label: "出生公历日期时辰",
    required: true,
    includeTime: true,
    allowCalendarSwitch: true,
  }
);

const emit = defineEmits<{
  (e: "update:dateValue", val: string): void;
  (e: "update:timeValue", val: string): void;
}>();

const calendarType = ref<"solar" | "lunar">("solar");

function onDateInput(e: Event) {
  const target = e.target as HTMLInputElement;
  emit("update:dateValue", target.value);
}

function onTimeChange(e: Event) {
  const target = e.target as HTMLSelectElement;
  emit("update:timeValue", target.value);
}
</script>
