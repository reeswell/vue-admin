import type { BuildInfo } from '~/types'

export function useBuildInfo(): BuildInfo {
  return __BUILD_INFO__
}
