import type { BuildInfo } from './index'

declare global {
  interface Window {
    maq: any[]
  }

  const __BUILD_INFO__: BuildInfo
}

export { }
