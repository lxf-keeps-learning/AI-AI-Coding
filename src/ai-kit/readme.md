# ai-kit —— 前端 AI 工程公共能力库

> **核心原则：不让 AI 从 0 生成，让 AI 基于规范生成。**
> 所有组件和 Hook 均附带 AI 注释，Cursor 会自动将其纳入上下文。

---

## 目录结构

```
src/ai-kit/
├── components/
│   ├── BaseDialog.vue          ← 通用弹窗（必须复用）
│   ├── BaseDrawer.vue          ← 通用抽屉（必须复用）
│   └── list-page-template.vue  ← 列表页模板（所有列表页参考）
│
├── forms/
│   └── BaseForm.vue            ← 通用表单（必须复用）
│
├── search/
│   └── BaseSearch.vue          ← 通用搜索区（必须复用）
│
├── tree/
│   └── BaseTree.vue            ← 通用树组件（必须复用）
│
├── charts/
│   └── BaseChart.vue           ← 通用 ECharts 图表（必须复用）
│
├── hooks/
│   ├── useTable.ts             ← 表格：数据/分页/loading/selection
│   ├── useDialog.ts            ← 弹窗/抽屉：visible/payload/Promise化
│   ├── useSearch.ts            ← 搜索：参数/防抖/reset
│   ├── useRequest.ts           ← 请求：loading/error/data 统一管理
│   ├── useChart.ts             ← 图表：init/resize/dispose 生命周期
│   └── useTree.ts              ← 树：数据/loading/搜索/勾选
│
├── utils/
│   ├── debounce.ts
│   └── throttle.ts
│
└── templates/
    └── readme.md
```

---

## 快速使用（复制到 Cursor Chat）

### 列表页（最常用）

```
参考：
  - src/ai-kit/components/list-page-template.vue
  - src/ai-kit/search/BaseSearch.vue
  - src/ai-kit/hooks/useTable.ts
  - src/ai-kit/hooks/useSearch.ts
  - src/ai-kit/hooks/useDialog.ts

生成「用户管理」列表页，接口：getUserList / deleteUser
字段：name(姓名)、phone(手机号)、status(状态)、deptName(部门)、createTime(创建时间)
搜索：name、status
```

### 弹窗（新增/编辑）

```
参考：
  - src/ai-kit/components/BaseDialog.vue
  - src/ai-kit/forms/BaseForm.vue
  - src/ai-kit/hooks/useDialog.ts

生成用户新增/编辑 Dialog，字段：name、phone、email、status
接口：createUser / updateUser
```

### 抽屉

```
参考：
  - src/ai-kit/components/BaseDrawer.vue
  - src/ai-kit/forms/BaseForm.vue
  - src/ai-kit/hooks/useDialog.ts

生成用户详情编辑抽屉，字段：name、phone、deptId(部门下拉)、roles(角色多选)
```

### 树组件

```
参考：
  - src/ai-kit/tree/BaseTree.vue
  - src/ai-kit/hooks/useTree.ts

生成部门树，调用 getDeptTree()，支持搜索过滤、checkbox 勾选
```

### 图表

```
参考：
  - src/ai-kit/charts/BaseChart.vue
  - src/ai-kit/hooks/useRequest.ts

生成「月度销售趋势」折线图，调用 getMonthlySales()，显示 loading 和空状态
```

### Code Review

```
review 当前 diff，重点检查：
- 是否复用了 ai-kit 组件和 hooks
- 是否有重复的 loading/pagination/request 封装
- TS 类型是否完整
- 性能问题（watch 深度、重复渲染）
```

---

## 禁止事项

| 禁止 | 改用 |
|------|------|
| 裸用 el-dialog | BaseDialog + useDialog |
| 裸用 el-drawer | BaseDrawer + useDialog |
| 裸调 echarts.init | BaseChart 或 useChart |
| 页面内裸声明 tableData/loading/pagination | useTable |
| 页面内裸声明多个搜索 ref | useSearch |
| 重复实现 debounce/throttle | src/ai-kit/utils/ |
| 重复封装 loading/error/data | useRequest |
