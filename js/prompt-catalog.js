// 此文件由 scripts/build-prompt-catalog.js 自动生成，请勿手动修改。
window.PROMPT_CATALOG = [
  {
    "id": "charts-chart",
    "category": "charts",
    "path": "charts/chart.md",
    "title": "Chart 图表提示词",
    "preview": "Chart 图表提示词 折线图（趋势） 参考： - src/ai-kit/charts/BaseChart.vue - src/ai-kit/hooks/useRequest.ts 生成「访问趋势」折线图组件： - 调用 getVisitTrend({ startDate, en",
    "content": "# Chart 图表提示词\n\n## 折线图（趋势）\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n  - src/ai-kit/hooks/useRequest.ts\n\n生成「访问趋势」折线图组件：\n  - 调用 getVisitTrend({ startDate, endDate }) 接口\n  - 多条折线：PV、UV、IP\n  - X 轴：日期，Y 轴：数量\n  - 支持时间范围切换（近7天/近30天/自定义）\n  - 使用 BaseChart + useRequest，loading 状态\n```\n\n## 柱状图（对比）\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n  - src/ai-kit/hooks/useRequest.ts\n\n生成「各部门销售额」柱状图：\n  - 调用 getSalesByDept() 接口\n  - 横向柱状图（yAxis: category）\n  - 数据标签显示在柱子右侧\n  - 颜色渐变，响应式 resize\n  - 使用 BaseChart 组件\n```\n\n## 饼图（占比）\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n  - src/ai-kit/hooks/useRequest.ts\n\n生成「订单状态分布」饼图：\n  - 调用 getOrderStatusStat() 接口，返回 [{ name, value }]\n  - 环形饼图（内半径 60%），中心显示总数\n  - 图例在右侧，支持点击高亮\n  - 使用 BaseChart + useRequest\n```\n\n## 大屏图表（实时刷新）\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n  - src/ai-kit/hooks/useChart.ts\n\n生成「实时监控」大屏图表（折线，最新50条数据）：\n  - 每5秒调用 getRealtimeData() 刷新\n  - 用 useChart hook 手动控制（需要 appendData 增量更新）\n  - 组件销毁时清除定时器（onUnmounted）\n  - 坐标轴滚动，始终显示最新时间窗口\n```\n\n## 组合图表（折线 + 柱状）\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n\n生成「营收分析」组合图表：\n  - 柱状：各月营收金额\n  - 折线：环比增长率（双 Y 轴）\n  - tooltip 合并显示\n  - 使用 BaseChart 组件，:option 传入 computed\n```"
  },
  {
    "id": "charts-line-chart",
    "category": "charts",
    "path": "charts/line-chart.md",
    "title": "生成 ECharts 折线图组件：",
    "preview": "生成 ECharts 折线图组件： 要求： - 支持 resize - 自动销毁 - dark mode - loading - 空状态 - data update - tooltip 优化 - 防止内存泄漏 - hooks 化 性能要求： - 避免重复 setOption - ",
    "content": "生成 ECharts 折线图组件：\n\n要求：\n- 支持 resize\n- 自动销毁\n- dark mode\n- loading\n- 空状态\n- data update\n- tooltip 优化\n- 防止内存泄漏\n- hooks 化\n\n性能要求：\n- 避免重复 setOption\n- 大数据节流\n- 支持增量更新"
  },
  {
    "id": "components-drawer",
    "category": "components",
    "path": "components/drawer.md",
    "title": "Drawer 抽屉组件提示词",
    "preview": "Drawer 抽屉组件提示词 快速生成 参考： - src/ai-kit/components/BaseDrawer.vue - src/ai-kit/forms/BaseForm.vue - src/ai-kit/hooks/useDialog.ts 生成「用户详情编辑」抽屉组",
    "content": "# Drawer 抽屉组件提示词\n\n## 快速生成\n\n```\n参考：\n  - src/ai-kit/components/BaseDrawer.vue\n  - src/ai-kit/forms/BaseForm.vue\n  - src/ai-kit/hooks/useDialog.ts\n\n生成「用户详情编辑」抽屉组件，字段：name(姓名)、phone(手机号)、deptId(部门)、roles(角色，多选)\n要求：表单校验、loading 状态、离开拦截（表单修改后提示）\n```\n\n## 带左侧树 + 右侧抽屉的联动场景\n\n```\n参考：\n  - src/ai-kit/tree/BaseTree.vue\n  - src/ai-kit/components/BaseDrawer.vue\n  - src/ai-kit/hooks/useTree.ts\n  - src/ai-kit/hooks/useDialog.ts\n\n生成「组织架构管理」页面：\n  - 左侧：部门树（BaseTree + useTree），点击部门节点\n  - 右侧：用户列表（useTable）\n  - 操作：点击\"编辑\"打开 BaseDrawer，字段：name、phone、status\n```\n\n## 步骤表单抽屉\n\n```\n参考：\n  - src/ai-kit/components/BaseDrawer.vue\n  - src/ai-kit/hooks/useDialog.ts\n\n生成「申请流程」步骤抽屉，共 3 步：\n  步骤1：基本信息（name、type、description）\n  步骤2：配置项（配置表格，可动态增删行）\n  步骤3：确认预览\n要求：步骤间校验、上一步/下一步、最终提交\n```"
  },
  {
    "id": "components-dialog",
    "category": "components",
    "path": "components/dialog.md",
    "title": "生成 Dialog 组件：",
    "preview": "生成 Dialog 组件： 要求： - Vue3 + TS - loading - form 校验 - emits/types 完整 - 支持 dark mode",
    "content": "生成 Dialog 组件：\n\n要求：\n- Vue3 + TS\n- loading\n- form 校验\n- emits/types 完整\n- 支持 dark mode"
  },
  {
    "id": "docs-line-chart",
    "category": "docs",
    "path": "docs/line-chart.md",
    "title": "生成 ECharts 折线图组件：",
    "preview": "生成 ECharts 折线图组件： 要求： - 支持 resize - 自动销毁 - dark mode - loading - 空状态 - data update - tooltip 优化 - 防止内存泄漏 - hooks 化 性能要求： - 避免重复 setOption - ",
    "content": "生成 ECharts 折线图组件：\n\n要求：\n- 支持 resize\n- 自动销毁\n- dark mode\n- loading\n- 空状态\n- data update\n- tooltip 优化\n- 防止内存泄漏\n- hooks 化\n\n性能要求：\n- 避免重复 setOption\n- 大数据节流\n- 支持增量更新"
  },
  {
    "id": "forms-form",
    "category": "forms",
    "path": "forms/form.md",
    "title": "Form 表单提示词",
    "preview": "Form 表单提示词 基础表单（嵌入 Dialog） 参考： - src/ai-kit/forms/BaseForm.vue - src/ai-kit/components/BaseDialog.vue - src/ai-kit/hooks/useDialog.ts 生成「用户新",
    "content": "# Form 表单提示词\n\n## 基础表单（嵌入 Dialog）\n\n```\n参考：\n  - src/ai-kit/forms/BaseForm.vue\n  - src/ai-kit/components/BaseDialog.vue\n  - src/ai-kit/hooks/useDialog.ts\n\n生成「用户新增/编辑」功能：\n  表单字段：\n    - name(姓名, required)\n    - phone(手机号, required, 格式校验)\n    - email(邮箱, 格式校验)\n    - deptId(部门, el-select, required)\n    - status(状态, el-radio-group: 启用/禁用)\n  要求：\n    - 表单组件 UserForm.vue 单独拆出\n    - 通过 defineExpose({ validate, reset }) 暴露给父组件\n    - 嵌入 BaseDialog，confirm 回调中校验 → 提交 → 刷新列表\n```\n\n## 动态表单（字段动态增减）\n\n```\n参考：\n  - src/ai-kit/forms/BaseForm.vue\n  - src/ai-kit/hooks/useDialog.ts\n\n生成「参数配置」动态表单：\n  - 支持动态添加/删除行（key-value 键值对）\n  - 每行校验：key 必填且唯一，value 必填\n  - 最多 20 行限制，超出禁用添加\n  - 支持拖拽排序（可选）\n```\n\n## 搜索表单（配合 useSearch）\n\n```\n参考：\n  - src/ai-kit/search/BaseSearch.vue\n  - src/ai-kit/hooks/useSearch.ts\n  - src/ai-kit/hooks/useTable.ts\n\n生成「订单列表」搜索表单：\n  字段：orderNo(订单号)、status(状态，多选)、dateRange(日期范围)、userName(用户名)\n  要求：\n    - 使用 BaseSearch 组件包裹\n    - useSearch 管理参数，搜索防抖 300ms\n    - 重置还原所有字段并刷新列表\n    - 日期范围用 el-date-picker type=\"daterange\"\n```\n\n## 步骤表单\n\n```\n参考：\n  - src/ai-kit/forms/BaseForm.vue\n  - src/ai-kit/components/BaseDrawer.vue\n\n生成「项目申请」步骤表单，共 3 步：\n  步骤1 - 基本信息：name、type、priority、description\n  步骤2 - 成员配置：负责人（单选）、参与人（多选）、预计工期\n  步骤3 - 确认提交：汇总展示，可回到上一步修改\n  要求：\n    - 每步独立校验，通过后才能下一步\n    - 用 el-steps 显示进度\n    - 在 BaseDrawer 内展示\n```"
  },
  {
    "id": "forms-dynamic-form",
    "category": "forms",
    "path": "forms/dynamic-form.md",
    "title": "生成动态表单：",
    "preview": "生成动态表单： 要求： - schema 驱动 - 支持动态字段 - 表单校验 - resetFields - hooks 化",
    "content": "生成动态表单：\n\n要求：\n- schema 驱动\n- 支持动态字段\n- 表单校验\n- resetFields\n- hooks 化"
  },
  {
    "id": "git-commit",
    "category": "git",
    "path": "git/commit.md",
    "title": "根据当前 diff：",
    "preview": "根据当前 diff： 生成： - commit message - 修改说明 - 风险说明",
    "content": "根据当前 diff：\n\n生成：\n- commit message\n- 修改说明\n- 风险说明"
  },
  {
    "id": "hooks-use-request",
    "category": "hooks",
    "path": "hooks/use-request.md",
    "title": "生成请求 hooks：",
    "preview": "生成请求 hooks： 要求： - loading - error - cancel - retry - TS 类型完整",
    "content": "生成请求 hooks：\n\n要求：\n- loading\n- error\n- cancel\n- retry\n- TS 类型完整"
  },
  {
    "id": "pages-list-page",
    "category": "pages",
    "path": "pages/list-page.md",
    "title": "生成列表页面：",
    "preview": "生成列表页面： 要求： - Vue3 + TypeScript - 使用 BaseSearch - 使用 useTable - loading/error - 分页 - hooks 化 - api 放 services - 不允许 any",
    "content": "生成列表页面：\n\n要求：\n- Vue3 + TypeScript\n- 使用 BaseSearch\n- 使用 useTable\n- loading/error\n- 分页\n- hooks 化\n- api 放 services\n- 不允许 any"
  },
  {
    "id": "performance-large-data",
    "category": "performance",
    "path": "performance/large-data.md",
    "title": "优化大数据渲染：",
    "preview": "优化大数据渲染： 重点： - 虚拟滚动 - WebWorker - 防抖节流 - computed 缓存 - 避免深层 watch",
    "content": "优化大数据渲染：\n\n重点：\n- 虚拟滚动\n- WebWorker\n- 防抖节流\n- computed 缓存\n- 避免深层 watch"
  },
  {
    "id": "refactor-component",
    "category": "refactor",
    "path": "refactor/component.md",
    "title": "重构当前组件：",
    "preview": "重构当前组件： 要求： - 不改变业务逻辑 - 提升复用性 - 提取 composables - 减少重复代码 - 提升类型安全 - 优化性能 - 降低耦合",
    "content": "重构当前组件：\n\n要求：\n- 不改变业务逻辑\n- 提升复用性\n- 提取 composables\n- 减少重复代码\n- 提升类型安全\n- 优化性能\n- 降低耦合"
  },
  {
    "id": "review-review",
    "category": "review",
    "path": "review/review.md",
    "title": "Review 当前代码：",
    "preview": "Review 当前代码： 检查： - 是否符合规范 - 是否重复代码 - 是否存在性能问题 - 是否存在内存泄漏 - 是否符合 TS 规范",
    "content": "Review 当前代码：\n\n检查：\n- 是否符合规范\n- 是否重复代码\n- 是否存在性能问题\n- 是否存在内存泄漏\n- 是否符合 TS 规范"
  },
  {
    "id": "search-base-search",
    "category": "search",
    "path": "search/base-search.md",
    "title": "生成搜索区域：",
    "preview": "生成搜索区域： 要求： - 支持展开收起 - reset/search - 响应式布局 - 与 table 联动 - 支持 slot",
    "content": "生成搜索区域：\n\n要求：\n- 支持展开收起\n- reset/search\n- 响应式布局\n- 与 table 联动\n- 支持 slot"
  },
  {
    "id": "table-crud-table",
    "category": "table",
    "path": "table/crud-table.md",
    "title": "生成 CRUD 表格：",
    "preview": "生成 CRUD 表格： 要求： - 使用 useTable - loading - pagination - selection - column config",
    "content": "生成 CRUD 表格：\n\n要求：\n- 使用 useTable\n- loading\n- pagination\n- selection\n- column config"
  },
  {
    "id": "tree-tree",
    "category": "tree",
    "path": "tree/tree.md",
    "title": "Tree 树组件提示词",
    "preview": "Tree 树组件提示词 基础树 参考： - src/ai-kit/tree/BaseTree.vue - src/ai-kit/hooks/useTree.ts 生成「部门树」组件： - 调用 getDeptTree() 接口获取数据 - 支持关键词搜索过滤 - 支持 check",
    "content": "# Tree 树组件提示词\n\n## 基础树\n\n```\n参考：\n  - src/ai-kit/tree/BaseTree.vue\n  - src/ai-kit/hooks/useTree.ts\n\n生成「部门树」组件：\n  - 调用 getDeptTree() 接口获取数据\n  - 支持关键词搜索过滤\n  - 支持 checkbox 多选\n  - 点击节点 emit node-click 事件\n  - 数据用 useTree 管理，loading 骨架\n```\n\n## 左树右表联动\n\n```\n参考：\n  - src/ai-kit/tree/BaseTree.vue\n  - src/ai-kit/hooks/useTree.ts\n  - src/ai-kit/components/list-page-template.vue\n  - src/ai-kit/hooks/useTable.ts\n\n生成「权限管理」页面：\n  - 左侧：菜单树（BaseTree，单选，节点 id=menuId）\n  - 右侧：角色列表（useTable，搜索参数含 menuId）\n  - 点击菜单节点 → 右侧列表刷新\n  - 比例：左 240px / 右 flex:1\n```\n\n## 懒加载树（大数据量）\n\n```\n参考：\n  - src/ai-kit/tree/BaseTree.vue\n  - src/ai-kit/hooks/useTree.ts\n\n生成「文件目录」懒加载树：\n  - lazy=true，load 回调调用 getChildNodes(node.id)\n  - 叶子节点图标区分文件/文件夹\n  - 右键菜单：重命名、删除、新建子节点\n  - 拖拽排序（el-tree draggable）\n```"
  },
  {
    "id": "tree-lazy-tree",
    "category": "tree",
    "path": "tree/lazy-tree.md",
    "title": "生成懒加载树组件：",
    "preview": "生成懒加载树组件： 要求： - lazy load - checkbox - 搜索过滤 - 展开收起 - hooks 化",
    "content": "生成懒加载树组件：\n\n要求：\n- lazy load\n- checkbox\n- 搜索过滤\n- 展开收起\n- hooks 化"
  }
];
