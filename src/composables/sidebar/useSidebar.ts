import { useIsMobile } from '~/composables/useIsMobile'

export const isSidebarCollapsed = ref(false)

export function useSidebar() {
  const { isMobile } = useIsMobile()

  watch(isMobile, (newValue) => {
    isSidebarCollapsed.value = newValue
  }, { immediate: true })

  const toggleSidebar = () => {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  const handleOverlayClick = () => {
    if (isMobile.value) {
      isSidebarCollapsed.value = true
    }
  }

  const expandSidebar = () => {
    isSidebarCollapsed.value = false
  }

  const collapseSidebar = () => {
    isSidebarCollapsed.value = true
  }

  const showOverlay = computed(() => {
    return isMobile.value && !isSidebarCollapsed.value
  })

  const sidebarClasses = computed(() => ({
    'sidebar-collapsed': isSidebarCollapsed.value,
    'is-mobile': isMobile.value,
  }))

  return {
    isMobile,
    showOverlay,
    sidebarClasses,
    toggleSidebar,
    handleOverlayClick,
    expandSidebar,
    collapseSidebar,
  }
}
