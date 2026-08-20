---
name: aicoding-codegen
description: 自动检索 AICoding 的 Prompt、ai-kit 和工程规则后，在当前业务仓库生成或修改前端代码。用户要求生成、创建、实现 Vue 页面、表格、表单、弹窗、抽屉、树、ECharts 图表、Hook，或提到“按 AICoding 规范生成代码”时使用；即使用户只说“生成一个折线图”也应触发。不要用于纯解释、只审查不修改或非前端任务。
---

# AICoding 智能代码生成

把 AICoding 当作外部知识库，在当前业务仓库完成真实代码生成。AICoding 中的代码默认是参考实现，不是业务项目可直接导入的运行时依赖。

## 1. 定位知识库

从当前 Git 根目录读取 `.aicoding/config.json`。将 `sourceRoot` 相对该根目录解析，得到 `AICODING_ROOT`。

若配置不存在或目录无效，停止生成并提示执行：

```bash
node /path/to/AI-AI-Coding/scripts/aicoding.js install --target .
```

不要猜测或全盘扫描用户磁盘寻找 AICoding。

## 2. 检索 Prompt

使用用户的完整需求执行：

```bash
node "$AICODING_ROOT/scripts/search-prompts.js" "<用户需求>" --json --limit 5
```

读取排名靠前且与任务相关的 1–3 个 Prompt 全文。读取每条结果的 `rules` 规则文件；若结果中包含 `references`，再读取对应 ai-kit 文件。不要一次加载整个 AICoding 仓库。

若最高分为 0，说明没有可靠匹配：检查 `prompts/` 中是否存在明显候选；仍无候选时使用当前业务项目规范完成任务，并明确说明未命中 AICoding Prompt。

## 3. 检查业务项目

生成前检查当前仓库中的：

- `AGENTS.md`、项目规则和目标目录约束；
- `package.json`、技术栈及可用依赖；
- 相似页面、组件、Hook、API 和类型定义；
- 导入别名、样式方案、测试与构建命令；
- Git 工作区已有修改。

业务项目自身约定优先于 AICoding 示例。优先复用业务项目已有资产。

## 4. 生成代码

根据用户需求、匹配 Prompt、ai-kit 参考实现和业务项目事实生成代码。

必须遵守：

- 不从业务代码导入 AICoding 的绝对路径；
- 仅当业务项目已经复制、安装或配置对应 ai-kit 时才能直接 import；
- 否则将 ai-kit 作为设计参考，按业务项目现有模式实现所需代码；
- 不虚构 API、字段、权限标识或依赖；信息不足时先检查项目，关键业务信息仍缺失时再询问；
- 保留用户已有修改，不修改无关文件；
- TypeScript 类型完整，避免 `any`；
- 补齐 loading、error、空状态、清理逻辑和必要边界条件。

默认直接实现用户明确要求的功能。只有用户要求方案或 dry-run 时才只输出计划。

## 5. 验证与交付

优先运行当前业务项目已有的类型检查、测试、lint 和构建命令；不要为了验证擅自安装新依赖。

最终说明：

1. 命中的 AICoding Prompt；
2. 采用的 Cursor 规则和参考的 ai-kit 文件；
3. 创建或修改的业务文件；
4. 执行的验证及结果；
5. 未验证项或需要业务确认的内容。
