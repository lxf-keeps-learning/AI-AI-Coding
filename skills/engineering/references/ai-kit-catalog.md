# ai-kit 现有资产目录

> 在判断"是否需要新抽一个"之前,先确认这个能力 ai-kit 里是否已有。已有就是"违反复用规范"的事故,不是"建议抽取"。

本目录与 `src/ai-kit/readme.md` 和 `.cursor/rules/global/base.mdc` 保持同步。如果两者出现冲突,以 `src/ai-kit/` 实际代码为准,并在报告里提示用户更新 readme/rule。

## 组件

| 组件 | 路径 | 覆盖场景 | 禁用的裸用法 |
|------|------|----------|--------------|
| BaseSearch | `src/ai-kit/search/BaseSearch.vue` | 所有列表页搜索区(基础/折叠/高级) | 页面里裸写 `<el-form>` + 搜索按钮 |
| BaseDialog | `src/ai-kit/components/BaseDialog.vue` | 所有 Dialog 弹窗 | `<el-dialog>` 直接出现在业务页面 |
| BaseDrawer | `src/ai-kit/components/BaseDrawer.vue` | 所有 Drawer 抽屉 | `<el-drawer>` 直接出现在业务页面 |
| BaseForm | `src/ai-kit/forms/BaseForm.vue` | 基础表单、动态表单、步骤表单 | 页面里裸写 `<el-form>` 并自行管理校验 |
| BaseTree | `src/ai-kit/tree/BaseTree.vue` | 所有树结构(含懒加载、勾选、过滤) | `<el-tree>` 直接出现在业务页面 |
| BaseChart | `src/ai-kit/charts/BaseChart.vue` | 所有 ECharts 图表 | `echarts.init(...)` 出现在页面或业务组件 |
| list-page-template | `src/ai-kit/components/list-page-template.vue` | 所有列表页结构参考 | 列表页结构与该模板差异巨大 |

## Hook

| Hook | 路径 | 覆盖场景 | 禁用的裸写法 |
|------|------|----------|--------------|
| useTable | `src/ai-kit/hooks/useTable.ts` | 表格 tableData / pagination / loading / selection | 页面内裸声明这几个 ref |
| useDialog | `src/ai-kit/hooks/useDialog.ts` | Dialog / Drawer 的 visible + payload + Promise 化 | 页面里裸写 `visible.value = true` 并手动管理 payload |
| useSearch | `src/ai-kit/hooks/useSearch.ts` | 搜索参数 + 防抖 + reset | 页面内多个独立 ref 表达搜索字段 |
| useRequest | `src/ai-kit/hooks/useRequest.ts` | 异步请求的 loading / error / data 统一管理 | 业务里重复封装一次请求函数 + loading |
| useChart | `src/ai-kit/hooks/useChart.ts` | ECharts 的 init / resize / dispose 生命周期 | 业务里写 onMounted/onUnmounted 自管图表实例 |
| useTree | `src/ai-kit/hooks/useTree.ts` | 树数据/loading/搜索/勾选 | 业务里自管树状态 |

## 工具函数

| 文件 | 提供能力 |
|------|----------|
| `src/ai-kit/utils/debounce.ts` | 防抖 |
| `src/ai-kit/utils/throttle.ts` | 节流 |

业务代码里出现自写 `setTimeout`/`clearTimeout` 形式的防抖节流 = 违反复用。

## 模板

`src/ai-kit/templates/` 计划包含 list-page-template.vue / crud-template.vue / dialog-form-template.vue / chart-template.ts,作为生成代码的"骨架"。新建议的资产如果属于模板范畴,放在这里而非 components/。

## 配套 `.cursor/rules/` 索引

| 领域 | 规则目录 | 关键文件 |
|------|----------|----------|
| 全局规范 | `.cursor/rules/global/` | base.mdc / architecture.mdc / naming.mdc / typescript.mdc / git.mdc |
| 组件 | `.cursor/rules/components/` | component.mdc / dialog.mdc / drawer.mdc / preview.mdc / upload.mdc |
| 表单 | `.cursor/rules/forms/` | form.mdc / dynamic-form.mdc / search-form.mdc / step-form.mdc |
| 搜索 | `.cursor/rules/search/` | base-search.mdc / advanced-search.mdc / collapse-search.mdc |
| 表格 | `.cursor/rules/table/` | crud-table.mdc / editable-table.mdc / virtual-table.mdc |
| 树 | `.cursor/rules/tree/` | tree.mdc / lazy-tree.mdc / check-tree.mdc |
| 图表 | `.cursor/rules/charts/` | chart.mdc / bar-chart.mdc / line-chart.mdc / pie-chart.mdc / map-chart.mdc / bigscreen-chart.mdc |
| Hook | `.cursor/rules/hooks/` | use-dialog.mdc / use-request.mdc / use-search.mdc / use-table.mdc |
| 页面模式 | `.cursor/rules/pages/` | list-page.mdc / detail-page.mdc / form-page.mdc / map-page.mdc / bigscreen-page.mdc |
| 性能 | `.cursor/rules/performance/` | render.mdc / memory.mdc / large-data.mdc / chart-performance.mdc / table-performance.mdc |
| Review | `.cursor/rules/review/` | code-review.mdc / performance-review.mdc / security-review.mdc |
| 重构 | `.cursor/rules/refactor/` | component-refactor.mdc / hooks-refactor.mdc / page-refactor.mdc / performance-refactor.mdc |

新抽取组件/Hook 时,如果该领域目录已存在,只需新增一个 `.mdc`;若领域目录不存在,在报告里建议新建。

## 项目硬性规范(`global/base.mdc`)

写报告时如果发现违反,优先级一律 P0:

- 禁止 `any`
- 禁止裸用 `el-dialog` / `el-drawer`
- 禁止裸调 `echarts.init`
- 禁止页面内裸声明 tableData / loading / pagination
- 禁止重复实现 debounce / throttle
- 禁止重复封装 request / loading / error / data
- 单个页面文件禁止超过 500 行
- API 调用必须放 `services/`,页面禁止直接 fetch / axios
- 每个组件必须有 loading / empty / error 状态
