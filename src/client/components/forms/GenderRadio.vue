<template>
  <div class="space-y-1.5 select-none">
    <label class="block text-xs font-semibold text-tj-text-primary">
      {{ label }} <span v-if="required" class="text-tj-danger">*</span>
    </label>
    <div class="grid grid-cols-2 gap-3">
      <button
        type="button"
        @click="selectGender('male')"
        class="h-11 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 active:scale-98"
        :class="
          modelValue === 'male'
            ? 'bg-tj-primary/10 border-tj-primary text-tj-primary shadow-gold-glow'
            : 'bg-white/5 border-white/10 text-tj-text-secondary hover:border-white/20'
        "
      >
        <span>👨</span> 乾造（男阳）
      </button>

      <button
        type="button"
        @click="selectGender('female')"
        class="h-11 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-2 active:scale-98"
        :class="
          modelValue === 'female'
            ? 'bg-tj-purple/15 border-tj-purple text-tj-purple shadow-purple-glow'
            : 'bg-white/5 border-white/10 text-tj-text-secondary hover:border-white/20'
        "
      >
        <span>👩</span> 坤造（女阴）
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    required?: boolean;
  }>(),
  {
    modelValue: "male",
    label: "命造性别",
    required: true,
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

function selectGender(gender: "male" | "female") {
  emit("update:modelValue", gender);
}
</script>
