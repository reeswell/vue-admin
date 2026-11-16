<script setup lang="ts">
import { Sort } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { cloneDeep } from 'lodash-es'
import { computed, ref, watch } from 'vue'
import Sortable from './Sortable.vue' // 导入Sortable组件

// 定义props
const props = defineProps({
  data: {
    type: Array,
    default: (): any[] => [],
  },
  colsLoading: {
    type: Boolean,
    default: false,
  },
  showColumnWidth: {
    type: Boolean,
    default: false,
  },
})

// 定义emit
const emit = defineEmits(['save', 'reset', 'cancel'])

// 响应式数据
const colData = ref<any[]>([])
const tableContainer = ref(null)

// 监听props变化
watch(() => props.data, (newVal) => {
  colData.value = cloneDeep(newVal)
}, { deep: true, immediate: true })

// 计算列配置
const columnWidths = computed(() => {
  // 定义列宽度百分比
  const sortWidth = '60px'
  const visibleWidth = '60px'
  const widthColWidth = '120px'

  // 根据是否显示宽度列调整名称列宽度
  const nameWidth = props.showColumnWidth ? 'calc(100% - 240px)' : 'calc(100% - 120px)'

  return {
    sort: sortWidth,
    name: nameWidth,
    width: widthColWidth,
    visible: visibleWidth,
  }
})

// 处理排序结束事件
function handleSortEnd(evt: { oldIndex?: number, newIndex?: number }) {
  if (evt.oldIndex !== evt.newIndex) {
    const currRow = colData.value.splice(evt.oldIndex, 1)[0]
    colData.value.splice(evt.newIndex, 0, currRow)
  }
}

const loading = ref(false)

// 保存设置
function saveClick() {
  if (colData.value.every(item => !item.is_active)) {
    ElMessage.error('不能隐藏所有的列')
    return
  }

  if (colData.value.find(v => v.width && Number.isNaN(Number(v.width)))) {
    ElMessage.error('宽度只能是数字')
    return
  }

  loading.value = true
  emit('save', colData.value)
  setTimeout(() => {
    loading.value = false
  }, 2000)
}

// 恢复默认设置
function resetClick() {
  loading.value = true
  emit('reset')
  setTimeout(() => {
    loading.value = false
  }, 2000)
}

// 取消操作
function cancelClick() {
  emit('cancel')
}

// Sortable配置选项
const sortableOptions = {
  animation: 150,
  handle: '.sort-icon',
  ghostClass: 'sortable-ghost',
  forceFallback: true,
  fallbackClass: 'mouse-ghost',
}
</script>

<template>
  <div ref="tableContainer" v-loading="colsLoading" class="table-adjust-box">
    <div class="config-table">
      <!-- 表头 -->
      <div class="table-header">
        <div class="header-cell">排序</div>
        <div class="header-cell">字段名称</div>
        <div v-if="showColumnWidth" class="header-cell">宽度</div>
        <div class="header-cell">显示</div>
      </div>

      <!-- 表格内容 -->
      <div class="table-body">
        <Sortable
          :list="colData" item-key="name" :options="sortableOptions" tag="div" class="sortable-container"
          @end="handleSortEnd"
        >
          <template #item="{ element: row }">
            <div class="table-row">
              <!-- 排序图标 -->
              <div class="row-cell" :style="{ width: columnWidths.sort }">
                <el-tooltip content="鼠标拖拽调整排序" placement="right">
                  <span class="sort-icon">
                    <el-icon>
                      <Sort />
                    </el-icon>
                  </span>
                </el-tooltip>
              </div>

              <!-- 字段名称 -->
              <div class="row-cell name-cell" :style="{ width: columnWidths.name }">
                {{ row.name }}
              </div>

              <!-- 宽度 -->
              <div v-if="showColumnWidth" class="row-cell" :style="{ width: columnWidths.width }">
                <el-input v-model.number="row.width" size="small">
                  <template #append>px</template>
                </el-input>
              </div>

              <!-- 显示/隐藏 -->
              <div class="row-cell center-content" :style="{ width: columnWidths.visible }">
                <el-checkbox v-model="row.is_active" />
              </div>
            </div>
          </template>
        </Sortable>
      </div>
    </div>

    <div class="footer">
      <el-button :loading="loading" round type="info" @click="resetClick">恢复默认</el-button>
      <el-button round @click="cancelClick">取消</el-button>
      <el-button :loading="loading" type="primary" round @click="saveClick">保存</el-button>
    </div>
  </div>
</template>

<style>
/* 全局样式 */
.mouse-ghost {
  background-color: #f5f7fa;
  border: 1px dashed #d9d9d9;
  opacity: 0.8;
  z-index: 9999;
}

/* 拖动时的样式 */
.sortable-ghost {
  background-color: #f0f9eb !important;
  opacity: 0.8;
}
</style>

<style lang="scss" scoped>
.table-adjust-box {
  position: relative;
  padding: 10px;

  .config-table {
    border: 1px solid #EBEEF5;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

    // 表头样式
    .table-header {
      display: flex;
      width: 100%;
      height: 48px;
      background-color: #F5F7FA;
      border-bottom: 1px solid #EBEEF5;
      justify-content: space-between;
      align-items: center;
      .header-cell {
        flex: 1;
        padding: 0 12px;
        display: flex;
        align-items: center;
        font-weight: bold;
        color: #606266;
        border-right: 1px solid #EBEEF5;
        box-sizing: border-box;
        justify-content: center;
      }
    }

    // 表格内容样式
    .table-body {
      max-height: 450px;
      overflow-y: auto;
      background-color: #fff;

      &::-webkit-scrollbar {
        width: 6px;
        height: 6px;
      }

      &::-webkit-scrollbar-thumb {
        background: #c0c4cc;
        border-radius: 3px;
      }

      &::-webkit-scrollbar-track {
        background: #f5f7fa;
      }

      .sortable-container {
        min-height: 50px;
      }

      .table-row {
        display: flex;
        width: 100%;
        min-height: 48px;
        border-bottom: 1px solid #EBEEF5;
        transition: background-color 0.2s;
        box-sizing: border-box;
        justify-content: space-between;
        align-items: center;
        &:last-child {
          border-bottom: none;
        }

        &:hover {
          background-color: #F5F7FA;
        }

        .row-cell {
          padding: 8px 12px;
          display: flex;
          flex: 1;
          align-items: center;
          border-right: 1px solid #EBEEF5;
          box-sizing: border-box;
          justify-content: center;
          overflow: hidden;

          &:last-child {
            border-right: none;
          }

          &.center-content {
            justify-content: center;
          }

          &.name-cell {
            word-break: break-all;
          }

          .el-input {
            width: 100%;
          }
        }
      }
    }

  }

  // 底部按钮区域
  .footer {
    text-align: center;
    padding-top: 20px;

    .el-button {
      margin: 0 8px;
    }
  }

  // 排序图标
  .sort-icon {
    cursor: move;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 24px;
    height: 24px;
    color: #909399;
    border-radius: 4px;
    margin: 0 auto;

    &:hover {
      color: #409EFF;
      background-color: rgba(64, 158, 255, 0.1);
    }
  }
}
</style>
