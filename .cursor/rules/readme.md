### 目标：统一 AI 规范

### 目录：`./.cursor/rules`

```
.cursor/rules/
├── readme.md
├── global/
│   ├── base.mdc
│   ├── architecture.mdc
│   ├── naming.mdc
│   ├── typescript.mdc
│   └── git.mdc
├── pages/
├── components/
├── forms/
├── search/
├── table/
├── charts/
├── tree/
├── hooks/
├── performance/
├── review/
└── refactor/
```

各子目录内为对应场景的 `.mdc` 规则文件。`global/base.mdc`、`global/architecture.mdc`、`global/naming.mdc` 和 `global/typescript.mdc` 默认启用，其余规则由检索结果或 Cursor 场景匹配按需读取。

作用：

- 告诉 AI 项目规范
- 告诉 AI 组件位置
- 告诉 AI 必须复用
- 告诉 AI 性能规范
- 告诉 AI Review 规则

## 实现边界

- `src/ai-kit/` 已实现：基础搜索、表单、弹窗、抽屉、树、图表，以及 request/table/dialog/search/chart/tree Hook。
- advanced-search、上传、预览、虚拟表格、可编辑表格、地图和大屏规则属于“生成指导”，当前没有同名 ai-kit 运行时组件；生成前必须检查业务项目依赖与已有实现。
- 规则不能替代业务事实：API、字段、权限和依赖必须从目标项目确认，不允许按规则示例虚构。
- 执行 `npm run check:ai-kit-contracts` 可校验全部 `.mdc` frontmatter、规则引用路径以及 ai-kit 中的 `any`。
