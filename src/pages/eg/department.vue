<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import FilterTable from '~/components/common/FilterTable.vue'
import type { FilterFormItem, TableColumn } from '~/types/table'

interface Department {
  id: number
  name: string
  type: string
  headcount: number
  lead: string
  status: string
  createdAt: string
  children?: Department[]
}

interface FilterOption {
  label: string
  value: string
}

const filterTableRef = ref()
const tableData = ref<Department[]>([])
const total = ref(0)
const loading = ref(false)
const optionsLoading = ref(false)
const statusOptions = ref<FilterOption[]>([])
const typeOptions = ref<FilterOption[]>([])

async function loadFilterOptions() {
  optionsLoading.value = true
  try {
    // 模拟接口请求加载筛选选项
    await new Promise(resolve => setTimeout(resolve, 600))
    statusOptions.value = [
      { label: '启用', value: 'active' },
      { label: '禁用', value: 'inactive' },
      { label: '待审核', value: 'pending' },
    ]
    typeOptions.value = [
      { label: '研发部门', value: 'rd' },
      { label: '市场部门', value: 'marketing' },
      { label: '销售部门', value: 'sales' },
      { label: '行政部门', value: 'admin' },
      { label: '财务部门', value: 'finance' },
    ]
  }
  finally {
    optionsLoading.value = false
  }
}

const filterItems = computed<FilterFormItem[]>(() => [
  {
    type: 'input',
    label: '部门名称',
    prop: 'name',
    placeholder: '请输入部门名称',
  },
  {
    type: 'multiselect',
    label: '部门类型',
    prop: 'type',
    placeholder: optionsLoading.value ? '加载中...' : '请选择类型',
    options: typeOptions.value as any,
    defaultValue: [],
    attrs: { loading: optionsLoading.value },
  },
  {
    type: 'multiselect',
    label: '状态',
    prop: 'status',
    placeholder: optionsLoading.value ? '加载中...' : '请选择状态',
    options: statusOptions.value as any,
    defaultValue: [],
    attrs: { loading: optionsLoading.value },
  },
])

const columns = ref<TableColumn[]>([
  { prop: 'name', label: '部门名称', width: 220, align: 'left' },
  { prop: 'type', label: '类型', width: 120, slot: true },
  { prop: 'lead', label: '负责人', width: 100 },
  { prop: 'headcount', label: '人数', width: 80 },
  { prop: 'status', label: '状态', width: 100, slot: true },
  { prop: 'createdAt', label: '创建时间' },
  { prop: 'operation', label: '操作', width: 130, slot: true, fixed: 'right' },
])

const tableProps = {
  rowKey: 'id',
  treeProps: { children: 'children', hasChildren: 'hasChildren' },
  defaultExpandAll: true,
}

// 全量树形数据（模拟数据库）
const allDepartments: Department[] = [
  {
    id: 1,
    name: '技术中心',
    type: 'rd',
    headcount: 110,
    lead: '张伟',
    status: 'active',
    createdAt: '2023-01-01',
    children: [
      { id: 11, name: '前端研发部', type: 'rd', headcount: 30, lead: '李明', status: 'active', createdAt: '2023-02-01' },
      {
        id: 12,
        name: '后端研发部',
        type: 'rd',
        headcount: 45,
        lead: '王强',
        status: 'active',
        createdAt: '2023-02-01',
        children: [
          { id: 121, name: 'Java 组', type: 'rd', headcount: 20, lead: '赵伟', status: 'active', createdAt: '2023-03-01' },
          { id: 122, name: 'Go 组', type: 'rd', headcount: 15, lead: '钱芳', status: 'pending', createdAt: '2023-03-15' },
        ],
      },
      { id: 13, name: '测试部', type: 'rd', headcount: 20, lead: '孙悦', status: 'active', createdAt: '2023-02-10' },
      { id: 14, name: '运维部', type: 'rd', headcount: 15, lead: '周杰', status: 'inactive', createdAt: '2023-02-15' },
    ],
  },
  {
    id: 2,
    name: '市场中心',
    type: 'marketing',
    headcount: 45,
    lead: '陈霞',
    status: 'active',
    createdAt: '2023-01-05',
    children: [
      { id: 21, name: '品牌推广部', type: 'marketing', headcount: 25, lead: '林晓', status: 'active', createdAt: '2023-02-20' },
      { id: 22, name: '数字营销部', type: 'marketing', headcount: 20, lead: '刘帆', status: 'inactive', createdAt: '2023-02-25' },
    ],
  },
  {
    id: 3,
    name: '销售中心',
    type: 'sales',
    headcount: 65,
    lead: '吴刚',
    status: 'active',
    createdAt: '2023-01-08',
    children: [
      { id: 31, name: '华北区销售部', type: 'sales', headcount: 30, lead: '郑浩', status: 'active', createdAt: '2023-03-01' },
      { id: 32, name: '华南区销售部', type: 'sales', headcount: 35, lead: '冯丽', status: 'inactive', createdAt: '2023-03-05' },
    ],
  },
  {
    id: 4,
    name: '行政中心',
    type: 'admin',
    headcount: 20,
    lead: '宋敏',
    status: 'active',
    createdAt: '2023-01-10',
    children: [
      { id: 41, name: '人力资源部', type: 'admin', headcount: 12, lead: '曹敏', status: 'active', createdAt: '2023-02-01' },
      { id: 42, name: '行政后勤部', type: 'admin', headcount: 8, lead: '孔雪', status: 'pending', createdAt: '2023-02-05' },
    ],
  },
  {
    id: 5,
    name: '财务中心',
    type: 'finance',
    headcount: 18,
    lead: '严磊',
    status: 'active',
    createdAt: '2023-01-12',
    children: [
      { id: 51, name: '财务核算部', type: 'finance', headcount: 10, lead: '韩月', status: 'active', createdAt: '2023-02-10' },
      { id: 52, name: '资金管理部', type: 'finance', headcount: 8, lead: '杨霖', status: 'active', createdAt: '2023-02-15' },
    ],
  },
]

function flattenTree(nodes: Department[]): Department[] {
  return nodes.reduce<Department[]>((acc, node) => {
    acc.push(node)
    if (node.children?.length)
      acc.push(...flattenTree(node.children))
    return acc
  }, [])
}

// 递归过滤树节点：节点自身满足条件 或 子节点有满足的，都保留
function filterTree(nodes: Department[], predicate: (node: Department) => boolean): Department[] {
  return nodes.reduce<Department[]>((acc, node) => {
    const filteredChildren = node.children ? filterTree(node.children, predicate) : []
    if (predicate(node) || filteredChildren.length > 0) {
      acc.push({ ...node, children: filteredChildren.length ? filteredChildren : undefined })
    }
    return acc
  }, [])
}

async function handleQuery(params: Record<string, any>) {
  loading.value = true
  try {
    await new Promise(resolve => setTimeout(resolve, 350))

    let result = allDepartments

    if (params.name) {
      result = filterTree(result, node => node.name.includes(params.name))
    }
    if (params.type?.length) {
      result = filterTree(result, node => params.type.includes(node.type))
    }
    if (params.status?.length) {
      result = filterTree(result, node => params.status.includes(node.status))
    }

    tableData.value = result
    total.value = flattenTree(result).length
  }
  finally {
    loading.value = false
  }
}

const TYPE_CONFIG: Record<string, { label: string, tagType: 'primary' | 'success' | 'warning' | 'info' | 'danger' }> = {
  rd: { label: '研发', tagType: 'primary' },
  marketing: { label: '市场', tagType: 'warning' },
  sales: { label: '销售', tagType: 'success' },
  admin: { label: '行政', tagType: 'info' },
  finance: { label: '财务', tagType: 'danger' },
}

const STATUS_CONFIG: Record<string, { label: string, tagType: 'primary' | 'success' | 'warning' | 'info' | 'danger' }> = {
  active: { label: '启用', tagType: 'success' },
  inactive: { label: '禁用', tagType: 'danger' },
  pending: { label: '待审核', tagType: 'warning' },
}

onMounted(() => {
  loadFilterOptions()
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-xl font-semibold mb-5 text-gray-800">
      部门管理
    </h1>

    <FilterTable
      ref="filterTableRef" v-model:columns="columns" :filter-items="filterItems" :data="tableData"
      :total="total" :loading="loading" :table-props="tableProps" :show-pagination="false" @query="handleQuery"
    >
      <!-- 部门类型列 -->
      <template #type="{ row }">
        <el-tag v-if="TYPE_CONFIG[row.type]" :type="TYPE_CONFIG[row.type].tagType" size="small">
          {{ TYPE_CONFIG[row.type].label }}
        </el-tag>
        <span v-else>{{ row.type }}</span>
      </template>

      <!-- 状态列 -->
      <template #status="{ row }">
        <el-tag v-if="STATUS_CONFIG[row.status]" :type="STATUS_CONFIG[row.status].tagType" size="small">
          {{ STATUS_CONFIG[row.status].label }}
        </el-tag>
      </template>

      <!-- 操作列 -->
      <template #operation="{ row }">
        <el-button size="small" type="primary" link>
          编辑
        </el-button>
        <el-button size="small" type="danger" link :disabled="!!row.children?.length">
          删除
        </el-button>
      </template>
    </FilterTable>
  </div>
</template>
