<script setup lang="ts">
import { Close } from '@element-plus/icons-vue'
import { routesMap } from '~/composables/sidebar'
import type { TagView } from '~/types/tags-view'

import { useTagsViewState, visitedViews } from '~/composables/useTagsView'

const scrollContainer = ref<{ $el?: HTMLElement } | HTMLElement | null>(null)
const tag = ref<any[]>([])

const visible = ref(false)
const top = ref(0)
const left = ref(0)
const selectedTag = ref<TagView | null>(null)

const {
  initTags,
  addTags,
  closeSelectedTag,
  closeOthersTags,
  closeAllTags,
  isActive,
  isAffix,
  refreshSelectedTag,
} = useTagsView()

const route = useRoute()

function containerElement(): HTMLElement | undefined {
  const raw = scrollContainer.value
  if (!raw)
    return
  if (raw instanceof HTMLElement)
    return raw
  return raw.$el
}

const scrollWrapper = computed(() => {
  const containerEl = containerElement()
  if (containerEl && typeof containerEl.querySelector === 'function')
    return containerEl.querySelector('.el-scrollbar__wrap')
  return null
})

function handleScroll(e: WheelEvent & { wheelDelta?: number }) {
  const eventDelta = e.wheelDelta || -e.deltaY * 40
  if (scrollWrapper.value) {
    scrollWrapper.value.scrollLeft = scrollWrapper.value.scrollLeft + eventDelta / 4
  }
}

function moveToTarget(currentTag: { path: string }) {
  if (!scrollContainer.value || !scrollWrapper.value) {
    return
  }

  const $container = containerElement()
  if (!$container || typeof $container.querySelector !== 'function' || !$container.offsetWidth) {
    return
  }

  const $containerWidth = $container.offsetWidth
  const $scrollWrapper = scrollWrapper.value
  const tagAndTagSpacing = 4

  // 获取所有标签元素
  const tagElements = $container.querySelectorAll<HTMLElement>('.tags-view-item')
  if (!tagElements || tagElements.length === 0) {
    return
  }

  const firstTag = tagElements[0]
  const lastTag = tagElements[tagElements.length - 1]

  // 找到当前标签元素
  const currentTagElement = Array.from(tagElements).find((el) => {
    const link = el.querySelector('a')
    return link && link.getAttribute('href') === currentTag.path
  })

  if (!currentTagElement) {
    return
  }

  if (firstTag === currentTagElement) {
    $scrollWrapper.scrollLeft = 0
  }
  else if (lastTag === currentTagElement) {
    $scrollWrapper.scrollLeft = $scrollWrapper.scrollWidth - $containerWidth
  }
  else {
    const currentIndex = Array.from(tagElements).indexOf(currentTagElement)
    const prevTag = tagElements[currentIndex - 1]
    const nextTag = tagElements[currentIndex + 1]

    if (prevTag && nextTag) {
      const afterNextTagOffsetLeft = nextTag.offsetLeft + nextTag.offsetWidth + tagAndTagSpacing
      const beforePrevTagOffsetLeft = prevTag.offsetLeft - tagAndTagSpacing

      if (afterNextTagOffsetLeft > $scrollWrapper.scrollLeft + $containerWidth) {
        $scrollWrapper.scrollLeft = afterNextTagOffsetLeft - $containerWidth
      }
      else if (beforePrevTagOffsetLeft < $scrollWrapper.scrollLeft) {
        $scrollWrapper.scrollLeft = beforePrevTagOffsetLeft
      }
    }
  }
}

function moveToCurrentTag() {
  const tags = tag.value
  nextTick(() => {
    for (const tagItem of tags) {
      if (tagItem.to.path === route.path) {
        moveToTarget(tagItem)
        if (tagItem.to.fullPath !== route.fullPath) {
          const tagView: TagView = {
            name: typeof route.name === 'string' ? route.name : undefined,
            path: route.path,
            fullPath: route.fullPath,
            title: String(route.meta?.title || route.name || ''),
            query: route.query,
            meta: route.meta,
          }
          const tagsViewStore = useTagsViewState()
          tagsViewStore.updateVisitedView(tagView)
        }
        break
      }
    }
  })
}

function openMenu(tagItem: TagView, e: MouseEvent) {
  const menuMinWidth = 105
  const containerEl = document.getElementById('tags-view-container')
  if (!containerEl) {
    return
  }

  const offsetLeft = containerEl.getBoundingClientRect().left
  const offsetWidth = containerEl.offsetWidth
  const maxLeft = offsetWidth - menuMinWidth
  const leftPos = e.clientX - offsetLeft + 15

  if (leftPos > maxLeft) {
    left.value = maxLeft
  }
  else {
    left.value = leftPos
  }

  top.value = e.clientY
  visible.value = true
  selectedTag.value = tagItem
}

function closeMenu() {
  visible.value = false
}

function handleScrollEvent() {
  closeMenu()
}

// 优化路由监听，只在路由进入时执行一次
watch(() => route.fullPath, (newPath, oldPath) => {
  // 只在路由真正变化时执行（不是初始化或相同路径）
  if (oldPath && newPath !== oldPath) {
    nextTick(() => {
      addTags()
      moveToCurrentTag()
    })
  }
}, { flush: 'post' })

watch(visible, (value) => {
  if (value) {
    document.body.addEventListener('click', closeMenu)
  }
  else {
    document.body.removeEventListener('click', closeMenu)
  }
})

onMounted(() => {
  initTags()
  addTags()

  // 添加滚动事件监听
  if (scrollWrapper.value) {
    scrollWrapper.value.addEventListener('scroll', handleScrollEvent, true)
  }
})

onBeforeUnmount(() => {
  document.body.removeEventListener('click', closeMenu)

  // 移除滚动事件监听
  if (scrollWrapper.value) {
    scrollWrapper.value.removeEventListener('scroll', handleScrollEvent)
  }
})
</script>

<template>
  <div id="tags-view-container" class="h-10 w-full bg-white shadow-sm">
    <el-scrollbar
      ref="scrollContainer"
      :vertical="false"
      class="tags-view-wrapper h-full flex items-center whitespace-nowrap relative overflow-hidden w-full"
      @wheel.prevent="handleScroll"
    >
      <RouterLink
        v-for="tagItem in visitedViews"
        ref="tag"
        :key="tagItem.path"
        class="tags-view-item inline-flex relative cursor-pointer items-center h-[26px] leading-[26px] border border-gray-300 text-gray-600 px-[8px] text-[12px] ml-1 first:ml-2 last:mr-4"
        :class="isActive(tagItem) ? 'bg-primary text-white border-primary' : 'bg-white'"
        :to="{ path: tagItem.path, query: tagItem.query }"
        @click.middle="!isAffix(tagItem) ? closeSelectedTag(tagItem) : ''"
        @contextmenu.prevent="openMenu(tagItem, $event)"
      >
        <span v-if="isActive(tagItem)" class="inline-flex items-center w-2 h-2 bg-white rounded-full mr-1 relative" />
        {{ routesMap?.[tagItem.path] || tagItem.title }}
        <span
          v-if="!isAffix(tagItem)"
          class="ml-1.5 w-3.5 h-3.5 flex items-center justify-center align-text-bottom rounded-full text-center transition-all duration-300 origin-right hover:bg-gray-400 hover:text-white before:scale-60 before:inline-block before:align-text-top"
          @click.prevent.stop="closeSelectedTag(tagItem)"
        >
          <el-icon><Close /></el-icon>
        </span>
      </RouterLink>
    </el-scrollbar>
    <ul
      v-show="visible"
      :style="{ left: `${left}px`, top: `${top}px` }"
      class="m-0 bg-white z-50 absolute list-none py-1 rounded text-xs font-normal text-gray-800 shadow-lg"
    >
      <li class="m-0 px-4 py-2 cursor-pointer hover:bg-gray-200" @click="selectedTag && refreshSelectedTag(selectedTag)">刷新</li>
      <li v-if="selectedTag && !isAffix(selectedTag)" class="m-0 px-4 py-2 cursor-pointer hover:bg-gray-200" @click="closeSelectedTag(selectedTag)">关闭</li>
      <li class="m-0 px-4 py-2 cursor-pointer hover:bg-gray-200" @click="selectedTag && closeOthersTags(selectedTag)">关闭其他窗口</li>
      <li class="m-0 px-4 py-2 cursor-pointer hover:bg-gray-200" @click="selectedTag && closeAllTags(selectedTag)">关闭所有窗口</li>
    </ul>
  </div>
</template>

<style scoped>
:deep(.el-scrollbar__bar) {
  bottom: 0px;
}
:deep(.el-scrollbar__wrap) {
  height: 100%;
  display: flex;
  justify-content: items-center;
  align-items: center;
}
</style>
