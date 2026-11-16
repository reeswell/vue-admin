import type { TagView } from '~/types/tags-view'
import { WHITE_LIST } from '~/config/const'

// 全局状态，使用 ref 创建响应式状态
export const visitedViews = ref<TagView[]>([])
export const cachedViews = ref<string[]>([])

// 基础状态管理功能
function createTagsViewState() {
  const addVisitedView = (view: TagView) => {
    if (visitedViews.value.some(v => v.path === view.path)) {
      return
    }

    visitedViews.value.push({
      name: view.name,
      path: view.path,
      fullPath: view.fullPath,
      title: view.title,
      query: view.query,
      meta: view.meta,
    })
  }

  const addCachedView = (view: TagView) => {
    // 使用路由名称作为缓存键，而不是 fullPath
    const componentName = view.name as string
    if (!componentName || cachedViews.value.includes(componentName)) {
      return
    }
    // 确保组件名称有效
    if (typeof componentName === 'string' && componentName) {
      cachedViews.value.push(componentName)
    }
  }
  // Actions
  const addView = (view: TagView) => {
    addVisitedView(view)
    addCachedView(view)
  }

  const delView = (view: TagView): Promise<{ visitedViews: TagView[] }> => {
    return delCachedView(view).then(() => {
      for (const [i, v] of visitedViews.value.entries()) {
        if (v.path === view.path) {
          visitedViews.value.splice(i, 1)
          break
        }
      }
      return {
        visitedViews: [...visitedViews.value],
      }
    })
  }

  function delOthersViews(view: TagView): Promise<void> {
    return new Promise((resolve) => {
      visitedViews.value = visitedViews.value.filter((v) => {
        return v.meta?.affix || v.path === view.path
      })
      delOthersCachedViews(view)
      resolve()
    })
  }

  function delAllViews(): Promise<{ visitedViews: TagView[] }> {
    return new Promise((resolve) => {
      visitedViews.value = []
      delAllCachedViews()
      resolve({
        visitedViews: [...visitedViews.value],
      })
    })
  }

  function updateVisitedView(view: TagView) {
    for (let v of visitedViews.value) {
      if (v.path === view.path) {
        v = Object.assign(v, view)
        break
      }
    }
  }

  function delCachedView(view: TagView): Promise<void> {
    return new Promise((resolve) => {
      const componentName = view.name as string
      const index = cachedViews.value.indexOf(componentName)
      if (index > -1) {
        cachedViews.value.splice(index, 1)
      }
      resolve()
    })
  }
  function delOthersCachedViews(view: TagView): Promise<void> {
    return new Promise((resolve) => {
      const componentName = view.name as string
      if (!componentName) {
        cachedViews.value = []
        resolve()
        return
      }
      cachedViews.value = cachedViews.value.filter(name => name === componentName)
      resolve()
    })
  }

  function delAllCachedViews(): Promise<void> {
    return new Promise((resolve) => {
      cachedViews.value = []
      resolve()
    })
  }

  return {
    // State - 返回只读的 computed 以保持响应式
    visitedViews: readonly(visitedViews),
    cachedViews: readonly(cachedViews),

    // Actions
    addView,
    addVisitedView,
    delView,
    delOthersViews,
    delAllViews,
    updateVisitedView,
    delCachedView,
    delOthersCachedViews,
    delAllCachedViews,
  }
}

// 兼容性导出：保持原有的 useTagsViewState 函数名
export function useTagsViewState() {
  return createTagsViewState()
}

// 高级业务逻辑功能
export function useTagsView() {
  const tagsViewStore = createTagsViewState()
  const route = useRoute()
  const router = useRouter()

  // 初始化标签
  const initTags = () => {
    // 简化初始化，不再自动添加固定标签
    // 固定标签可以通过其他方式手动添加
  }

  // 添加标签
  const addTags = () => {
    const { name, path, fullPath, query, meta } = route

    if (!path || WHITE_LIST.some(item => path.startsWith(item)))
      return false
    // 普通路由
    const tagView: TagView = {
      name: name as string,
      path,
      fullPath,
      title: name as string,
      query,
      meta,
    }
    tagsViewStore.addView(tagView)
    return false
  }

  // 刷新选中的标签
  const refreshSelectedTag = (view: TagView) => {
    tagsViewStore.delCachedView(view).then(() => {
      nextTick(() => {
        router.replace({ path: view.path, query: { ...view.query, _t: Date.now() } })
      })
    })
  }

  // 关闭选中的标签
  const closeSelectedTag = (view: TagView) => {
    tagsViewStore.delView(view).then(({ visitedViews }) => {
      if (isActive(view)) {
        toLastView(visitedViews, view)
      }
    })
  }

  const closeCurrentTag = (cb: () => void) => {
    const route = useRoute()
    const currentView = visitedViews.value.find(v => v.path === route.path)
    tagsViewStore.delView(currentView).then(() => {
      cb()
    })
  }

  // 关闭其他标签
  const closeOthersTags = (view: TagView) => {
    router.push(view)
    tagsViewStore.delOthersViews(view).then(() => {
      // moveToCurrentTag 需要在组件中实现
    })
  }

  // 关闭所有标签
  const closeAllTags = (view: TagView) => {
    tagsViewStore.delAllViews().then(({ visitedViews }) => {
      toLastView(visitedViews, view)
    })
  }

  // 跳转到最后一个视图
  function toLastView(visitedViews: TagView[], view: TagView) {
    const latestView = visitedViews.slice(-1)[0]

    if (latestView) {
      router.push(latestView.fullPath)
    }
    else {
      // now the default is to redirect to the home page if there is no tags-view,
      // you can adjust it according to your needs.
      if (view.path === '/') {
        // to reload home page
        router.replace({ path: view.fullPath })
      }
      else {
        router.push('/')
      }
    }
  }

  // 检查是否是当前活跃的标签
  function isActive(view: TagView) {
    return view.fullPath === route.fullPath
  }

  // 检查是否是固定标签
  function isAffix(view: TagView) {
    return view.meta && view.meta.affix
  }

  return {

    initTags,
    addTags,
    refreshSelectedTag,
    closeSelectedTag,
    closeCurrentTag,
    closeOthersTags,
    closeAllTags,
    toLastView,
    isActive,
    isAffix,

    // 直接暴露状态管理方法，以便向后兼容
    addView: tagsViewStore.addView,
    addVisitedView: tagsViewStore.addVisitedView,
    delView: tagsViewStore.delView,
    delOthersViews: tagsViewStore.delOthersViews,
    delAllViews: tagsViewStore.delAllViews,
    updateVisitedView: tagsViewStore.updateVisitedView,
    delCachedView: tagsViewStore.delCachedView,
    delOthersCachedViews: tagsViewStore.delOthersCachedViews,
    delAllCachedViews: tagsViewStore.delAllCachedViews,
  }
}
