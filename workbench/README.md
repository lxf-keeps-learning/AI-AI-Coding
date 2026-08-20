# AI Delivery Workbench（交付工作台）

一个让产品 / 测试零门槛使用 AI 流水线的**纯前端本地工作台**：粘贴一段模糊需求 → 生成结构化 PRD-SPEC（流式渲染）→ 集中回答待确认问题 → 继续完善 → 保存 / 导出。无后端、无构建，浏览器直接打开即用。

## 快速开始

用浏览器直接打开 `workbench/index.html` 即可，无需安装任何依赖。

首次使用：

1. 点击右上角「API 设置」；
2. 填写 baseURL / model / apiKey（默认 DeepSeek 兼容地址 `https://api.deepseek.com/v1`，model 默认 `deepseek-chat`）；
3. 点「测试连接」验证，再点「保存」。

> 未配置 API 时点「生成 Spec」会提示先配置。配置与文档全部存于浏览器 `localStorage`，刷新不丢。

## 使用流程

1. **需求输入**：在顶部多行文本框粘贴模糊需求（例如"给运营做一个设备管理页面，能搜索、能分页、能新增编辑删除…"）。
2. **生成 Spec**：点「生成 Spec」。系统内置 prd-spec-enhancer 机制，把需求完善为与 `design/_templates/PRD-SPEC模板.md` 骨架一致的 PRD-SPEC，内容流式渲染到预览区。
3. **回答待确认**：生成结束后，AI 从结果中提取全部 `⚠️待确认` 项，集中展示为问题清单。逐条填写回答后点「继续完善」，AI 会把原需求 + 你的回答重发补全。
4. **编辑与保存**：点「编辑」可切换到 Markdown 编辑模式直接改，再切回「预览」。`Ctrl/Cmd + S` 保存。
5. **文档管理**：左侧列表按更新时间排序；点击加载、右上「导出」下载 `.md`、点「删除」移除。
6. **（P1）生成测试计划**：选中一份 Spec 后点「生成测试计划」，基于验收标准产出用例清单（用例ID/前置/步骤/预期），附在预览区底部。
7. **（P1）历史版本**：点「历史」查看每次生成 / 继续完善 / 测试计划的快照，点击可回看，此时「导出」下载的是该快照。

## 目录结构

```
workbench/
├── index.html   入口页面
├── styles.css   样式（沿用 Prompt Lab 浅色主题）
├── app.js       全部逻辑：SSE 流式、待确认提取、文档管理、设置
└── README.md    本说明
```

## 技术说明

- **纯前端静态**：原生 JS + `marked.js`（CDN）渲染 Markdown，无构建步骤。
- **SSE 流式**：`fetch` + `ReadableStream` 解析 `text/event-stream`，逐块 `delta.content` 渲染；流式不可用时自动降级为普通 `POST /chat/completions` JSON 请求。
- **接口约定**：OpenAI 兼容 `POST {baseURL}/chat/completions`，请求头 `Authorization: Bearer <apiKey>`。
- **本地存储**：
  - `workbench-config-v1` — API 配置
  - `workbench-docs-v1` — 文档列表（含 markdown、状态、版本快照、测试计划）
  - `workbench-active-v1` — 最近打开的文档 id
- **来源标注**：生成内容遵守 `≈推断`（AI 补全需复核）/ `⚠️待确认`（未定需补齐）标注规范，AI 不编造业务信息。

## 与项目资产的关系

- 系统提示词机制来源于 `skills/prd-spec-enhancer/`（checklist 逐项检查、必备/条件必备/可选、缺口集中提问）。
- 输出骨架对齐 `design/_templates/PRD-SPEC模板.md`，真实样例见 `design/cascade-filter/PRD-SPEC-cascade-filter.md`。
- 复用优先、禁止编造等原则与 AICoding 项目规范一致。

## 已知边界

- 文档仅存本机浏览器，不支持跨设备同步 / 多人协作。
- 生成结果仍需人工 Review 与业务确认后方可进入开发。
- 编辑模式下直接修改内容会即时写回本地（防抖 500ms）。
