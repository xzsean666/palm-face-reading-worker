<template>
  <div class="space-y-2 select-none">
    <div class="flex items-center justify-between">
      <label class="block text-xs font-semibold text-tj-text-primary">
        {{ label }} <span v-if="required" class="text-tj-danger">*</span>
      </label>
      <span v-if="isCompressed" class="text-[10px] text-tj-success">
        ✓ 已完成本地高保真压缩 ({{ (compressedSize / 1024).toFixed(0) }} KB)
      </span>
    </div>

    <!-- 上传区域框 (96px 方块或大卡) -->
    <div
      @click="triggerSelect"
      class="w-full h-44 rounded-2xl border-2 border-dashed transition-all relative flex flex-col items-center justify-center cursor-pointer overflow-hidden group"
      :class="[
        error ? 'border-tj-danger bg-tj-danger/5' : 'border-tj-primary/40 hover:border-tj-primary bg-white/5',
        modelValue ? 'p-1' : 'p-4'
      ]"
    >
      <!-- 已有图片预览 -->
      <template v-if="modelValue">
        <img :src="modelValue" class="w-full h-full object-contain rounded-xl" />
        <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <button
            type="button"
            @click.stop="triggerSelect"
            class="px-3 py-1.5 rounded-lg bg-tj-primary text-[#1A1405] text-xs font-bold shadow-md hover:brightness-110 active:scale-95"
          >
            重新拍照/上传
          </button>
          <button
            type="button"
            @click.stop="clearImage"
            class="px-3 py-1.5 rounded-lg bg-white/20 text-white text-xs font-bold hover:bg-white/30 active:scale-95"
          >
            清除
          </button>
        </div>
      </template>

      <!-- 上传中 Loading 态 -->
      <template v-else-if="compressing">
        <div class="flex flex-col items-center gap-2">
          <div class="w-8 h-8 rounded-full border-2 border-tj-primary border-t-transparent animate-spin"></div>
          <span class="text-xs text-tj-primary">智能压缩与相理特征提取中...</span>
        </div>
      </template>

      <!-- 空白待上传态 -->
      <template v-else>
        <span class="text-4xl block mb-2 group-hover:scale-110 transition-transform">📸</span>
        <div class="text-xs font-semibold text-tj-text-primary text-center">
          拍照或从相册选择
        </div>
        <div class="text-[10px] text-tj-text-faint mt-1 text-center">
          {{ hint || "保持光线充足，纹路清晰无遮挡" }}
        </div>
      </template>

      <!-- 隐藏原生文件输入 -->
      <input
        ref="inputRef"
        type="file"
        accept="image/*"
        capture="user"
        class="hidden"
        @change="onFileSelected"
      />
    </div>

    <!-- 错误警告提示 -->
    <div v-if="error" class="text-[11px] text-tj-danger flex items-center gap-1">
      <span>⚠️</span> {{ error }}
    </div>

    <!-- 隐私保障声明 -->
    <div class="text-[11px] text-tj-text-faint pt-1 leading-relaxed">
      🔒 隐私承诺：您上传的照片仅在浏览器端 Canvas 压缩并用于本次 AI 推演，平台绝不留存或泄露任何个人生物特征数据。
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { compressImage } from "../../utils/image-compress";

const props = withDefaults(
  defineProps<{
    modelValue?: string;
    label?: string;
    required?: boolean;
    hint?: string;
  }>(),
  {
    modelValue: "",
    label: "上传照片",
    required: true,
    hint: "保持光线充足，相理特征清晰",
  }
);

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);
const compressing = ref(false);
const error = ref<string | null>(null);
const isCompressed = ref(false);
const compressedSize = ref(0);

function triggerSelect() {
  error.value = null;
  inputRef.value?.click();
}

async function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  compressing.value = true;
  error.value = null;

  try {
    const result = await compressImage(file, {
      maxWidth: 1024,
      maxHeight: 1024,
      quality: 0.85,
      maxSizeBytes: 200 * 1024,
    });

    isCompressed.value = true;
    compressedSize.value = result.size;
    emit("update:modelValue", result.base64);
  } catch (err: any) {
    error.value = err.message || "图片压缩失败，请重试";
  } finally {
    compressing.value = false;
    if (inputRef.value) inputRef.value.value = "";
  }
}

function clearImage() {
  emit("update:modelValue", "");
  isCompressed.value = false;
  compressedSize.value = 0;
  error.value = null;
}
</script>
