import { onMounted, onUnmounted, ref } from 'vue'

export function useShowExpand(filterItems: any[]) {
  const filterFormHeight = ref('96px')
  const filterFormGridEl = ref<HTMLElement>()
  const shouldShowExpandButton = ref(false)
  const isExpanded = ref(false)

  // 检测筛选表单是否超过两行
  function checkFilterFormHeight() {
    if (!filterFormGridEl.value || !filterItems.length) {
      shouldShowExpandButton.value = false
      return
    }
    nextTick(() => {
      // 临时设置为自动高度以获取真实高度
      const originalHeight = filterFormGridEl.value!.style.height
      filterFormGridEl.value!.style.height = 'auto'

      const actualHeight = filterFormGridEl.value!.scrollHeight

      // 恢复原始高度
      filterFormGridEl.value!.style.height = originalHeight

      // 计算两行的大概高度
      // 每个 form-item 高度约 32px，加上 gap 16px，大概 48px 一行
      // 两行就是 96px 左右，加上一些容错空间
      const twoRowsHeight = 96

      if (actualHeight > twoRowsHeight) {
        shouldShowExpandButton.value = true
        // 如果超过两行，默认收起
        if (!isExpanded.value) {
          filterFormHeight.value = '96px'
        }
      }
      else {
        shouldShowExpandButton.value = false
        // 如果不超过两行，保持展开状态
        isExpanded.value = true
        filterFormHeight.value = 'auto'
      }
    })
  }
  // 窗口大小改变时重新检测
  function handleResize() {
    checkFilterFormHeight()
  }
  // 控制展开收起
  function toggleExpand() {
    isExpanded.value = !isExpanded.value
    filterFormHeight.value = isExpanded.value ? 'auto' : '96px'
  }
  onMounted(() => {
    // 监听窗口大小变化
    window.addEventListener('resize', handleResize)
    nextTick(() => {
      setTimeout(checkFilterFormHeight, 100)
    })
  })
  onUnmounted(() => {
    window.removeEventListener('resize', handleResize)
  })

  // 监听 filterItems 变化，重新检测高度
  watch(() => filterItems, () => {
    nextTick(() => {
      setTimeout(checkFilterFormHeight, 100)
    })
  }, { deep: true })
  return {
    filterFormHeight,
    filterFormGridEl,
    shouldShowExpandButton,
    isExpanded,
    toggleExpand,
  }
}
