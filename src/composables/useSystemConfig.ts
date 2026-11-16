import { ref } from 'vue'

// 系统配置接口
export interface SystemConfig {
  showTagsView: boolean
  fixedHeader: boolean
}

// 常量
const SYSTEM_CONFIG_KEY = 'system-config'
const DEFAULT_CONFIG: SystemConfig = {
  showTagsView: true,
  fixedHeader: true,
}

// 全局响应式状态
const systemConfig = ref<SystemConfig>(loadSystemConfig())

// 加载系统配置
function loadSystemConfig(): SystemConfig {
  try {
    const saved = localStorage.getItem(SYSTEM_CONFIG_KEY)
    return saved ? { ...DEFAULT_CONFIG, ...JSON.parse(saved) } : DEFAULT_CONFIG
  }
  catch (error) {
    console.error('Failed to load system config:', error)
    return DEFAULT_CONFIG
  }
}

// 保存系统配置
function saveSystemConfig(config: SystemConfig) {
  try {
    localStorage.setItem(SYSTEM_CONFIG_KEY, JSON.stringify(config))
  }
  catch (error) {
    console.error('Failed to save system config:', error)
  }
}

export function useSystemConfig() {
  // 更新配置
  function updateConfig(newConfig: Partial<SystemConfig>) {
    const mergedConfig = { ...systemConfig.value, ...newConfig }
    systemConfig.value = mergedConfig
    saveSystemConfig(mergedConfig)
  }

  // 重置配置
  function resetConfig() {
    systemConfig.value = { ...DEFAULT_CONFIG }
    saveSystemConfig(systemConfig.value)
  }

  return {
    systemConfig,
    updateConfig,
    resetConfig,
    saveSystemConfig,
  }
}

// 导出全局配置状态，供其他组件使用
export { systemConfig }
