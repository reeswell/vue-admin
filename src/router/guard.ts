import type { Router } from 'vue-router'
import { useUser } from '~/composables/user'

const WHITE_LIST = ['/login', '/404', '/401']

export function setupAuthGuard(router: Router): void {
  router.beforeEach(async (to) => {
    const { getUserInfo } = useUser()
    const user = await getUserInfo()
    const isLogin = !!user

    if (!isLogin && !WHITE_LIST.includes(to.path))
      return `/login?redirect=${to.path}`

    if (isLogin && to.path === '/login')
      return '/'
  })
}
