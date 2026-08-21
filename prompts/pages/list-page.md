# List Page 列表页提示词

> 所有列表页必须基于：
> - 模板：`src/ai-kit/components/list-page-template.vue`
> - Hook：`src/ai-kit/hooks/useTable.ts`、`src/ai-kit/hooks/useSearch.ts`、`src/ai-kit/hooks/useDialog.ts`
> - 组件：`src/ai-kit/search/BaseSearch.vue`

---

## 场景一：标准列表页（搜索 + 表格 + 分页）

```
参考：
  - src/ai-kit/components/list-page-template.vue
  - src/ai-kit/hooks/useTable.ts
  - src/ai-kit/hooks/useSearch.ts
  - src/ai-kit/search/BaseSearch.vue
  - src/ai-kit/hooks/useDialog.ts

生成「设备管理」列表页：
  接口：getDeviceList(params) → { list, total }；deleteDevice(id)
  搜索字段：name(设备名, input)、status(状态, select)、createTime(日期范围)
  表格字段：name、sn、status(渲染标签)、location、createTime(格式化)、操作(编辑/删除)
  要求：
    - 页面结构：BaseSearch → 操作栏(新增) → el-table → el-pagination → BaseDialog
    - useTable 管理列表/分页/loading，useSearch 管理搜索参数，useDialog 管理弹窗
    - 搜索按钮调 searchImmediately()，重置调 reset()
    - 分页事件绑定 handlePageChange / handleSizeChange，禁止手动 watch pagination
    - API 适配为 { list, total }，放 services，type 放 types
    - 页面文件禁止超过 500 行，删除确认用 ElMessageBox
    - 禁止 any，禁止页面裸声明 tableData/loading/pagination
```

---

## 场景二：带行内操作（启用/停用）

```
参考：
  - src/ai-kit/components/list-page-template.vue
  - src/ai-kit/hooks/useTable.ts

生成「账号管理」列表页，带行内启用/停用开关：
  接口：getAccountList(params)、updateAccountStatus(id, status)
  要求：
    - 状态列用 el-switch，切换时调接口，失败回滚并提示
    - 切换中该行 loading，防止连点
    - 批量操作：批量删除（selection + 确认 + 循环/批量接口）
    - 切换失败后刷新或还原行数据
```

---

## 场景三：左树右表联动

```
参考：
  - src/ai-kit/components/list-page-template.vue
  - src/ai-kit/tree/BaseTree.vue
  - src/ai-kit/hooks/useTree.ts
  - src/ai-kit/hooks/useTable.ts
  - src/ai-kit/hooks/useSearch.ts

生成「权限管理」页面：
  - 左侧：菜单树（BaseTree + useTree，节点 id=menuId）
  - 右侧：角色列表（useTable，搜索参数含 menuId）
  要求：
    - 点击菜单节点 → 右侧列表以该 menuId 刷新
    - 左侧固定 240px，右侧 flex:1
    - 切树节点时重置分页到第 1 页
```

---

## 通用注意事项

- tableData 用 shallowRef 或 ref，避免深层响应式性能损耗
- 操作列按钮用 link 类型，节省空间
- 必须渲染 error 与重试入口，不能只有 loading
- 搜索/分页/弹窗全部走 ai-kit Hook，不重复造轮子
