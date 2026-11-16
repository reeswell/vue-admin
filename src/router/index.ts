import { setupLayouts } from 'virtual:generated-layouts'
import generatedRoutes from 'virtual:generated-pages'
import { createRouter, createWebHistory } from 'vue-router'
import { assignRouteComponentNames } from './auto-page-name'
import { setupAuthGuard } from './guard'

export const router = createRouter({
  history: createWebHistory(),
  routes: setupLayouts(generatedRoutes),
})

assignRouteComponentNames(router)
setupAuthGuard(router)
