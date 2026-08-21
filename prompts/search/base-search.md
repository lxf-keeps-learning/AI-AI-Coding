# BaseSearch 搜索区域提示词

> 所有搜索区域必须基于：
> - 组件：`src/ai-kit/search/BaseSearch.vue`
> - Hook：`src/ai-kit/hooks/useSearch.ts`
> - 联动表格：`src/ai-kit/hooks/useTable.ts`

---

## 场景一：基础搜索区域

```
参考：
  - src/ai-kit/search/BaseSearch.vue
  - src/ai-kit/hooks/useSearch.ts
  - src/ai-kit/hooks/useTable.ts

生成「订单列表」搜索区域：
  字段：orderNo(订单号, input)、status(状态, select)、dateRange(日期范围, daterange)
  要求：
    - 用 BaseSearch 包裹，@search 绑 searchImmediately()，@reset 绑 reset()
    - useSearch 管理参数，搜索防抖 300ms
    - 日期范围用 el-date-picker type="daterange"，提交时拆成 startDate/endDate
    - 重置还原所有字段并立即刷新列表
    - 字段超过 3 个时 collapsible 展开/收起，移动端字段占满一行
    - 按 Enter 触发搜索，loading 时禁用重置和重复提交
    - 与 useTable 联动：搜索成功表格刷新
```

## 场景二：带更多筛选条件的搜索区

```
参考：
  - src/ai-kit/search/BaseSearch.vue
  - src/ai-kit/hooks/useSearch.ts

生成「用户管理」搜索区域：
  字段：name(用户名)、deptId(部门, 级联)、status(状态)、roleId(角色)、createTimeRange(时间范围)
  要求：
    - 首行展示高频条件（name、status），其余折叠在「更多」里
    - 折叠状态记忆（可展开收起）
    - 级联选择用 src/ai-kit/cascade-filter/CascadeFilter.vue（deptId 联动）
    - 重置时级联字段也还原
    - 搜索参数对象保持扁平，供 useTable 分页复用
```

## 场景三：搜索与表格分离管理

```
参考：
  - src/ai-kit/search/BaseSearch.vue
  - src/ai-kit/hooks/useSearch.ts
  - src/ai-kit/hooks/useTable.ts

生成「报表查询」页面：
  搜索区（BaseSearch）+ 表格区（useTable）分离：
  要求：
    - useSearch 只负责参数，回调把快照传给 useTable.handleSearch
    - 不依赖内部 reactive 引用，回调接收普通对象快照
    - 搜索后表格回到第 1 页
    - URL query 同步属于路由层职责，本场景不自动同步
```

---

## 通用注意事项

- 搜索区字段少时（<=3）默认全部展示，不启用折叠
- 高级 AND/OR、条件摘要、URL 同步不属于 BaseSearch 基础契约，按业务扩展
- 禁止页面裸写一堆 el-form-item 拼搜索区
