# 前端 AI 提示词工程

> **核心原则：不让 AI 从 0 生成，让 AI 基于规范标准生成。**

---

## 团队使用

1. `git clone https://github.com/xs-lxf/AI-AI-Coding.git`
2. Cursor 打开项目
3. 直接在 Chat 会话框输入提示词，参考下方示例

---

## 为什么有效

- Cursor 自动加载 `.cursor/rules/` 中的规则（alwaysApply 或 @ 引用）
- `src/ai-kit/` 组件和 Hook 的 AI 注释让 AI 精准定位已有能力
- `prompts/` 是经过验证的提示词模板，复制即用

---

## 项目结构

```
project/
├── .cursor/rules/          ← AI 规范（自动加载）
│   ├── global/             ← 全局规范（base、架构、命名、TS、Git）
│   ├── components/         ← BaseDialog、BaseDrawer 规范
│   ├── forms/              ← BaseForm、搜索表单规范
│   ├── table/              ← CRUD 列表页规范
│   ├── tree/               ← BaseTree 规范
│   ├── charts/             ← BaseChart 规范
│   ├── hooks/              ← useTable、useDialog 等规范
│   ├── review/             ← Code Review 规范
│   └── performance/        ← 性能优化规范
│
├── prompts/                ← 提示词模板（复制到 Chat 使用）
│   ├── readme.md           ← 索引（先看这里）
│   ├── table/              ← 列表页提示词
│   ├── components/         ← Dialog、Drawer 提示词
│   ├── forms/              ← 表单提示词
│   ├── tree/               ← 树组件提示词
│   ├── charts/             ← 图表提示词
│   └── review/             ← Code Review 提示词
│
└── src/ai-kit/             ← 公共组件库（AI 知识库核心）
    ├── components/         ← BaseDialog、BaseDrawer、列表页模板
    ├── forms/              ← BaseForm
    ├── search/             ← BaseSearch
    ├── tree/               ← BaseTree
    ├── charts/             ← BaseChart
    └── hooks/              ← useTable、useDialog、useSearch、useRequest、useChart、useTree
```

---

## 一键生成示例

### 列表页（CRUD）

```
参考：
  - src/ai-kit/components/list-page-template.vue
  - src/ai-kit/hooks/useTable.ts
  - src/ai-kit/hooks/useSearch.ts
  - src/ai-kit/hooks/useDialog.ts

生成「设备管理」列表页：
  接口：getDeviceList / deleteDevice / createDevice / updateDevice
  字段：name(设备名)、sn(序列号)、status(状态)、location(位置)、createTime
  搜索：name、status
```

### 弹窗（新增/编辑）

```
参考：
  - src/ai-kit/components/BaseDialog.vue
  - src/ai-kit/forms/BaseForm.vue
  - src/ai-kit/hooks/useDialog.ts

生成设备新增/编辑弹窗，字段：name、sn、location、status
```

### 抽屉

```
参考：
  - src/ai-kit/components/BaseDrawer.vue
  - src/ai-kit/forms/BaseForm.vue
  - src/ai-kit/hooks/useDialog.ts

生成设备详情编辑抽屉，表单字段同上，支持离开拦截
```

### 树组件

```
参考：
  - src/ai-kit/tree/BaseTree.vue
  - src/ai-kit/hooks/useTree.ts

生成「区域树」，调用 getAreaTree()，支持搜索、checkbox
```

### 图表

```
参考：
  - src/ai-kit/charts/BaseChart.vue
  - src/ai-kit/hooks/useRequest.ts

生成「设备在线趋势」折线图，调用 getDeviceOnlineTrend()，支持时间范围切换
```

### Code Review

```
review 当前 diff，检查：
  - 是否复用了 ai-kit 的组件和 hooks
  - 有无重复的 loading/error/pagination 封装
  - TS 类型是否完整（有无 any）
  - 有无性能问题（深层 watch、频繁渲染）
```

---

## 增加公共组件时必须写 AI 注释

新增组件/hook 时，注释模板：

```ts
/**
 * useXxx —— 一句话说明功能
 *
 * 功能：
 * - 条目1
 * - 条目2
 *
 * AI 规则：
 * 所有 xxx 场景优先使用本 hook，禁止 yyy
 *
 * 用法示例：
 * ```ts
 * const { ... } = useXxx(...)
 * ```
 */
```

---

## 团队接入步骤

1. 将以下目录随业务代码一起提交 Git：
   - `.cursor/`
   - `prompts/`
   - `src/ai-kit/`
   - `docs/ai/`

2. 团队统一使用 Cursor（推荐 Claude Sonnet）

3. 打开项目后 `.cursor/rules/` 自动生效，无需额外配置

---

## 核心规范

- 禁止裸用 `el-dialog` / `el-drawer` → 用 `BaseDialog` / `BaseDrawer`
- 禁止裸调 `echarts.init` → 用 `BaseChart` / `useChart`
- 禁止页面内裸声明 tableData / loading / pagination → 用 `useTable`
- 禁止重复封装 request / debounce / throttle → 用 `useRequest` / `src/ai-kit/utils/`
- 页面文件禁止超过 500 行
- 禁止 TypeScript `any`
