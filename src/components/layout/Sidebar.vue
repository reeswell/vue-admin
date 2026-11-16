<script setup lang="ts">
import SidebarItem from './SidebarItem.vue'
import { sidebarRoutes } from '~/composables/sidebar'
import { isSidebarCollapsed } from '~/composables/sidebar/useSidebar'

const route = useRoute()

const activeMenu = computed(() => {
  const { path } = route
  return path
})
</script>

<template>
  <aside class="text-white p-2 fixed flex z-40 top-0 h-full overflow-hidden">
    <div class="flex flex-col w-full overflow-hidden bg-primary rounded-2xl shadow-lg">
      <h2
        class="relative bg-[var(--primary-deeper-color)] rounded-t-2xl h-14 flex items-center justify-center text-lg font-bold transition-colors duration-300"
      >
        {{ isSidebarCollapsed ? 'xx' : 'xx管理系统' }}
      </h2>
      <el-scrollbar wrap-class="scrollbar-wrapper" class="w-full h-full">
        <el-menu
          :collapse="isSidebarCollapsed"
          :collapse-transition="false"
          active-text-color="var(--el-color-primary)"
          background-color="var(--el-color-primary)"
          text-color="var(--el-color-white)"
          :default-active="activeMenu"
          class="h-full border-none"
        >
          <SidebarItem v-for="item in sidebarRoutes" :key="item.path" :item="item" :level="1" :top-item="item" />
        </el-menu>
      </el-scrollbar>
    </div>
  </aside>
</template>

<style lang="scss" scoped>
:deep(.el-scrollbar__view .el-menu) {
  border-right: 0;
}

:deep(.el-menu) {
  background-color: var(--el-color-primary) !important;
}

:deep(.el-menu-item) {
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--el-color-primary-light-3) !important;
  }

  &.is-active {
    background-color: var(--el-color-primary-dark-2) !important;
  }
}
</style>
