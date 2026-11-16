import routes from './routes'

export const sidebarRoutes = ref(routes)

export const routesMap = computed(() => {
  return sidebarRoutes.value.reduce((acc: Record<string, string>, route) => {
    acc[route.path] = route.name
    if (route.submenu?.length) {
      route.submenu.forEach((sub) => {
        acc[sub.path] = sub.name
      })
    }
    return acc
  }, {})
})
