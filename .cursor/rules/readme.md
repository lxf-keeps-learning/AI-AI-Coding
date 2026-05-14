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

各子目录内为对应场景的 `.mdc` 规则文件，按需 `@` 引用或在规则中配置 `alwaysApply`。其中 **`global/`** 为全局基础约定（协作、架构、命名、TypeScript、Git）。

作用：

- 告诉 AI 项目规范
- 告诉 AI 组件位置
- 告诉 AI 必须复用
- 告诉 AI 性能规范
- 告诉 AI Review 规则
