# Prompts 提示词目录

> 目标：让团队成员复制提示词 → 粘贴到 Cursor Chat → 一键生成标准化业务代码

## 使用方式

1. 找到对应场景的 `.md` 文件
2. 复制提示词模板
3. 修改其中的**业务名称、字段、接口名**
4. 粘贴到 Cursor Chat 发送

---

## 目录结构

```
prompts/
├── readme.md               ← 当前文件（索引）
│
├── table/
│   └── crud-table.md       ← 增删改查列表页（最常用）
│
├── components/
│   ├── dialog.md           ← 弹窗（新增/编辑）
│   └── drawer.md           ← 抽屉（详情编辑/步骤流程）
│
├── forms/
│   ├── form.md             ← 基础表单、动态表单、步骤表单
│   ├── search-form.md      ← 搜索表单
│   └── dynamic-form.md     ← 动态字段表单
│
├── tree/
│   ├── readme.md
│   ├── tree.md             ← 基础树、左树右表、懒加载树
│   └── lazy-tree.md        ← 懒加载树（大数据量）
│
├── search/
│   ├── readme.md
│   ├── base-search.md      ← 基础搜索
│   └── advanced-search.md  ← 高级搜索（可折叠）
│
├── charts/
│   ├── readme.md
│   ├── chart.md            ← 通用图表（折线/柱/饼/组合）
│   └── line-chart.md       ← 折线图专项
│
├── hooks/
│   ├── readme.md
│   └── use-request.md      ← useRequest 请求 hook
│
├── review/
│   ├── readme.md
│   └── review.md           ← Code Review 提示词
│
└── performance/
    └── large-data.md       ← 大数据性能优化
```

---

## 快速索引

| 场景 | 提示词文件 |
|------|-----------|
| 列表页（CRUD） | `table/crud-table.md` |
| 弹窗（新增/编辑） | `components/dialog.md` |
| 抽屉（编辑/流程） | `components/drawer.md` |
| 表单 | `forms/form.md` |
| 树组件 | `tree/tree.md` |
| 折线/柱/饼图 | `charts/chart.md` |
| Code Review | `review/review.md` |

---

## 核心组件快查

| 组件/Hook | 路径 |
|-----------|------|
| BaseSearch | `src/ai-kit/search/BaseSearch.vue` |
| BaseDialog | `src/ai-kit/components/BaseDialog.vue` |
| BaseDrawer | `src/ai-kit/components/BaseDrawer.vue` |
| BaseForm | `src/ai-kit/forms/BaseForm.vue` |
| BaseTree | `src/ai-kit/tree/BaseTree.vue` |
| BaseChart | `src/ai-kit/charts/BaseChart.vue` |
| useTable | `src/ai-kit/hooks/useTable.ts` |
| useDialog | `src/ai-kit/hooks/useDialog.ts` |
| useSearch | `src/ai-kit/hooks/useSearch.ts` |
| useRequest | `src/ai-kit/hooks/useRequest.ts` |
| useChart | `src/ai-kit/hooks/useChart.ts` |
| useTree | `src/ai-kit/hooks/useTree.ts` |
