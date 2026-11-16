export interface TagView {
  fullPath: string
  path: string
  name?: string
  title: string
  query?: Record<string, any>
  meta?: {
    affix?: boolean
    title?: string
    icon?: string
    noCache?: boolean
    [key: string]: any
  }
}

export interface RouteConfig {
  path: string
  name?: string
  meta?: {
    affix?: boolean
    title?: string
    icon?: string
    noCache?: boolean
    [key: string]: any
  }
  children?: RouteConfig[]
}

export interface TagsViewState {
  visitedViews: Ref<TagView[]>
  cachedViews: Ref<string[]>
}

export interface TagsViewActions {
  addView: (view: TagView) => void
  addVisitedView: (view: TagView) => void
  delView: (view: TagView) => Promise<{ visitedViews: TagView[] }>
  delOthersViews: (view: TagView) => Promise<void>
  delAllViews: () => Promise<{ visitedViews: TagView[] }>
  updateVisitedView: (view: TagView) => void
  delCachedView: (view: TagView) => Promise<void>
  delOthersCachedViews: (view: TagView) => Promise<void>
  delAllCachedViews: () => Promise<void>
}

export interface PermissionState {
  routes: RouteConfig[]
  addRoutes: RouteConfig[]
}

export interface PermissionActions {
  generateRoutes: (roles: string[]) => Promise<RouteConfig[]>
  setRoutes: (routes: RouteConfig[]) => void
}
