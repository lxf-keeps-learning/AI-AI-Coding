# 混合 Codebase 检索设计

## 背景

AICoding 当前通过 `scripts/search-prompts.js` 对 `prompts/` 进行关键词、别名和规则路由检索，并把匹配 Prompt 中引用的 Cursor Rules 与 ai-kit 文件交给代码生成工作流。这套机制可解释、离线且没有运行时依赖，但检索范围局限于 Prompt，不能直接从 AICoding 资产或真实业务仓库召回相似组件、类型、接口和设计文档。

本次改造继续以 `scripts/search-prompts.js` 为唯一公开入口，在不引入 Embedding、向量数据库或 AST Parser 依赖的前提下，增加结构化 Codebase 检索。设计必须保持现有 CLI 和 `searchPrompts()` 调用方兼容，并为后续接入语义评分提供稳定扩展点。

## 目标

1. 保留现有 Prompt 检索、规则关联和 `matches` 返回结构。
2. 检索 AICoding 的 Rules、ai-kit、Skills、设计文档和工程文档。
3. 通过可选 `--project` 参数检索真实业务项目代码和 Markdown 文档。
4. 对 Markdown、Vue、TypeScript 和 JavaScript 做轻量结构化分块。
5. 使用可解释的确定性混合评分融合标题、符号、路径、正文、领域路由、来源类型和 Prompt 引用。
6. 对大仓库、敏感文件、不可读文件和异常输入采取安全且可诊断的行为。
7. 为后续 Embedding 预留语义分数接口，但第一版不调用外部模型。

## 非目标

- 不实现 Embedding 生成、向量存储或相似度计算。
- 不上传代码或文档到外部服务。
- 不引入 Tree-sitter、Babel、TypeScript Compiler API 等解析依赖。
- 不建立后台索引服务、文件监听器或持久缓存。
- 不改变 Prompt 文件格式、Cursor Rules 格式或 ai-kit 运行时边界。
- 不扫描用户磁盘或 `--project` 之外的目录。

## 总体架构

`scripts/search-prompts.js` 继续负责公开 API、CLI 参数解析、兼容输出和最终结果组装，内部委托三个单一职责模块：

| 文件 | 职责 |
| --- | --- |
| `scripts/search-prompts.js` | Prompt 检索、CLI、参数校验、结果组装、向后兼容 |
| `scripts/codebase-scanner.js` | 安全文件发现、忽略规则、文件数量与大小限制、读取告警 |
| `scripts/codebase-chunker.js` | Markdown/MDC、Vue、TS/JS 结构化分块及降级策略 |
| `scripts/hybrid-ranker.js` | 关键词评分、领域扩展、来源加权、Prompt 引用加权、融合和去重 |

数据流如下：

```text
自然语言查询
  ├─ 现有 Prompt 检索 ────────────────→ matches
  ├─ AICoding 资产扫描 → 分块 ─┐
  └─ 可选业务项目扫描 → 分块 ──┼→ 统一评分 → 去重/限额 → contexts
                                └→ warnings
```

后续语义检索通过 `hybrid-ranker.js` 的可选语义评分提供器加入总分，不改变 CLI、分块协议和结果协议。第一版不暴露一个虚假的 Embedding 开关；只有在实现语义提供器时才增加对应配置。

## 公开接口

### JavaScript API

```js
searchPrompts(query, {
  root,             // AICoding 知识库根目录，默认仓库根目录
  project,          // 可选业务项目根目录
  limit,            // Prompt 数量，默认 5，保持现有语义
  contextLimit,     // 上下文数量，默认 10
  maxFiles,         // 安全上限，默认 5000
  maxFileBytes,     // 单文件上限，默认 512 * 1024
})
```

`matches` 保持当前字段和含义。返回对象新增 `project`、`contexts` 和 `warnings`：

```js
{
  query,
  terms,
  root,
  project,
  matches: [
    { path, title, category, score, references, rules, preview }
  ],
  contexts: [
    {
      type: "rule" | "ai-kit" | "skill" | "business-code" | "document",
      source: "aicoding" | "business",
      path,
      title,
      symbol,
      score,
      preview,
      reasons
    }
  ],
  warnings: [
    { code, path, message }
  ]
}
```

路径始终使用 `/`。AICoding 路径相对于 `root`，业务路径相对于 `project`。不传 `project` 时返回值中的 `project` 为 `null`。

### CLI

以下现有命令继续有效：

```bash
npx aicoding search "折线图"
npx aicoding search "折线图" --json --limit 5
```

新增：

```bash
npx aicoding search "用户 CRUD 列表" --project /path/to/business-project
npx aicoding search "用户 CRUD 列表" --project . --context-limit 10 --json
```

文本模式分为“Prompt 匹配”和“代码上下文”两个区域；存在告警时在末尾输出简短告警摘要。JSON 模式输出完整结构。

## 扫描范围与安全边界

### AICoding 知识库

仅扫描：

- `.cursor/rules/`
- `src/ai-kit/`
- `skills/`
- `design/`
- `docs/`

允许扩展名为 `.md`、`.mdc`、`.vue`、`.ts`、`.tsx`、`.js`、`.jsx`。

### 业务项目

从显式 `project` 根目录扫描 `.md`、`.mdc`、`.vue`、`.ts`、`.tsx`、`.js`、`.jsx`。扫描遵守项目根目录 `.gitignore` 中适用于目录或文件路径的常见规则，并始终排除：

- `.git/`
- `node_modules/`
- `dist/`
- `build/`
- `coverage/`
- 常见缓存目录
- `.env` 及其变体
- 私钥、证书、压缩包、图片、音视频和其他二进制文件

第一版 `.gitignore` 支持项目所需的常见目录、文件名、扩展名和 `!` 否定规则；不承诺复刻 Git 的全部边缘匹配语义。固定安全排除项不可被否定规则重新包含。

默认最多接纳 5,000 个候选文件，单文件最大 512 KB。达到文件上限后停止继续接纳并产生 `MAX_FILES_REACHED` 告警；过大、不可读或解析失败的文件分别产生稳定错误码告警，不中止其余文件检索。

`project` 不存在、不是目录或根目录不可读取属于请求级错误：CLI 打印明确错误并返回非零状态；JavaScript API 抛出带路径信息的错误。

## 统一分块协议

扫描器输出文件记录；分块器输出与文件类型无关的统一 Chunk：

```js
{
  source,
  type,
  path,
  title,
  symbol,
  kind,
  content,
  startLine,
  endLine
}
```

### Markdown 与 MDC

- 按 ATX 标题（`#` 到 `######`）分段。
- 分块标题包含当前标题路径，便于区分重复小节名。
- 标题前的 frontmatter 或说明文字形成文档摘要块。
- 没有标题时整文件形成一个块。

### Vue

- 识别顶层 `<template>`、`<script>`、`<script setup>` 和 `<style>` 边界。
- 样式默认不进入检索正文，避免 CSS 类名噪声；文件摘要仍可包含组件路径和文件名。
- Template 形成一个块。
- Script 使用轻量正则识别 import、interface、type、class、function、变量声明和 export 符号。
- 无法可靠拆分的 Script 作为一个块，不能因为语法特性导致文件整体丢失。

### TypeScript 与 JavaScript

- 优先按导出的 function、class、interface、type、const/let/var 符号切分。
- 同时支持常见非导出顶层声明，使业务页面内部函数可以召回。
- 分块器通过括号层级和下一个顶层声明确定边界，不尝试完整解析语言语法。
- 无声明或识别失败时退化为整文件块。

### 分块约束

- 空白块不进入排序。
- Preview 由规范化空白后的正文截取，避免输出完整业务代码。
- 同一文件的分块保留稳定的路径、符号和行号，便于 Codex 按需读取原文件。

## 混合评分与去重

第一版全部评分确定、同步且可解释。`queryTerms()` 继续负责停用词过滤和 `ROUTES` 领域别名扩展，Prompt 与 Context 共享同一查询词集合。

Context 总分由以下信号组成：

1. 标题或符号命中，权重最高。
2. 相对路径命中。
3. 正文命中，对重复次数设置上限。
4. `ROUTES` 展开的领域词命中。
5. 来源和类型权重，例如业务代码优先表达业务事实，Rule 优先表达硬约束。
6. 被前排 Prompt 的 `references` 或 `rules` 显式引用时加权。

每个正分结果包含稳定、面向用户的 `reasons`，例如：

```json
["符号命中: useTable", "路径命中: hooks", "Prompt 显式引用"]
```

结果先按分数降序，再按来源、路径、起始行排序，确保测试和 CLI 输出稳定。相同来源、路径和符号的块只保留一个；默认每个文件最多返回两个块，避免长文件垄断上下文。没有正分 Context 时返回空数组，而不是返回任意默认文件。现有 Prompt 无正分时返回排序后 Prompt 的兼容行为保持不变。

## 错误与告警模型

请求级错误会终止检索：

- 空查询。
- `root/prompts` 不存在。
- `project` 不存在、不是目录或根目录不可读。
- 数值参数不是有限正整数。

文件级问题写入 `warnings` 并继续：

- `FILE_TOO_LARGE`
- `FILE_UNREADABLE`
- `CHUNK_FAILED`
- `MAX_FILES_REACHED`

告警不包含文件内容或密钥值。文本 CLI 默认展示告警数量和有限条摘要，JSON 返回全部告警。

## 测试策略

所有行为按测试驱动方式实现。测试使用临时目录构造最小业务仓库，不依赖用户机器上的其他仓库。

### 现有回归测试

- 中文自然语言继续路由到折线图 Prompt。
- CRUD 查询继续展开列表和表格词。
- Prompt 引用的 ai-kit 文件继续出现在 `references`。
- 全局、领域和同名规则继续出现在 `rules`。

### 扫描器测试

- 只接受允许扩展名。
- 固定目录、敏感文件和二进制文件不被读取。
- 常见 `.gitignore` 与 `!` 否定规则生效。
- 文件数量和大小限制产生稳定告警。
- 非法 `project` 触发请求级错误。

### 分块器测试

- Markdown 标题层级产生稳定块和行号。
- Vue Template 与 Script 被拆分，Script 符号可以召回。
- TS/JS 顶层符号被拆分。
- 不可识别结构安全降级为整文件块。

### 排序与集成测试

- AICoding Rules、ai-kit、Skill 和文档得到正确 `type` 与 `source`。
- 业务代码得到 `business-code` 和 `business`。
- 符号命中高于普通正文命中。
- 前排 Prompt 显式引用得到加权和对应 `reasons`。
- 相同文件最多返回两个 Context。
- 无匹配 Context 返回空数组。
- 原有 `matches` 字段保持兼容。
- CLI 支持 `--project`、`--context-limit` 和 `--json`，非法路径返回非零状态。

完成后运行目标 Node 测试和完整 `npm run check`。成功标准是所有既有检查通过、无新增运行时依赖、CLI 输出稳定，且临时业务仓库中的相关符号可被自然语言需求召回。

## 文档与 Skill 接入

- 更新 README 的检索命令和能力说明。
- 更新实际项目接入指南，说明 `--project`、扫描边界和数据不外发。
- 更新安装生成的 `aicoding-codegen` 指令，使其在业务仓库中调用检索器时传入 `--project .`，并优先读取 `contexts` 中的高分业务代码、Rules 和 ai-kit 文件。
- AICoding 仍是开发期知识库，生成的业务代码不得导入 AICoding 绝对路径。

## 后续 Embedding 扩展点

后续语义提供器消费统一 Chunk，并返回以稳定 Chunk 标识为键的归一化语义分数。混合排序器负责融合该分数，扫描器、分块器、CLI 和返回协议不变。语义提供器必须显式配置，失败时可诊断地降级到本设计的确定性评分；任何云端实现都必须单独确认代码上传、保留策略、API Key 和费用边界。
