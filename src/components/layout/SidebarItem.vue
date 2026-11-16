<script setup lang="ts">
import type { SidebarRouteItem } from '~/types'

const props = defineProps<{
  item: SidebarRouteItem
  level: number
  topItem: SidebarRouteItem
}>()

const router = useRouter()

function renderElIcon(iconName: string) {
  const _iconName = iconName.replace('ElIcon', '')
  return defineAsyncComponent(() =>
    import(`@element-plus/icons-vue`).then(module => module[_iconName as keyof typeof module]),
  )
}

function createCommand(scope: string, item: SidebarRouteItem) {
  const { path, name, icon = '' } = item
  return {
    scope,
    name: () => name,
    description: () => name,
    icon: () => icon,
    visible: () => true,
    onActivate: () => router.push(path),
  }
}

function registerRoute() {
  const { level, item, topItem } = props
  const { submenu: menus, name: parentName } = item

  if (level === 1) {
    if (!menus?.length) {
      useCommand(createCommand(parentName, item))
      return
    }

    menus
      .filter(sub => !sub.submenu?.length)
      .forEach(sub => useCommand(createCommand(parentName, sub)))

    return
  }

  item.submenu?.forEach(sub =>
    useCommand(createCommand(topItem.name, sub)),
  )
}
onMounted(() => {
  registerRoute()
})
</script>

<template>
  <el-sub-menu v-if="item.submenu?.length" :index="item.path">
    <template #title>
      <div class="flex items-center gap-1.5 text-white ">
        <template v-if="item.icon">
          <el-icon v-if="item.icon.startsWith('ElIcon')">
            <component :is="renderElIcon(item.icon)" />
          </el-icon>
          <svg-icon
            v-else :name="item.icon"
            class="inline-flex justify-center items-center w-6 mr-[5px] h-[18px] flex-none aside-menu-item-active font-bold"
          />
        </template>
      </div>
      <span>{{ item.name }}</span>
    </template>
    <template v-for="sub in item.submenu" :key="sub.name">
      <SidebarItem :item="sub" :level="level + 1" :top-item="topItem" />
    </template>
  </el-sub-menu>
  <router-link v-else :to="item.path" :target="item.path.startsWith('http') ? '_blank' : undefined" class="menu-link">
    <el-menu-item :key="item.path" :index="item.path" class="submenu-title-noDropdown">
      <div class="flex items-center gap-1.5 text-white ">
        <template v-if="item.icon">
          <el-icon v-if="item.icon.startsWith('ElIcon')">
            <component :is="renderElIcon(item.icon)" />
          </el-icon>
          <svg-icon
            v-else :name="item.icon"
            class="inline-flex justify-center items-center w-6 mr-[5px] h-[18px] flex-none aside-menu-item-active font-bold"
          />
        </template>
      </div>
      <template #title>
        <span class="text-white">{{ item.name }}</span>
      </template>
    </el-menu-item>
  </router-link>
</template>

<style lang="scss" scoped>
:deep(.el-sub-menu__title:hover) {
  background-color: var(--el-color-primary-dark-2);
}

:deep(.el-menu-item) {
  width: 100%;
}

:deep(.el-menu-item:hover) {
  background-color: var(--el-color-primary-dark-2);
}

:deep(.el-menu-item.is-active) {
  background-color: var(--el-color-primary-dark-2);
}

.menu-link {

  display: block;
  text-decoration: none;
  color: inherit;

  &:hover {
    text-decoration: none;
  }

}
</style>
