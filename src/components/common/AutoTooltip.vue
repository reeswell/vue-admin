<script setup>
import { nextTick, onMounted, ref, toRef, watch } from 'vue'

// 定义props
const props = defineProps({
  content: {
    type: String,
    default: '',
  },
  placement: {
    type: String,
    default: 'bottom',
  },
  lines: {
    type: Number,
    default: 1, // 默认单行，可以传入 2 表示两行
  },
})

const content = toRef(props, 'content')
const lines = toRef(props, 'lines')

// 是否显示tooltip
const showTooltip = ref(false)
const contentRef = ref(null)

// 检查内容是否溢出（参考 ProductCard.vue 的实现）
function checkOverflow() {
  nextTick(() => {
    const el = contentRef.value
    if (el) {
      // 对于使用 -webkit-line-clamp 的多行文本，通过比较 scrollHeight 和 clientHeight 判断是否溢出
      // 如果 scrollHeight > clientHeight，说明内容被截断，触发了省略号
      const isMultiLineOverflow = el.scrollHeight > el.clientHeight

      // 对于单行文本，通过比较 scrollWidth 和 offsetWidth 判断是否溢出
      const isSingleLineOverflow = el.scrollWidth > el.offsetWidth

      // 如果任一条件满足，则显示 tooltip
      showTooltip.value = isMultiLineOverflow || isSingleLineOverflow
    }
    else {
      // 如果没有元素引用，不显示 tooltip
      showTooltip.value = false
    }
  })
}

watch(content, () => {
  checkOverflow()
})

// 组件挂载后检查溢出状态
onMounted(() => {
  checkOverflow()
})
</script>

<template>
  <el-tooltip
    popper-class="card-prodcut-auto-tooltip" :content="content" :disabled="!showTooltip"
    :placement="placement" v-bind="$attrs"
  >
    <div
      ref="contentRef"
      class="card-prodcut-overflow-text"
      :class="{ 'multi-line': lines > 1 }"
      :style="lines > 1 ? { '-webkit-line-clamp': lines } : {}"
    >
      <slot>{{ content }}</slot>
    </div>
  </el-tooltip>
</template>

<style>
/* 单行截断（默认） */
.card-prodcut-overflow-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
  display: inline-block;
}

/* 多行截断 */
.card-prodcut-overflow-text.multi-line {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  white-space: normal;
  word-break: break-all;
  width: 100%;
}

.card-prodcut-auto-tooltip {
  max-width: 230px;
  word-break: break-word;
}
</style>
