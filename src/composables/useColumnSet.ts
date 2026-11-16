import type { Ref } from 'vue'
import { cloneDeep } from 'lodash-es'

interface ColumnConfigRow {
  code: string
  name: string
  width?: number | string
  is_active?: boolean
  [key: string]: any
}

interface UseColumnSetParams<T = any> {
  tableSetApi: {
    get: () => Promise<{ rows: ColumnConfigRow[] }>
    update: (params: Record<string, any>) => Promise<{ rows: ColumnConfigRow[] }>
    reset: () => Promise<{ rows: ColumnConfigRow[] }>
  }
  columns: Ref<T[]>
  tableKey: Ref<number>
}

export function useColumnSet({ tableSetApi, columns, tableKey }: UseColumnSetParams) {
  const columnSet = ref(false)
  const copyColumns = cloneDeep(columns.value || [])
  const tableColAll = ref<ColumnConfigRow[]>([])
  const configLoading = ref(false)

  function mergeConfigRowsToColumns(rows: ColumnConfigRow[]) {
    const fields = rows.map((row) => {
      const val: Record<string, any> = { ...row }
      val.prop = row.code
      val.label = row.name
      delete val.code
      delete val.name
      const found = (columns.value as any[]).find(item => item.prop === val.prop)
      if (found) {
        for (const key in found) {
          if (!Object.prototype.hasOwnProperty.call(val, key))
            val[key] = (found as any)[key]
        }
      }
      return val
    })

    const otherFields = (columns.value as any[]).filter(item => !fields.find(val => val.prop === item.prop))
    columns.value = [...fields, ...otherFields] as any
    tableKey.value++
  }
  // 监听表格列配置变化
  watch(() => tableColAll.value, (vals) => {
    if (!vals.length || !columns.value)
      return

    mergeConfigRowsToColumns(vals as ColumnConfigRow[])
  }, { deep: true })
  async function saveColumnConfig(params: any, render = true) {
    const response = await tableSetApi.update({ rows: params })
    if (render) {
      tableColAll.value = response.rows
      ElMessage.success('表格列调整成功')
    }
    columnSet.value = false
  }
  // 保存表格列宽度
  function handleColDragend(newWidth: number, oldWidth: number, column: any) {
    if (!columnSet.value)
      return
    const updatedCols = tableColAll.value.map((item: any) => {
      if (item.code === column.property) {
        return { ...item, width: newWidth }
      }
      return item
    })
    saveColumnConfig(updatedCols, false)
  }
  const renderColumns = computed(() => {
    return columns.value.filter((item: any) => item.is_active !== false)
  })

  function openColumnConfig() {
    columnSet.value = true
  }
  // 主动加载配置
  async function loadColumnConfig() {
    try {
      configLoading.value = true
      const { rows } = await tableSetApi.get()
      tableColAll.value = rows
    }
    finally {
      configLoading.value = false
    }
  }
  // 筛选条件
  async function resetColumnConfig() {
    try {
      const response = await tableSetApi.reset()
      tableColAll.value = response.rows

      // 恢复默认设置时恢复列的宽度
      if (columns.value) {
        columns.value.forEach((field: any) => {
          const originalCol = copyColumns.find((item: any) => item.prop === field.prop)
          if (originalCol) {
            field.width = originalCol.width
          }
        })
      }

      ElMessage.success('已恢复默认的表格列设置')
      columnSet.value = false
    }
    catch {
      ElMessage.error('恢复默认设置失败')
    }
  }

  return {
    columnSet,
    configLoading,
    tableColAll,
    handleColDragend,
    saveColumnConfig,
    renderColumns,
    openColumnConfig,
    loadColumnConfig,
    resetColumnConfig,
  }
}
