<!-- components/ColorRadioGroup.vue -->
<script setup lang="ts">
import { Check } from '@element-plus/icons-vue'

interface Props {
  colors?: Array<{
    value: string
    label?: string
  }>
}

const { colors } = withDefaults(defineProps<Props>(), {
  colors: () => [
    { value: '#409eff', label: '经典蓝' },
    { value: '#1f2937', label: '深灰' },
    { value: '#e6a23c', label: '温暖橙' },
    { value: '#f56c6c', label: '活力红' },
    { value: '#909399', label: '优雅灰' },
    { value: '#9c27b0', label: '神秘紫' },
    { value: '#00bcd4', label: '青翠蓝' },
    { value: '#ff9800', label: '明亮橙' },
  ],
})

const emit = defineEmits<{
  (e: 'change', value: string): void
}>()

const selectedColor = defineModel<string>('modelValue', { default: '' })

// 处理颜色选择
function handleColorSelect(value: string) {
  selectedColor.value = value
  emit('change', value)
}
</script>

<template>
  <div class="color-radio-group flex gap-2 items-center">
    <div
      v-for="color in colors" :key="color.value" class="color-radio relative"
      :class="{ 'is-active': selectedColor === color.value }" @click="handleColorSelect(color.value)"
    >
      <!-- 颜色圆圈 -->
      <div
        class="w-6 h-6 rounded-full cursor-pointer flex items-center justify-center transition-all duration-200 hover:scale-110"
        :style="{ backgroundColor: color.value }"
      >
        <!-- 勾选图标 -->
        <el-icon v-if="selectedColor === color.value" size="14">
          <Check class="text-white font-bold" />
        </el-icon>
      </div>

      <el-tooltip v-if="color.label" :content="color.label" placement="top" :show-after="200">
        <span class="block w-full h-full" />
      </el-tooltip>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.color-radio-group {
  .color-radio {
    transition: all 0.2s ease;

    &:hover {
      transform: scale(1.1);
    }

    &.is-active {
      transform: scale(1.1);
      box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.3);
    }
  }
}

:deep(.el-icon) {
  font-size: 14px;
  font-weight: bold;
}
</style>
