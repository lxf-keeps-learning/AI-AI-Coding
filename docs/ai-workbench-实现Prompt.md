# AI Delivery Workbench 实现 Prompt（OpenCode 用）

> 把下面代码块整体复制到 OpenCode 执行。先 `cd /Users/lxf/Documents/xinao/AICoding/AI-AI-Coding`

````text
任务：在 AICoding 项目中实现「AI Delivery Workbench」前端 MVP——一个让产品/测试零门槛使用 AI 流水线的 Web 界面。

项目路径：/Users/lxf/Documents/xinao/AICoding/AI-AI-Coding

参考资产（只读）：
- index.html 与 js/（现有 Prompt Lab，参考其设计语言与本地存储模式）
- skills/prd-spec-enhancer/SKILL.md 与 spec/（PRD 完善机制：checklist 逐项检查、必备/条件必备/可选、≈推断/⚠️待确认 标注、缺口集中提问、不编造）
- design/_templates/PRD-SPEC模板.md（输出骨架模板）
- design/cascade-filter/PRD-SPEC-cascade-filter.md（真实样例）

交付物（写到 workbench/ 目录，纯静态无构建）：
- workbench/index.html
- workbench/styles.css
- workbench/app.js
- workbench/README.md（使用说明）

功能需求（P0 必须实现）：
1. 需求输入区：多行文本框粘贴模糊需求
2. 「生成 Spec」：调 OpenAI 兼容接口（POST /v1/chat/completions，支持 SSE 流式），
   system prompt 内置 prd-spec-enhancer 机制（checklist 检查 + ≈推断/⚠️待确认 来源标注 + 不编造 + 按 PRD-SPEC模板 骨架输出），
   user 消息为需求文本；流式渲染 Markdown 到预览区
3. Spec 编辑：预览/编辑模式切换，改动可保存
4. 待确认交互：从生成结果提取「⚠️待确认」项 → 集中展示为问题清单输入框 → 用户回答后点「继续完善」→ 把原需求+答案重发 LLM 补全
5. 文档管理：localStorage 保存（id/slug、标题、markdown 内容、状态、创建/更新时间），左侧列表展示，点击加载，可删除，可导出 .md 文件下载
6. API 配置：右上角设置弹窗（baseURL、model、apiKey，存 localStorage），默认 DeepSeek 兼容地址（https://api.deepseek.com/v1）；未配置时提示先配置

功能需求（P1 可选，尽力实现）：
7. 「生成测试计划」：基于当前 Spec 的验收标准，第二条 prompt 生成测试用例清单（用例ID/前置/步骤/预期）
8. 历史版本：每次生成保留快照，可回看

技术约束：
- 纯前端静态实现（原生 JS 或 Vue CDN 均可），无后端、无构建步骤，浏览器直接打开可用
- Markdown 渲染：marked.js（CDN）+ 简单样式；代码块高亮可不做
- SSE 流式：fetch + ReadableStream 解析 text/event-stream；流式不可用时降级为普通 JSON 请求
- 中文界面；遵循项目简单实用的风格，无多余依赖
- 不引入任何公司内部信息

验收标准：
- 浏览器打开 workbench/index.html 即可使用
- 配置 API 后，输入模糊需求 → 生成结构与 PRD-SPEC模板 一致的 Spec（含 ⚠️待确认 标注）
- 待确认问题可集中回答并补全
- 文档可保存/加载/删除/导出
- 刷新页面数据不丢
````

## 使用步骤

1. `cd /Users/lxf/Documents/xinao/AICoding/AI-AI-Coding`
2. OpenCode 里粘贴上面代码块
3. 等它干完，`open workbench/index.html` 本地验证
4. 配置 API（右上角 ⚙️）→ 粘贴一句模糊需求测试

跑完把结果发我，我帮你验收（对照产品文档第 7 节验收标准逐条查）🧪
