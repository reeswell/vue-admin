<script setup lang="ts">
import { ArrowDown, Tools } from '@element-plus/icons-vue'
import TagsView from './TagsView.vue'
import VersionInfo from '~/components/common/VersionInfo.vue'
import SearchWidget from '~/components/search/SearchWidget.vue'
import { openThemeDialog } from '~/composables/dialog'
import { sidebarRoutes } from '~/composables/sidebar'
import { currentUser, useUser } from '~/composables/user'
import { systemConfig } from '~/composables/useSystemConfig'

const { logout } = useUser()
const { currentRoute } = useRouter()
const isDropdownVisible = ref(false)

function handleDropdownVisible(visible: boolean) {
  isDropdownVisible.value = visible
}
const title = ref('')
watchEffect(() => {
  sidebarRoutes.value.forEach((item) => {
    if (item.path === currentRoute.value.path) {
      title.value = item.name
    }
    else if (currentRoute.value.path.startsWith(item.path)) {
      const subPath = item.submenu?.find(sub => sub.path === currentRoute.value.path)
      if (subPath) {
        title.value = `${item.name} / ${subPath.name}`
      }
    }
  })
})
</script>

<template>
  <div class="header-nav top-0 inset-x-0 fixed  z-30  w-screen lg:w-auto box-border">
    <nav class=" flex justify-between items-center py-2">
      <div class="flex justify-center items-center">
        <slot />
        <div class="ml-4 text-sm text-[#97a8be] hidden md:block">{{ title }} </div>
      </div>
      <div class="hidden md:flex md:justify-center md:items-center md:gap-10 text-sm">
        <VersionInfo />
      </div>
      <div class="flex items-center justify-center gap-5 mr-10">
        <div class="mr-20 hidden md:block">
          <SearchWidget />
        </div>

        <el-icon size="16" class="cursor-pointer hidden md:block" @click="openThemeDialog">
          <Tools class="text-primary" />
        </el-icon>

        <el-dropdown @visible-change="handleDropdownVisible">
          <div
            class="el-dropdown-link focus:outline-none text-primary flex justify-center items-center"
          >
            {{ currentUser?.username || '管理员' }}
            <el-icon
              class="el-icon--right transition-transform duration-300"
              :class="[isDropdownVisible ? 'rotate-0' : '-rotate-90']"
            >
              <ArrowDown />
            </el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item>
                <div class="flex justify-center items-center gap-1.5" @click="logout">
                  登出 <svg-icon name="signout" class="w-4 h-4" />
                </div>
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </nav>
    <TagsView v-if="systemConfig.showTagsView" class="flex justify-between items-center border-t border-gray-100" />
  </div>
</template>

<style lang="scss" scoped>
:deep(.ep-page-header__breadcrumb) {
  display: none;
}

// HeaderNav样式
.header-nav {
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.el-dropdown-link {
  color: var(--el-text-color-primary);
  transition: color 0.3s ease;
}
</style>
