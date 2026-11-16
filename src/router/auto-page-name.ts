import type { RouteRecordNormalized, Router } from 'vue-router'

function assignNameToRecordComponent(rec: RouteRecordNormalized, nameToUse: string) {
  const components = rec.components
  if (!components)
    return

  const viewKey = components.default ? 'default' : Object.keys(components)[0]
  if (!viewKey)
    return

  const comp = components[viewKey] as any
  if (!comp)
    return

  const finalName = String(nameToUse ?? `route-${rec.path}`)

  if (typeof comp === 'function' && !comp._autoNamed) {
    const loader = comp
    const wrapped = async (...args: any[]) => {
      const resolved = await loader(...args)
      const real = (resolved && resolved.default) ? resolved.default : resolved
      if (real && !real.name)
        real.name = finalName
      return resolved
    }
    wrapped._autoNamed = true
    components[viewKey] = wrapped
    return
  }

  if (comp && typeof comp === 'object' && !comp.name)
    comp.name = finalName
}

export function assignRouteComponentNames(router: Router): void {
  router.getRoutes().forEach((route) => {
    const routeName = typeof route.name === 'string' || typeof route.name === 'number'
      ? String(route.name)
      : String(route.name ?? `route-${route.path}`)
    assignNameToRecordComponent(route, routeName)
  })

  router.beforeResolve((to) => {
    const routeName = typeof to.name === 'string' || typeof to.name === 'number'
      ? String(to.name)
      : undefined
    to.matched.forEach((rec) => {
      const useName = routeName ?? (
        typeof rec.name === 'string' || typeof rec.name === 'number'
          ? String(rec.name)
          : `route-${rec.path}`
      )
      assignNameToRecordComponent(rec as RouteRecordNormalized, useName)
    })
  })
}
