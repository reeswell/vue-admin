<script setup lang="ts">
// 处理点击事件
import { Search } from '@element-plus/icons-vue'
import { useIsMac } from '~/composables/misc'

const isMac = useIsMac()
const modifierKeyName = computed(() => isMac.value ? '⌘' : 'Ctrl')

function handleClick() {
  openCommandPanel()
}
</script>

<template>
  <button
    class="
      inline-flex items-center gap-2 relative w-full md:w-40 lg:w-56 xl:w-64
      h-8 rounded-md text-sm font-normal
      px-4 py-2
      border transition-all duration-200
      bg-gray-100/25 hover:bg-gray-100/50
      text-gray-500 hover:text-gray-900
      disabled:pointer-events-none disabled:opacity-50
      focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50
      border-gray-200
      shadow-sm
    "
    @click="handleClick"
  >
    <el-icon class="text-gray-400">
      <Search />
    </el-icon>

    <!-- 搜索文本 -->
    <span class="ml-3 text-gray-500">搜索</span>

    <!-- 快捷键提示 -->
    <kbd
      class="
        hidden sm:flex items-center gap-1
        absolute top-[0.3rem] right-[0.3rem]
        h-5 px-1.5 rounded border
        bg-gray-100
        font-mono text-[10px] font-medium
        pointer-events-none select-none
        text-gray-600
        border-gray-200
      "
    >
      <span class="text-xs">{{ modifierKeyName }} + K</span>
    </kbd>
  </button>
</template>
