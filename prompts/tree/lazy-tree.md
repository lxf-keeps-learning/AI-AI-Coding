# Lazy Tree 懒加载树提示词

> 所有懒加载树必须基于：
> - 组件：`src/ai-kit/tree/BaseTree.vue`
> - Hook：`src/ai-kit/hooks/useTree.ts`

---

## 场景一：基础懒加载树

```
参考：
  - src/ai-kit/tree/BaseTree.vue
  - src/ai-kit/hooks/useTree.ts

生成「文件目录」懒加载树：
  接口：getChildNodes(parentId) → [{ id, name, isLeaf, type: 'folder'|'file' }]
  要求：
    - lazy=true，展开时 load 回调调用 getChildNodes(node.id)
    - 根节点首次加载：getChildNodes(0)
    - 叶子节点图标区分文件/文件夹
    - 展开 loading 用 skeleton，空子节点有「暂无子节点」文案
    - 数据用 useTree 管理，节点增删后局部失效刷新
    - 加载失败可重试且不打断其他分支
```

## 场景二：懒加载树 + 勾选

```
参考：
  - src/ai-kit/tree/BaseTree.vue
  - src/ai-kit/hooks/useTree.ts

生成「权限授权」懒加载树（勾选赋权）：
  接口：getMenuChildren(parentId)、getCheckedMenuIds(roleId)、saveRoleMenus(roleId, menuIds)
  要求：
    - 支持 checkbox 勾选，父节点联动子节点
    - 打开时先回填已勾选菜单（getCheckedMenuIds）
    - 保存时提交勾选与半选节点 id
    - 子树懒加载不影响已勾选状态回填
```

## 场景三：懒加载树 + 搜索过滤

```
参考：
  - src/ai-kit/tree/BaseTree.vue
  - src/ai-kit/hooks/useTree.ts

生成「组织架构」懒加载树 + 搜索过滤：
  要求：
    - 关键词输入过滤节点（命中节点及其祖先高亮/展开）
    - 懒加载数据量大，搜索建议服务端搜索接口 getSearchNodes(keyword) 或前端内存过滤
    - 搜索时 loading，无结果显示空状态
    - 选中节点后 emit node-click / node-select 事件供外层使用
```

---

## 通用注意事项

- 懒加载子节点缓存与刷新策略明确（增删改后局部失效，不全量重载）
- 失败重试不打断其他已展开分支
- 占位 skeleton 与空子节点文案要区分
- 勾选场景明确回填与提交的半选节点语义
