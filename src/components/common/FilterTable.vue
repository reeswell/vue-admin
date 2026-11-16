<script setup lang="ts">
import type { FormInstance, TableInstance } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'
import { ArrowDown, Setting } from '@element-plus/icons-vue'
import TableColumnConfig from './TableColumnConfig.vue'
import { filterEmptyProperties } from '~/lib/utils'
import type { FilterTableProps, PaginationParams, TableColumn, TableData } from '~/types/table'
import { useColumnSet } from '~/composables/useColumnSet'

const props = withDefaults(defineProps<FilterTableProps>(), {
  showPagination: true,
  autoLoad: true,
  immediate: true,
  pageSize: 20,
  pageSizes: () => [20, 50, 100],
  filterItems: () => [],
  data: () => [],
  total: 0,
  loading: false,
  autoScroll: true,
  expand: false,
  tableProps: () => ({}),
  tableEvents: () => ({}),
  selection: false,
  selectable: () => true,

})

const emit = defineEmits<{
  (e: 'query', params: Record<string, any>): Promise<TableData>
}>()
const tableKey = ref(0)
const columns = defineModel('columns') as Ref<TableColumn[]>
const isShowColumnSet = ref(!!props.tableSetApi)
const { filterFormHeight, filterFormGridEl, shouldShowExpandButton, isExpanded, toggleExpand } = useShowExpand(props.filterItems)
const { columnSet, configLoading, tableColAll, handleColDragend, saveColumnConfig, resetColumnConfig, openColumnConfig, loadColumnConfig } = useColumnSet({ tableSetApi: props.tableSetApi, columns, tableKey })

// 表格数据
const filterFormEl = ref<FormInstance>()
const tableEl = ref<TableInstance>()
// 分页参数
const pagination = reactive<PaginationParams>({
  page: 1,
  limit: props.pageSize,
})

// 筛选条件
const filterForm = reactive<Record<string, any>>({})
const renderColumns = computed(() => {
  return columns.value.filter(item => item.is_active !== false)
})
// 初始化筛选表单
function initFilterForm() {
  props.filterItems.forEach((item) => {
    const fallback: any[] | string = item.type === 'multiselect' ? [] : ''
    filterForm[item.prop] = item.defaultValue ?? fallback
  })
}

// 重置筛选条件
function resetFilter() {
  initFilterForm()
  handleSearch()
}

// 搜索
function handleSearch() {
  pagination.page = 1
  loadData()
}
async function getTableCols() {
  await loadColumnConfig()
  await loadData()
}

// 加载数据
async function loadData() {
  // 触发查询事件，由父组件处理
  const params = {
    ...filterForm,
    ...pagination,
  }
  emit('query', filterEmptyProperties(params))
  if (props.autoScroll) {
    scrollTo(0, 0)
  }
}

// 页码改变
function handlePageChange(page: number) {
  pagination.page = page
  loadData()
}

// 每页条数改变
function handleSizeChange(size: number) {
  pagination.limit = size
  pagination.page = 1
  loadData()
}

// 暴露方法给父组件
defineExpose({
  reload: loadData,
  reset: resetFilter,
  filterFormEl,
  tableEl,
})

// 初始化
onMounted(() => {
  initFilterForm()
  if (isShowColumnSet.value) {
    getTableCols()
  }
  else if (props.autoLoad && props.immediate) {
    loadData()
  }
})
</script>

<template>
  <div class="filter-table">
    <!-- 筛选表单 -->
    <el-form v-if="filterItems.length" ref="filterFormEl" :model="filterForm" inline class="filter-form">
      <!-- 添加过渡效果的容器 -->
      <div class="filter-form-container" :style="{ height: filterFormHeight }">
        <div ref="filterFormGridEl" class="filter-form-grid">
          <el-form-item
            v-for="item in filterItems" :key="item.prop" :label="item.label" :prop="item.prop"
            :rules="item.rules"
          >
            <!-- 输入框 -->
            <el-input
              v-if="item.type === 'input'" v-model.trim="filterForm[item.prop]" :placeholder="item.placeholder"
              v-bind="item.attrs" clearable @keyup.enter="handleSearch"
            />

            <!-- 单选框 -->
            <el-select
              v-else-if="item.type === 'select'" v-model="filterForm[item.prop]"
              :placeholder="item.placeholder" v-bind="item.attrs" clearable
            >
              <el-option
                v-for="option in item.options" :key="option.value" :label="option.label"
                :value="option.value"
              />
            </el-select>

            <!-- 多选框 -->
            <el-select
              v-else-if="item.type === 'multiselect'" v-model="filterForm[item.prop]"
              :placeholder="item.placeholder" v-bind="item.attrs" multiple collapse-tags
              collapse-tags-tooltip clearable
            >
              <el-option
                v-for="option in item.options" :key="option.value" :label="option.label"
                :value="option.value"
              />
            </el-select>
            <el-checkbox v-else-if="item.type === 'checkbox'" v-model="filterForm[item.prop]" v-bind="item.attrs" />
            <!-- 日期选择器 -->
            <el-date-picker
              v-else-if="item.type === 'date'" v-model="filterForm[item.prop]" :type="item.type"
              :placeholder="item.placeholder" v-bind="item.attrs" value-format="YYYY-MM-DD"
            />

            <!-- 日期范围选择器 -->
            <el-date-picker
              v-else-if="item.type === 'daterange'" v-model="filterForm[item.prop]" type="daterange"
              :placeholder="item.placeholder" v-bind="item.attrs" value-format="YYYY-MM-DD"
            />

            <!-- 级联选择器 -->
            <el-cascader
              v-else-if="item.type === 'cascader'" v-model="filterForm[item.prop]" :options="item.options"
              :placeholder="item.placeholder" v-bind="item.attrs"
            />

            <!-- 数字输入框 -->
            <el-input-number
              v-else-if="item.type === 'number'" v-model="filterForm[item.prop]"
              :placeholder="item.placeholder" v-bind="item.attrs"
            />

            <!-- 输入框 -->
            <el-autocomplete
              v-if="item.type === 'autocomplete'" v-model="filterForm[item.prop]"
              :placeholder="item.placeholder" v-bind="item.attrs" clearable @keyup.enter="handleSearch"
            />
          </el-form-item>
        </div>
      </div>

      <div class="filter-form-buttons">
        <slot name="filterOperationLeft" />
        <el-button v-if="shouldShowExpandButton" type="text" class="expand-button" @click="toggleExpand">
          {{ isExpanded ? '收起' : '展开' }}
          <el-icon class="expand-icon" :class="{ 'is-expanded': isExpanded }">
            <ArrowDown />
          </el-icon>
        </el-button>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetFilter">重置</el-button>
        <slot name="filterOperation" />
      </div>
    </el-form>

    <div v-if="isShowColumnSet" class="table-actions  w-full bg-[#e9eaeb] pl-3 flex py-1 items-center justify-between">
      <div class="flex items-center gap-2">
        <el-icon v-if="isShowColumnSet" size="20" class="cursor-pointer" @click="openColumnConfig">
          <Setting />
        </el-icon>
      </div>
      <slot name="tableActions" />
    </div>

    <!-- 表格 -->
    <el-table
      :key="tableKey" v-bind="tableProps" ref="tableEl" v-loading="loading" show-overflow-tooltip :data="data"
      border style="width: 100%" @header-dragend="handleColDragend" v-on="tableEvents"
    >
      <el-table-column v-if="selection" :selectable="selectable" type="selection" width="55" />
      <el-table-column v-if="expand" type="expand">
        <template #default="{ row }">
          <slot name="expand" :row="row" />
        </template>
      </el-table-column>
      <template v-for="col in renderColumns" :key="col.prop">
        <el-table-column
          :prop="col.prop" :label="col.label" :width="col.width" :align="col.align || 'center'"
          :fixed="col.fixed" :sortable="col.sortable"
        >
          <template #default="scope">
            <slot v-if="col.slot" :name="col.prop" :row="scope.row" :column="col" :index="scope.$index" />
            <template v-else>
              {{ col.formatter ? col.formatter(scope.row, col, scope.row[col.prop]) : scope.row[col.prop] }}
            </template>
          </template>
        </el-table-column>
      </template>

      <!-- 操作列插槽 -->
      <!-- <slot name="operation" /> -->
    </el-table>
    <!-- 表头配置对话框 -->
    <el-dialog v-model="columnSet" title="表头配置" width="700px" destroy-on-close append-to-body>
      <TableColumnConfig
        :data="tableColAll" :cols-loading="configLoading" @save="saveColumnConfig"
        @reset="resetColumnConfig" @cancel="columnSet = false"
      />
    </el-dialog>
    <!-- 分页 -->
    <div v-if="showPagination && total > 0" class="pagination-container">
      <el-pagination
        v-model:current-page="pagination.page" v-model:page-size="pagination.limit" :page-sizes="pageSizes"
        :total="total" layout="total, sizes, prev, pager, next, jumper" @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-table) {
  transform: scale(1);
}

.filter-table {

  .filter-form {
    padding: 16px;
    padding-bottom: 0;
    background: var(--el-bg-color, #fff);
    border-radius: 4px;
    margin-bottom: 16px;
    border: 1px solid var(--el-border-color-lighter);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);

    .filter-form-container {
      position: relative;
      overflow: hidden;
      transition: height 0.3s ease-in-out;
    }

    .filter-form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
      background: var(--el-bg-color);

      :deep(.el-form-item) {
        margin-bottom: 0;

        .el-input,
        .el-select,
        .el-cascader,
        .el-checkbox,
        .el-date-editor {
          width: 100%;
        }

        .el-form-item__label {
          width: 100px;
        }

        .el-form-item__content {
          flex: 1;
          margin-left: 10px !important;
        }
      }
    }

    .filter-form-buttons {
      padding-top: 16px;
      padding-bottom: 16px;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      align-items: center;
      flex-wrap: wrap;
      border-top: 1px solid var(--el-border-color-lighter);

      position: relative;
      text-align: right;
      border-top: 1px solid #ebeef5;

      :deep(.el-button) {
        margin-left: 0;
      }

      .expand-button {
        .expand-icon {
          margin-left: 4px;
          transition: transform 0.3s;

          &.is-expanded {
            transform: rotate(180deg);
          }
        }
      }
    }
  }

  .table-actions {
    .expand-controls {

      .expand-all-btn,
      .collapse-all-btn {
        padding: 4px 8px;
        font-size: 12px;
        color: var(--el-color-primary);

        &:hover:not(:disabled) {
          background-color: var(--el-color-primary-light-9);
        }

        &:disabled {
          color: var(--el-text-color-disabled);
          cursor: not-allowed;
        }
      }
    }
  }

  .pagination-container {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    margin-right: 30px;

    .el-pagination {
      --el-pagination-button-bg-color: var(--el-bg-color);
      --el-pagination-hover-color: var(--el-color-primary);

      .el-pagination__total {
        color: var(el-text-color-regular);
      }

      .btn-prev,
      .btn-next {
        background-color: var(--el-bg-color);

        &:hover {
          color: var(--el-color-primary);
        }
      }

      .el-pager li {
        background-color: var(--el-bg-color);

        &.active {
          background-color: var(--el-color-primary);
          color: white;
        }

        &:hover {
          color: var(--el-color-primary);
        }
      }
    }
  }
}
</style>
