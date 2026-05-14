# Tree 树组件提示词

## 基础树

```
参考：
  - src/ai-kit/tree/BaseTree.vue
  - src/ai-kit/hooks/useTree.ts

生成「部门树」组件：
  - 调用 getDeptTree() 接口获取数据
  - 支持关键词搜索过滤
  - 支持 checkbox 多选
  - 点击节点 emit node-click 事件
  - 数据用 useTree 管理，loading 骨架
```

## 左树右表联动

```
参考：
  - src/ai-kit/tree/BaseTree.vue
  - src/ai-kit/hooks/useTree.ts
  - src/ai-kit/components/list-page-template.vue
  - src/ai-kit/hooks/useTable.ts

生成「权限管理」页面：
  - 左侧：菜单树（BaseTree，单选，节点 id=menuId）
  - 右侧：角色列表（useTable，搜索参数含 menuId）
  - 点击菜单节点 → 右侧列表刷新
  - 比例：左 240px / 右 flex:1
```

## 懒加载树（大数据量）

```
参考：
  - src/ai-kit/tree/BaseTree.vue
  - src/ai-kit/hooks/useTree.ts

生成「文件目录」懒加载树：
  - lazy=true，load 回调调用 getChildNodes(node.id)
  - 叶子节点图标区分文件/文件夹
  - 右键菜单：重命名、删除、新建子节点
  - 拖拽排序（el-tree draggable）
```
