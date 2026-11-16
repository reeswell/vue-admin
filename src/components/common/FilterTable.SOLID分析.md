# FilterTable.vue 组件 SOLID 原则分析

## 1. 单一职责原则（Single Responsibility Principle, SRP）

### ✅ 符合的部分：

#### 1.1 函数层面的单一职责
- **`initFilterForm()`** (53-57行)
  - 职责：仅负责初始化筛选表单的默认值
  - 变化原因：只有筛选表单初始化逻辑变化时才会修改

- **`resetFilter()`** (60-63行)
  - 职责：仅负责重置筛选条件并触发搜索
  - 变化原因：只有重置逻辑变化时才会修改

- **`handleSearch()`** (66-69行)
  - 职责：仅负责处理搜索操作（重置页码并加载数据）
  - 变化原因：只有搜索触发逻辑变化时才会修改

- **`loadData()`** (76-86行)
  - 职责：仅负责加载表格数据
  - 变化原因：只有数据加载逻辑变化时才会修改

- **`handlePageChange()`** (89-92行)
  - 职责：仅负责处理页码变化
  - 变化原因：只有分页逻辑变化时才会修改

- **`handleSizeChange()`** (95-99行)
  - 职责：仅负责处理每页条数变化
  - 变化原因：只有分页大小逻辑变化时才会修改

#### 1.2 通过 Composables 分离职责
- **`useShowExpand()`** (35行)
  - 职责：专门处理筛选表单的展开/收起功能
  - 将表单高度管理、展开状态管理等职责从主组件中分离

- **`useColumnSet()`** (36行)
  - 职责：专门处理表格列配置功能
  - 将列配置的加载、保存、重置等职责从主组件中分离

### ⚠️ 可以改进的部分：

- **组件整体职责**：FilterTable 组件同时承担了多个职责：
  - 筛选表单管理
  - 表格数据展示
  - 分页控制
  - 列配置管理
  - 数据加载协调

  虽然通过 composables 分离了部分职责，但组件本身仍然是一个"上帝组件"。

---

## 2. 开放封闭原则（Open-Closed Principle, OCP）

### ✅ 符合的部分：

#### 2.1 通过插槽（Slots）实现扩展
- **`filterOperationLeft`** (183行)
  - 允许在不修改组件的情况下，在筛选按钮左侧添加自定义操作

- **`filterOperation`** (192行)
  - 允许在筛选按钮右侧添加自定义操作

- **`expand`** (213行)
  - 允许自定义展开行的内容，无需修改组件代码

- **`tableActions`** (202行)
  - 允许在表格操作栏添加自定义操作

- **列插槽** (222行)
  ```vue
  <slot v-if="col.slot" :name="col.prop" :row="scope.row" :column="col" :index="scope.$index" />
  ```
  - 允许为每列自定义渲染内容，通过 `col.slot` 标志启用

#### 2.2 通过 Props 实现配置扩展
- **`tableProps`** (22行, 207行)
  - 允许传递任意 Element Plus 表格属性，扩展表格功能而不修改组件

- **`tableEvents`** (23行, 208行)
  - 允许绑定任意表格事件，扩展交互功能而不修改组件

- **`filterItems`** (16行)
  - 通过配置化的方式支持多种表单控件类型（input, select, date, daterange, cascader, number, checkbox, autocomplete）
  - 新增表单控件类型只需在模板中添加，无需修改核心逻辑

#### 2.3 通过函数实现行为扩展
- **`formatter`** (224行)
  ```vue
  {{ col.formatter ? col.formatter(scope.row, col, scope.row[col.prop]) : scope.row[col.prop] }}
  ```
  - 允许通过 `formatter` 函数自定义列的显示格式，无需修改组件代码

- **`selectable`** (25行, 210行)
  - 允许自定义行选择逻辑，扩展选择行为

### ✅ 设计良好的扩展点：

组件通过多种机制实现了对扩展开放、对修改封闭：
- 新增表单控件类型：只需在模板中添加新的 `v-else-if` 分支
- 新增表格功能：通过 `tableProps` 和 `tableEvents` 传递
- 自定义渲染：通过插槽和 `formatter` 函数
- 自定义操作：通过多个命名插槽

---

## 3. 里式替换原则（Liskov Substitution Principle, LSP）

### ⚠️ 部分适用：

#### 3.1 Props 类型契约
- **`FilterTableProps`** 接口 (10-27行)
  - 定义了组件的输入契约，所有使用该组件的地方都必须遵循这个接口
  - 通过 `withDefaults` 提供默认值，确保接口的向后兼容性

#### 3.2 事件契约
- **`emit('query')`** (30-31行, 82行)
  - 定义了组件与父组件的通信契约
  - 返回 `Promise<TableData>`，确保所有父组件实现都能正确处理

### 📝 说明：

LSP 主要适用于面向对象的类继承场景。在 Vue 组件中，这个原则主要体现在：
- Props 接口的一致性
- 事件契约的一致性
- 组件行为的可预测性

该组件通过 TypeScript 接口和明确的 props/emits 定义，确保了使用该组件的地方可以相互替换而不破坏功能。

---

## 4. 接口隔离原则（Interface Segregation Principle, ISP）

### ✅ 符合的部分：

#### 4.1 Props 接口的细粒度设计
- **可选属性设计** (10-27行)
  - `showPagination?: boolean` - 不需要分页时可以不传递
  - `autoLoad?: boolean` - 不需要自动加载时可以不传递
  - `expand?: boolean` - 不需要展开功能时可以不传递
  - `selection?: boolean` - 不需要选择功能时可以不传递
  - `tableSetApi?` - 不需要列配置功能时可以不传递

- **函数式可选属性**
  - `selectable?: (row: any) => boolean` - 只在需要自定义选择逻辑时传递
  - `formatter?: (row, column, cellValue) => string` - 只在需要格式化时传递

#### 4.2 通过 Composables 隔离接口
- **`useShowExpand`** 的返回值 (35行)
  - 只暴露必要的状态和方法：`filterFormHeight`, `filterFormGridEl`, `shouldShowExpandButton`, `isExpanded`, `toggleExpand`
  - 不需要展开功能的组件不会依赖这些接口

- **`useColumnSet`** 的返回值 (36行)
  - 只在需要列配置功能时才使用
  - 通过条件判断 `isShowColumnSet` 决定是否初始化

#### 4.3 插槽的隔离设计
- 多个命名插槽允许父组件只使用需要的部分：
  - `filterOperationLeft` - 只在需要左侧操作时使用
  - `filterOperation` - 只在需要右侧操作时使用
  - `expand` - 只在需要展开行时使用
  - `tableActions` - 只在需要表格操作时使用

### ✅ 设计优点：

组件不会强制父组件依赖不需要的功能：
- 不需要分页？不传 `showPagination` 或设为 `false`
- 不需要筛选？不传 `filterItems` 或传空数组
- 不需要列配置？不传 `tableSetApi`
- 不需要选择？不传 `selection` 或设为 `false`

---

## 5. 依赖倒置原则（Dependency Inversion Principle, DIP）

### ✅ 符合的部分：

#### 5.1 依赖抽象而非具体实现

- **`tableSetApi` 接口抽象** (94-98行)
  ```typescript
  tableSetApi?: {
    get: () => Promise<any>
    update: (params: Record<string, any>) => Promise<any>
    reset: () => Promise<any>
  }
  ```
  - 组件依赖接口契约，而不是具体的 API 实现
  - 任何实现了这三个方法的对象都可以使用
  - 符合依赖倒置原则：高层组件（FilterTable）依赖抽象（接口），而不是低层模块（具体 API）

- **事件驱动的数据加载** (30-31行, 82行)
  ```typescript
  emit('query', filterEmptyProperties(params))
  ```
  - 组件不直接调用 API，而是通过事件通知父组件
  - 父组件负责具体的数据获取实现
  - 组件依赖抽象的"查询能力"，而不是具体的 HTTP 请求

#### 5.2 通过 Composables 实现依赖注入

- **`useColumnSet`** (36行)
  - 接收 `tableSetApi` 作为参数，而不是在内部硬编码
  - 允许不同的 API 实现被注入
  - 符合依赖倒置：composable 依赖传入的抽象接口

#### 5.3 配置驱动的依赖

- **`filterItems` 配置化** (16行, 54-56行)
  - 组件不硬编码表单控件类型
  - 通过配置数组驱动渲染
  - 依赖抽象的"表单项配置"，而不是具体的控件实现

- **`columns` 配置化** (33行)
  - 表格列通过配置数组定义
  - 组件依赖列配置的抽象结构，而不是具体的列实现

### ✅ 设计优点：

1. **可测试性**：可以轻松注入 mock 对象进行测试
2. **可替换性**：可以替换不同的 API 实现而不修改组件
3. **灵活性**：父组件可以决定如何获取数据，组件只负责展示和交互

---

## 总结

### SOLID 原则应用评分：

| 原则 | 符合程度 | 说明 |
|------|---------|------|
| **SRP** | ⭐⭐⭐⭐ | 函数层面职责清晰，通过 composables 分离了部分职责，但组件整体仍承担多个职责 |
| **OCP** | ⭐⭐⭐⭐⭐ | 通过插槽、props、函数等多种机制实现了优秀的扩展性 |
| **LSP** | ⭐⭐⭐ | 通过 TypeScript 接口确保契约一致性，但 Vue 组件场景下适用性有限 |
| **ISP** | ⭐⭐⭐⭐⭐ | 通过可选属性和条件渲染，确保客户端不依赖不需要的接口 |
| **DIP** | ⭐⭐⭐⭐⭐ | 通过接口抽象和事件驱动，实现了良好的依赖倒置 |

### 设计亮点：

1. ✅ 通过 composables 分离关注点
2. ✅ 丰富的扩展点（插槽、props、函数）
3. ✅ 配置驱动的设计
4. ✅ 接口抽象和依赖注入
5. ✅ 良好的类型定义

### 改进建议：

1. 考虑将组件拆分为更小的子组件（如 FilterForm、DataTable、Pagination）
2. 可以考虑使用 Provide/Inject 来传递某些依赖，进一步解耦
3. 某些硬编码的逻辑（如高度计算）可以考虑配置化
