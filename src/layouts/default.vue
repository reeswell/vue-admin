<script setup lang="ts">
import { Expand, Fold } from '@element-plus/icons-vue'
import Header from '~/components/layout/Header.vue'
import Sidebar from '~/components/layout/Sidebar.vue'
import ModalContainer from '~/components/modal/ModalContainer.vue'
import { isSidebarCollapsed, useSidebar } from '~/composables/sidebar/useSidebar'
import { useSystemConfig } from '~/composables/useSystemConfig'

const {
  showOverlay,
  sidebarClasses,
  toggleSidebar,
  handleOverlayClick,
} = useSidebar()
const { systemConfig } = useSystemConfig()
const keepalive = computed(() => {
  return {
    include: cachedViews.value,
    max: 20,
  }
})

// 计算头部的样式类
const getHeaderClasses = computed(() => {
  const classes = []

  if (systemConfig.value.fixedHeader) {
    classes.push('header-fixed')
    if (systemConfig.value.showTagsView) {
      classes.push('header-with-tags')
    }
    else {
      classes.push('header-no-tags')
    }
  }
  else {
    classes.push('header-static')
    if (systemConfig.value.showTagsView) {
      classes.push('header-with-tags')
    }
    else {
      classes.push('header-no-tags')
    }
  }

  return classes
})

// 计算主内容区的样式类
const getMainContentClasses = computed(() => {
  const classes = []

  if (systemConfig.value.fixedHeader) {
    if (systemConfig.value.showTagsView) {
      classes.push('content-fixed-header-with-tags')
    }
    else {
      classes.push('content-fixed-header-no-tags')
    }
  }
  else {
    if (systemConfig.value.showTagsView) {
      classes.push('content-static-header-with-tags')
    }
    else {
      classes.push('content-static-header-no-tags')
    }
  }

  return classes
})
</script>

<template>
  <div class="app-container" :class="sidebarClasses">
    <div v-if="showOverlay" class="sidebar-overlay" @click="handleOverlayClick" />

    <Sidebar class="sidebar" @close="showOverlay && handleOverlayClick()" />

    <!-- 主容器 -->
    <div class="main-wrapper">
      <!-- 头部 -->
      <Header class="header" :class="getHeaderClasses">
        <div class="toggle-button" @click.prevent="toggleSidebar">
          <el-icon size="20">
            <component :is="isSidebarCollapsed ? Expand : Fold" class="color-primary" />
          </el-icon>
        </div>
      </Header>
      <!-- 主内容区 -->
      <main class="main-content" :class="getMainContentClasses">
        <router-view v-slot="{ Component, route }">
          <keep-alive :include="keepalive.include" :max="keepalive.max">
            <component :is="Component" :key="route.fullPath" />
          </keep-alive>
        </router-view>
      </main>
    </div>

    <ModalContainer />
  </div>
</template>

<style scoped lang="scss">
$sidebar-width: var(--sidebar-width);
$sidebar-collapsed-width: var(--sidebar-collapsed-width);
$tags-view-header-height: 5.4rem;
$header-height: 3.5rem;
$transition-duration: 0.28s;
$transition-timing: cubic-bezier(0.4, 0, 0.2, 1);
$transition: width $transition-duration $transition-timing;

.app-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  background-color: var(--el-bg-color-page, #f5f7fa);
  transition: background-color 0.3s ease;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1001;
  width: $sidebar-width;
  height: 100%;
  will-change: transform;
  transition: $transition;

  .sidebar-collapsed & {
    width: $sidebar-collapsed-width;
  }
}

.main-wrapper {
  position: relative;
  margin-left: $sidebar-width;
  min-height: 100vh;
  transition: margin-left $transition-duration $transition-timing;

  .sidebar-collapsed & {
    margin-left: $sidebar-collapsed-width;
  }

  @media (max-width: 768px) {
    margin-left: 0;
  }
}

// 头部基础样式
.header {
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: left $transition-duration $transition-timing;

  // 折叠按钮
  .toggle-button {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    padding: 0 1rem;
    height: 100%;

    &:hover {
      background-color: rgba(0, 0, 0, 0.025);
    }
  }
}

// 头部高度控制
.header-with-tags {
  height: $tags-view-header-height;
}

.header-no-tags {
  height: $header-height;
}

// 固定头部样式
.header-fixed {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 1000;
  left: $sidebar-width;

  // 折叠状态
  .sidebar-collapsed & {
    left: $sidebar-collapsed-width;
  }
}

// 静态头部样式
.header-static {
  position: relative;
  width: 100%;
}

// 固定头部 + 显示TagsView
.content-fixed-header-with-tags {
  padding-top: calc($tags-view-header-height + 1rem);
  padding-bottom: 1rem;
}

// 固定头部 + 不显示TagsView
.content-fixed-header-no-tags {
  padding-top: calc($header-height + 1rem);
  padding-bottom: 1rem;
}

// 静态头部 + 显示TagsView
.content-static-header-with-tags {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

// 静态头部 + 不显示TagsView
.content-static-header-no-tags {
  padding-top: 1rem;
  padding-bottom: 1rem;
}

// 主内容区域基础样式
.main-content {
  padding-right: 0.5rem;
  width: 100%;
  // 减少重绘和回流
  contain: content;

  // 确保子元素不会导致溢出
  >* {
    max-width: 100%;
  }
}
.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1000;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}
</style>
