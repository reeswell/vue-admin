<script setup lang="ts">
import ColorRadioGroup from './ColorRadioGroup.vue'

const dialogVisible = defineModel<boolean>('dialogVisible')

const { currentTheme, updateTheme, resetTheme } = useTheme()
const { systemConfig, resetConfig, saveSystemConfig } = useSystemConfig()

// 应用所有配置
function applyAllConfig() {
  updateTheme(currentTheme.value)
  saveSystemConfig(systemConfig.value)
  ElMessage.success('配置已应用')
}

// 重置所有配置
function resetAllConfig() {
  resetTheme()
  resetConfig()
  ElMessage.success('配置已重置')
}
</script>

<template>
  <el-dialog v-model="dialogVisible" title="主题配置" width="640px" draggable :close-on-click-modal="false">
    <el-form label-position="left" :label-width="100">
      <el-divider />

      <el-form-item label="主色：">
        <el-color-picker v-model="currentTheme.colors.primary" />
        <ColorRadioGroup v-model="currentTheme.colors.primary" class="ml-4" />
      </el-form-item>
      <el-form-item label="快捷导航：">
        <el-switch v-model="systemConfig.showTagsView" />
      </el-form-item>

      <el-form-item label="固定头部：">
        <el-switch v-model="systemConfig.fixedHeader" />
      </el-form-item>
      <!-- <el-form-item label="消息色：">
        <el-color-picker v-model="currentTheme.colors.info" />
      </el-form-item>
      <el-form-item label="成功色：">
        <el-color-picker v-model="currentTheme.colors.success" />
      </el-form-item>
      <el-form-item label="警告色：">
        <el-color-picker v-model="currentTheme.colors.warning" />
      </el-form-item>
      <el-form-item label="危险色：">
        <el-color-picker v-model="currentTheme.colors.danger" />
      </el-form-item> -->
      <div class="flex gap-2 mt-4">
        <el-button type="primary" @click="applyAllConfig">应用配置</el-button>
        <el-button @click="resetAllConfig">重置配置</el-button>
      </div>
    </el-form>
  </el-dialog>
</template>

<style scoped>
.el-divider {
  margin: 16px 0;
}
</style>
