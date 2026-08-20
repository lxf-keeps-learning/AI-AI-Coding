# TS/Vue 审查规则库

> 规则全部提炼自 AICoding 自有资产：`.cursor/rules/`（规范约束）与 `src/ai-kit/`（可复用实现）。审查时按"触发条件"逐条机械判定，命中则记录缺陷。
>
> 每条规则格式：**编号 / 严重程度 / 触发条件 / 判定标准**。判定标准必须是可机械验证的模式匹配（正则 / 符号模式 / 文件特征），不做主观推断。

## 规则分组

| 分组 | 规则 ID | 严重程度 | 来源 |
|------|---------|----------|------|
| AK ai-kit 复用 | AK-01 ~ AK-08 | Error | src/ai-kit/readme.md、.cursor/rules/global/base.mdc |
| TS 类型规范 | TS-01 ~ TS-07 | Error/Warning | .cursor/rules/global/typescript.mdc、naming.mdc |
| ARC 架构 | ARC-01 ~ ARC-03 | Error/Warning | .cursor/rules/global/architecture.mdc |
| CM 组件规范 | CM-01 ~ CM-08 | Error/Warning | .cursor/rules/components/*、forms/* |
| HK Hook 规范 | HK-01 ~ HK-07 | Error/Warning | .cursor/rules/hooks/* |
| PERF 性能 | PERF-01 ~ PERF-06 | Error/Warning | .cursor/rules/performance/* |
| SEC 安全 | SEC-01 ~ SEC-04 | Error/Warning | .cursor/rules/review/security-review.mdc |
| CLN 代码卫生 | CLN-01 ~ CLN-03 | Error/Warning | 通用审查 |

**规则总数：38 条。**

---

## AK — ai-kit 复用检查（核心规则）

> 本项目核心理念：**不让 AI 从 0 生成，让 AI 基于规范生成**。凡 `src/ai-kit/` 已覆盖的能力，在业务代码中重复封装一律记为 **Error**。

### AK-01 禁止裸用 el-dialog
- **严重程度**：Error
- **触发条件**：`.vue` 文件存在 `el-dialog` 标签或 `ElDialog` 引用
- **判定标准**：匹配 `<el-dialog` 或 `import.*ElDialog` 或 `ElDialog`（大小写敏感），且未使用 `BaseDialog` / `useDialog`
- **建议**：改用 `src/ai-kit/components/BaseDialog.vue` + `useDialog`

### AK-02 禁止裸用 el-drawer
- **严重程度**：Error
- **触发条件**：`.vue` 文件存在 `el-drawer` 标签或 `ElDrawer` 引用
- **判定标准**：匹配 `<el-drawer` 或 `import.*ElDrawer`，且未使用 `BaseDrawer` / `useDialog`
- **建议**：改用 `src/ai-kit/components/BaseDrawer.vue` + `useDialog`

### AK-03 禁止页面裸调 echarts.init
- **严重程度**：Error
- **触发条件**：`.vue` / `.ts` 文件包含 `echarts.init` 调用
- **判定标准**：匹配 `echarts.init(` 或 `init(`（导入自 echarts），且未使用 `BaseChart` / `useChart`
- **建议**：改用 `src/ai-kit/charts/BaseChart.vue` 或 `src/ai-kit/hooks/useChart.ts`

### AK-04 禁止页面裸声明表格状态
- **严重程度**：Error
- **触发条件**：`.vue` 文件是列表页（含 `el-table`），且未导入 `useTable`
- **判定标准**：匹配 `el-table` 且未引用 `useTable`，同时存在 `ref<` / `ref(` 声明的 `tableData` / `loading` / `pagination` / `total` 中的 ≥2 个
- **建议**：改用 `src/ai-kit/hooks/useTable.ts` 统一管理数据 / 分页 / loading / selection

### AK-05 禁止重复实现 debounce / throttle
- **严重程度**：Error
- **触发条件**：`.ts` / `.vue` 文件手写防抖/节流逻辑，且项目已接入 ai-kit
- **判定标准**：匹配 `setTimeout` / `clearTimeout` 组合且内部为延时调用模式（如 `setTimeout(() => fn(), delay)`），或定义了名为 `debounce` / `throttle` 的函数；未导入 `src/ai-kit/utils/debounce` / `throttle`
- **建议**：改用 `src/ai-kit/utils/debounce.ts` / `throttle.ts`

### AK-06 禁止重复封装请求状态
- **严重程度**：Error
- **触发条件**：`.ts` / `.vue` 文件内自建请求函数并手动管理 `loading` / `error` / `data`，且项目已接入 ai-kit
- **判定标准**：同时存在 `async function.*fetch|request` 与 `ref(false)`（loading）+ `ref(null)`（error/data）组合，未导入 `useRequest`
- **建议**：改用 `src/ai-kit/hooks/useRequest.ts`

### AK-07 禁止裸用 el-tree 管理树状态
- **严重程度**：Error
- **触发条件**：`.vue` 文件包含 `el-tree`，且未导入 `useTree` / `BaseTree`
- **判定标准**：匹配 `<el-tree`，且页面内自管 `treeData` / `filterText` / `loading` / `checkedKeys` 中 ≥2 个，未引用 `useTree` / `BaseTree`
- **建议**：改用 `src/ai-kit/tree/BaseTree.vue` + `useTree`

### AK-08 列表页未复用标准模板与 Hook
- **严重程度**：Error
- **触发条件**：`.vue` 文件是列表页（含 `el-table` + `el-pagination`），且未导入 `useTable` / `useSearch` / `useDialog` 任一
- **判定标准**：匹配 `el-table` 与 `el-pagination` 同时存在，且 import 中无 `useTable`、`useSearch`、`BaseSearch`、`useDialog`
- **建议**：参考 `src/ai-kit/components/list-page-template.vue` 重构

---

## TS — 类型规范

### TS-01 禁止 any
- **严重程度**：Error
- **触发条件**：`.ts` / `.tsx` / `.vue` 文件
- **判定标准**：匹配 `: any` / `as any` / `any[]` / `<any>` / `Record<string, any>` 等 any 用法（排除注释）
- **建议**：用具体类型或泛型替代

### TS-02 API 返回值必须定义类型
- **严重程度**：Error
- **触发条件**：`.ts` 文件定义异步请求函数（`async function` 或 `export function.*=>` 返回 `Promise`）
- **判定标准**：请求函数（匹配 `async function|Promise<`）声明处无显式返回类型（`Promise<T>`），且函数体包含 `fetch` / `axios` / `.get(` / `.post(`
- **建议**：为 API 函数补 `Promise<ResponseType>` 返回类型

### TS-03 props / emits 必须声明类型
- **严重程度**：Error
- **触发条件**：`.vue` 文件使用 `defineProps` / `defineEmits`
- **判定标准**：`defineProps(` 后紧跟 `)` 或 `defineProps(['`（数组形式），未提供泛型类型；`defineEmits(` 同样处理
- **建议**：改用 `defineProps<Props>()` / `defineEmits<Emits>()`

### TS-04 公共 hooks 必须提供具名返回类型
- **严重程度**：Warning
- **触发条件**：`.ts` 文件定义 `useXxx` 组合式函数
- **判定标准**：匹配 `export function use\w+`，函数签名无返回类型，且 `return` 语句返回对象字面量
- **建议**：定义返回类型接口并标注

### TS-05 禁止用类型断言掩盖 API 响应不匹配
- **严重程度**：Warning
- **触发条件**：`.ts` / `.vue` 文件包含 `as` 类型断言
- **判定标准**：匹配 ` as ` 后跟接口/类型名（`as User` / `as any` 除外），且同一函数内无 services 层适配
- **建议**：响应适配放 services 层，避免页面断言

### TS-06 页面文件禁止超过 500 行
- **严重程度**：Error
- **触发条件**：`views/` 或 `.vue` 页面文件
- **判定标准**：文件行数 > 500
- **建议**：按组件 / hooks / 子组件拆分

### TS-07 命名规范
- **严重程度**：Warning
- **触发条件**：`.vue` 组件文件 / `.ts` 变量声明
- **判定标准**：组件文件名非 PascalCase（`^[a-z]` 开头）；布尔变量不以 `is` / `has` / `can` 开头（匹配 `const (?!is|has|can)\w*` 且值为 `true` / `false` / `ref(false)`）
- **建议**：按 .cursor/rules/global/naming.mdc 规范命名

---

## ARC — 架构规范

### ARC-01 API 调用必须放 services 层
- **严重程度**：Error
- **触发条件**：`.vue` 文件（页面 / 组件）
- **判定标准**：`.vue` 文件中直接出现 `fetch(` / `axios` / `request(` / `.get(` / `.post(` 调用（排除 import 语句与注释）
- **建议**：接口调用迁移到 `services/`，页面只调用封装函数

### ARC-02 页面职责边界
- **严重程度**：Warning
- **触发条件**：`.vue` 文件 > 200 行且含业务计算逻辑
- **判定标准**：行数 > 200，且 `<script>` 内出现复杂对象/数组操作（`\.map\(` / `\.filter\(` / `\.reduce\(`）≥3 处
- **建议**：将业务逻辑抽到 hooks / services

### ARC-03 跨模块直接 import 内部文件
- **严重程度**：Warning
- **触发条件**：`src/` 下文件存在跨模块 import
- **判定标准**：import 路径匹配 `\.\.\/\.\.\/`（相对路径跳出当前目录多层），且目标不在公共目录（components / hooks / services / types / utils / ai-kit）
- **建议**：提取为公共组件到 components/ 或 ai-kit/

---

## CM — 组件规范

### CM-01 数据驱动组件必须提供 loading / empty / error 状态
- **严重程度**：Error
- **触发条件**：`.vue` 组件含异步数据（`useRequest` / `onMounted` 中请求 / `async`）
- **判定标准**：组件引入异步数据但未出现 `loading` 且未出现 `error` 且未出现 `empty`
- **建议**：按 .cursor/rules/components/component.mdc 补齐状态

### CM-02 禁止父子双控 visible
- **严重程度**：Error
- **触发条件**：`.vue` 文件使用 `BaseDialog` / `BaseDrawer` 或弹窗状态
- **判定标准**：同时出现 `visible` 的 prop 传入与组件内部 `ref` 修改 visible（父组件同时传 `v-model:visible` 且内部改 visible）
- **建议**：visible 由 `useDialog` 单一来源管理

### CM-03 禁止在 Dialog / Drawer 内部直接调用接口
- **严重程度**：Error
- **触发条件**：`.vue` 文件在 `BaseDialog` / `BaseDrawer` 模板内
- **判定标准**：`BaseDialog` / `BaseDrawer` 的默认插槽内容中包含 `fetch(` / `axios` / `service` 调用
- **建议**：接口调用放在父组件 confirm 回调

### CM-04 弹窗表单校验必须在接口调用前
- **严重程度**：Error
- **触发条件**：`.vue` 文件含 `BaseForm` 与提交逻辑
- **判定标准**：`confirm` / `submit` 函数内先出现 `await.*Api|save|create|update` 请求调用，后出现 `validate`，或请求未在 `validate` 通过后执行
- **建议**：先 `await validate()`，通过后再调接口

### CM-05 Dialog 提交 loading 锁定
- **严重程度**：Error
- **触发条件**：`.vue` 文件含 `BaseDialog` / `BaseDrawer` 提交逻辑
- **判定标准**：提交函数内调用接口但无 `setLoading(true)` / `loading` 状态控制，或无 `finally` 恢复 loading
- **建议**：`setLoading(true)` + `try/finally { setLoading(false) }`，防止提交中误关闭

### CM-06 表单 props / rules 类型完整
- **严重程度**：Error
- **触发条件**：`.vue` 文件使用 `BaseForm` 或 `el-form`
- **判定标准**：`rules` 变量声明无 `FormRules<` 泛型，或 props 中 `model` 类型为 `any`
- **建议**：`FormRules<T>` 泛型 + 具体业务类型

### CM-07 禁止表单内直接调用接口
- **严重程度**：Error
- **触发条件**：`.vue` 表单组件（含 `el-form-item`）
- **判定标准**：表单组件内出现 `fetch(` / `axios` / `.*Api(` 调用
- **建议**：表单只负责数据收集和校验，由父组件处理提交

### CM-08 表单验证方法需暴露给父组件
- **严重程度**：Warning
- **触发条件**：`.vue` 文件使用 `BaseForm` 且被 Dialog / Drawer 包裹
- **判定标准**：表单组件含 `formRef` 与 `validate` 函数但无 `defineExpose({ validate })`
- **建议**：通过 `defineExpose({ validate, reset })` 暴露

---

## HK — Hook 规范

### HK-01 页面级异步状态应使用 useRequest
- **严重程度**：Warning
- **触发条件**：`.vue` 文件非列表页，手动管理异步状态
- **判定标准**：同时存在 `ref(false)`（loading）+ 异步调用，未导入 `useRequest`
- **建议**：改用 `src/ai-kit/hooks/useRequest.ts`

### HK-02 使用 useRequest 必须渲染 error 与重试入口
- **严重程度**：Error
- **触发条件**：`.vue` 文件导入 `useRequest`
- **判定标准**：模板中 `error` 未渲染（无 `v-if.*error`），或无 `retry` / `refresh` 重试入口绑定
- **建议**：渲染 error + 重试按钮

### HK-03 immediate 请求必须提供 defaultParams
- **严重程度**：Error
- **触发条件**：`.vue` / `.ts` 文件使用 `useRequest(.*{ immediate: true`
- **判定标准**：`immediate: true` 存在但无 `defaultParams`
- **建议**：补 `defaultParams` 参数

### HK-04 useTable 要求 { list, total } 契约
- **严重程度**：Error
- **触发条件**：`.ts` / `.vue` 文件使用 `useTable`
- **判定标准**：API 响应解构为 `rows` / `records` / `data.data` 等非 `{ list, total }` 结构，且未在 services 层适配
- **建议**：在 services 层适配为 `{ list, total }`

### HK-05 搜索使用 handleSearch / handleReset
- **严重程度**：Warning
- **触发条件**：`.vue` 文件使用 `useTable` 或表格分页
- **判定标准**：直接修改 `query` / `pageNum` / `pageSize` 内部查询参数，未调用 `handleSearch` / `handleReset` / `handlePageChange`
- **建议**：通过 hook 提供的搜索 / 重置 / 分页方法

### HK-06 并发请求保护
- **严重程度**：Error
- **触发条件**：`.vue` / `.ts` 文件含多次异步请求同一数据源
- **判定标准**：快速连续请求（如搜索 / 分页 / 刷新）未通过 `useRequest` / `useTable`（后发请求优先），或自写 `loading` 无防并发保护
- **建议**：使用 useRequest / useTable 的后发优先机制

### HK-07 Hook 返回类型不得使用 any
- **严重程度**：Error
- **触发条件**：`.ts` 文件定义 `useXxx`
- **判定标准**：返回类型含 `any` 或无显式返回类型
- **建议**：提供具名返回类型，禁止 any

---

## PERF — 性能规范

### PERF-01 卸载时清理监听 / 定时器 / 第三方实例
- **严重程度**：Error
- **触发条件**：`.vue` 文件在 `onMounted` / `onActivated` 注册监听或定时器
- **判定标准**：`onMounted` 或 setup 中出现 `addEventListener` / `setInterval` / `setTimeout`（非防抖节流），但无 `onUnmounted` 对应清理
- **建议**：`onUnmounted` 中移除监听 / 清除定时器 / dispose 图表实例

### PERF-02 列表渲染必须使用稳定 key
- **严重程度**：Warning
- **触发条件**：`.vue` 文件含 `v-for`
- **判定标准**：`v-for` 无 `:key`，或 `:key="index"` / `:key="i"`
- **建议**：使用唯一业务字段作为 key

### PERF-03 避免深层 watch 与深层响应式
- **严重程度**：Warning
- **触发条件**：`.vue` / `.ts` 文件含 `watch` / `watchEffect`
- **判定标准**：`watch(` 第三参数含 `deep: true`，或 `reactive(` 包裹大型嵌套数据
- **建议**：不可变更新 + shallowRef，避免深层监听

### PERF-04 避免渲染中创建新对象 / 函数
- **严重程度**：Warning
- **触发条件**：`.vue` 文件模板或 render 内
- **判定标准**：模板中直接调用返回对象/函数的表达式（如 `:data="fn()"` / `:option="buildOption()"`）且无缓存
- **建议**：使用 `computed` / `useMemo` 缓存，减少子组件全量更新

### PERF-05 大数据集使用虚拟化或分页
- **严重程度**：Warning
- **触发条件**：`.vue` 文件存在全量渲染列表
- **判定标准**：`v-for` 绑定数据在 `mounted` / `onMounted` 一次全量赋值且未使用分页 / 虚拟滚动，无 `el-pagination`
- **建议**：服务端分页或虚拟滚动（`.cursor/rules/performance/large-data.mdc`）

### PERF-06 实时搜索需防抖节流
- **严重程度**：Error
- **触发条件**：`.vue` 文件对输入事件绑定请求
- **判定标准**：`@input` / `@change` 直接调用请求函数，未使用 `useSearch` 防抖或 debounce
- **建议**：使用 `src/ai-kit/hooks/useSearch.ts` 或 debounce

---

## SEC — 安全规范

### SEC-01 禁止硬编码敏感信息
- **严重程度**：Error
- **触发条件**：`.ts` / `.tsx` / `.vue` / `.js` 文件
- **判定标准**：匹配 `sk-[a-zA-Z0-9]` / `Bearer eyJ` / `password\s*[:=]` / `secret\s*[:=]` / `apiKey\s*[:=]` / `token\s*[:=].*["']`（非空）
- **建议**：移至环境变量或密钥管理服务

### SEC-02 用户输入必须转义渲染
- **严重程度**：Error
- **触发条件**：`.vue` 文件含 `v-html` 或富文本渲染
- **判定标准**：匹配 `v-html`，且无白名单 / 转义处理
- **建议**：用户输入经转义或使用白名单 sanitize

### SEC-03 敏感操作鉴权
- **严重程度**：Warning
- **触发条件**：`.vue` / `.ts` 文件含删除 / 提交操作
- **判定标准**：删除 / 敏感提交（`delete` / `remove` / `ElMessageBox.confirm` 缺失）无二次确认或权限校验
- **建议**：敏感操作二次确认 + 权限校验

### SEC-04 上传 / 下载鉴权一致，敏感文件不落日志明文
- **严重程度**：Warning
- **触发条件**：`.ts` / `.vue` 文件含上传或下载逻辑
- **判定标准**：上传（`upload` / `FormData`）与下载（`download` / `blob`）无鉴权头，或日志中包含文件名明文
- **建议**：统一鉴权，敏感文件日志脱敏

---

## CLN — 代码卫生

### CLN-01 未使用导入 / 变量
- **严重程度**：Warning
- **触发条件**：`.ts` / `.vue` 文件存在 import 或变量声明
- **判定标准**：import 的标识符在文件其余部分未被引用（逐标识符检查）
- **建议**：删除未使用导入 / 变量

### CLN-02 TODO / FIXME / HACK 残留
- **严重程度**：Error
- **触发条件**：`.ts` / `.vue` / `.tsx` 文件
- **判定标准**：匹配 `TODO` / `FIXME` / `HACK` / `XXX` 注释
- **建议**：完成待办或创建独立 Issue 后删除

### CLN-03 变更范围完整性
- **严重程度**：Warning
- **触发条件**：存在 git diff 输入
- **判定标准**：修改了类型 / 接口定义，但其消费方文件未包含在变更范围内（按 import 依赖分析）
- **建议**：补充遗漏的关联文件到变更范围

---

## 触发规则映射表

| 代码元素 | 触发规则 |
|---------|---------|
| 列表页（el-table + el-pagination） | AK-04, AK-08, HK-04, HK-05, PERF-05, CLN-01 |
| 弹窗 / 抽屉 | AK-01, AK-02, CM-02, CM-03, CM-05 |
| 表单 | CM-04, CM-06, CM-07, CM-08 |
| 图表 | AK-03, PERF-01 |
| 树 | AK-07 |
| Hook 定义 | TS-04, HK-07 |
| 异步请求 | TS-02, HK-01, HK-02, HK-03, HK-06 |
| 所有源文件 | TS-01, TS-06, TS-07, PERF-03, PERF-04, SEC-01, SEC-04, CLN-01, CLN-02 |
| 页面 / 组件 | ARC-01, ARC-02, ARC-03, CM-01, PERF-02, PERF-06, SEC-02, SEC-03 |
| git diff | CLN-03 |
