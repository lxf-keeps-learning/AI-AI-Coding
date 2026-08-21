# CRUD 表格提示词

> 所有 CRUD 表格必须基于：
> - 模板：`src/ai-kit/components/list-page-template.vue`
> - Hook：`src/ai-kit/hooks/useTable.ts`
> - 弹窗：`src/ai-kit/components/BaseDialog.vue`、`src/ai-kit/hooks/useDialog.ts`
> - 搜索：`src/ai-kit/search/BaseSearch.vue`、`src/ai-kit/hooks/useSearch.ts`

---

## 场景一：标准 CRUD 列表

```
参考：
  - src/ai-kit/components/list-page-template.vue
  - src/ai-kit/hooks/useTable.ts
  - src/ai-kit/hooks/useDialog.ts
  - src/ai-kit/search/BaseSearch.vue
  - src/ai-kit/hooks/useSearch.ts

生成「角色管理」CRUD 列表：
  接口：getRoleList(params) → { list, total }；createRole / updateRole / deleteRole
  字段：name(角色名)、code(编码)、status(状态, 标签)、createTime、操作(编辑/删除)
  搜索：name、status
  要求：
    - 结构：BaseSearch → 操作栏(新增) → el-table(selection + 业务列 + 操作列) → el-pagination → BaseDialog
    - useTable 管理列表/分页/loading/selection，useDialog 管理新增/编辑，BaseSearch+useSearch 管搜索
    - 删除用 ElMessageBox.confirm，成功后刷新列表
    - 表格列配置用 column config 或数组驱动，避免模板写死大量列
    - loading 用 v-loading，selection 变化回传选中行
    - 页面 <= 500 行，API 放 services，类型放 types
```

## 场景二：批量操作（批量删除/启停）

```
参考：
  - src/ai-kit/components/list-page-template.vue
  - src/ai-kit/hooks/useTable.ts
  - src/ai-kit/components/BaseDialog.vue
  - src/ai-kit/hooks/useDialog.ts

生成「订单管理」列表，支持批量操作：
  要求：
    - 支持批量删除：勾选多行 → 确认 → 调批量接口
    - 支持批量修改状态（启用/停用）
    - 批量按钮在未勾选时禁用，勾选后显示已选数量
    - 批量操作 loading 时禁止再次提交
    - 成功后刷新列表并清空选择
    - 操作列：查看(详情弹窗)、编辑(useDialog)、删除(单条)
```

## 场景三：行内编辑表格

```
参考：
  - src/ai-kit/components/list-page-template.vue
  - src/ai-kit/hooks/useTable.ts
  - src/ai-kit/forms/BaseForm.vue

生成「库存调整」行内编辑表格：
  要求：
    - 可编辑行通过 el-table 行内 input/select 编辑
    - 编辑状态管理：当前编辑行 id + 编辑数据副本
    - 校验：数量为正整数、必填
    - 保存调用 updateStock(id, row)，失败回滚并提示
    - 取消编辑恢复原值
```

---

## 通用注意事项

- 分页变化绑定 handlePageChange / handleSizeChange，禁止手动 watch pagination
- 搜索/弹窗/列表全部走 ai-kit Hook，禁止重复封装
- 必须渲染 error + 重试，空数据渲染 empty
- 操作列按钮用 link 类型，节省空间
