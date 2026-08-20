# skills/

> 本目录存放本项目专属的 Anthropic Skill，供 Claude Code / Cowork 在团队场景中自动触发。
> 与 `.cursor/rules/`（Cursor IDE 用的细粒度约束规则）互为补充：`.cursor/rules/` 是“约束”，`skills/` 是“工作流”。

## 当前已收录（6 个 Skill）

### `aicoding-codegen/` — 智能代码生成（唯一可安装到业务项目的 Skill）

供真实业务项目安装使用。用户提出“生成一个折线图”“创建 CRUD 列表页”等前端开发需求时，自动检索本仓库 Prompt 和 ai-kit 参考资产，再结合业务项目的真实依赖、接口和目录生成代码并执行验证。

- **接入方式**：`npx aicoding install --target .`（默认安装器只生成 Codegen Skill、Cursor Rule 和 `.aicoding/config.json`）
- **触发方式**：Codex 支持隐式触发或显式 `$aicoding-codegen`；Cursor 通过安装器生成的项目规则触发。

### `prd-spec-enhancer/` — PRD 完善专家（仓库内工作流）

把一段 MRD / 原始 PRD 转化为可指导研发直接开发的 PRD-SPEC（Markdown）：逐项检查 → 自动补全 → 自检 → 一次性交互收集缺口 → 按模板渲染。特色：必备/条件必备/可选三级必要性判定、`≈推断` / `⚠️待确认` 风险标注、ai-kit 复用清单与规范引用（R 板块）恒定激活。

- **触发方式**：提供 MRD/PRD/需求片段时自动触发；可显式要求“用 prd-spec-enhancer 完善这份需求”。
- **注意**：当前是仓库内 Skill，未通过安装器一键安装到业务项目（安装器尚未实现 `--with-spec`）。

### `code-reviewer/` — 代码审查（仓库内工作流）

对 Vue3 + TS + Element Plus + ECharts 的 ai-kit 体系代码变更执行规范化审查。输入 git diff → 按 rule-library 逐条机械判定 → 输出 **PASS / FAIL / CONDITIONAL 决策的 Markdown 报告**。规则全部提炼自 `.cursor/rules/` 与 `src/ai-kit/`，凡重复封装 ai-kit 已有能力一律记为 Error。

- **触发方式**：编码完成后的正式审查、PR/MR 提交前质量检查、说“review 一下 xx”。
- **输出**：Markdown 审查报告（变更范围 / 命中规则 / 缺陷列表 / 决策结论）。

### `engineering/` — 可复用资产沉淀（仓库内工作流）

围绕本项目“基于 ai-kit 生成，不从 0 造轮子”的核心理念，提供识别重复 → 判定抽取 → 设计契约 → 同步 AI 注释和 .cursor/rules → 输出改造报告的完整闭环。

- **触发场景**：抽公共组件、沉淀到 ai-kit、重复代码整理、review 哪些可以抽、新组件入库、hook 拆分等。
- **输出**：Markdown 改造报告（默认产出位置 `docs/engineering-reports/`）。

### `performance/` — 前端性能诊断与改造（仓库内工作流）

固定的三段式工作流：**采集症状 → 分类瓶颈（渲染/内存/大数据/网络/计算/图表）→ 输出报告**。每类瓶颈对应一份 reference，只在该类成立时才读对应文件。

- **触发场景**：页面卡顿、列表渲染慢、图表卡死、首屏白屏、内存占用高、性能 review、切 tab 慢等。
- **输出**：Markdown 优化报告，包含问题、影响面、改造步骤、优先级、度量指标、回滚预案（默认产出位置 `docs/performance-reports/`）。

### `grilling/` — 无情拷问（仓库内工作流）

把方案/计划/面试叙事映射成决策树（design tree），按轮次逐层追问，直到没有静默假设。每轮把当前可问的问题集一次问完，每个问题附推荐答案；事实查找由 AI 负责，用户只答决策类问题。

- **触发方式**：说“拷问我的方案”“grill 我”“帮我挑刺”“压力测试一下”。

## 目录结构

```
skills/
├── README.md
├── aicoding-codegen/          ← 唯一可安装到业务项目
│   ├── SKILL.md
│   └── agents/openai.yaml
├── prd-spec-enhancer/         ← 仓库内 PRD 完善
│   ├── SKILL.md
│   └── spec/
│       ├── checklist.md
│       ├── lexicon.md
│       └── prd-spec-template.md
├── code-reviewer/             ← 仓库内代码审查
│   ├── SKILL.md
│   └── spec/
│       ├── rule-library.md
│       └── report-structure.md
├── engineering/               ← 仓库内资产沉淀
│   ├── SKILL.md
│   ├── references/            （ai-kit-catalog / extraction-criteria / annotation-template / report-template）
│   └── evals/evals.json
├── performance/               ← 仓库内性能诊断
│   ├── SKILL.md
│   ├── references/            （diagnosis-flow / render / memory / large-data / network / chart / compute / report-template）
│   └── evals/evals.json
└── grilling/                  ← 仓库内方案拷问
    └── SKILL.md
```

> **安装边界**：`npm pack` 的发布白名单（`package.json#files`）目前只包含 `skills/aicoding-codegen/`。其余 Skill 是仓库内工作流，不随 npm 包分发，也不由默认安装器安装。

## 如何让 Claude 调用这些 skill

- **Claude Code / Cowork**：把项目目录连接进去后，Claude 会读到 SKILL.md 的 frontmatter，在用户输入符合 description 中的触发场景时自动启用 skill。
- **手动调用**：直接告诉 Claude “用 engineering skill review 一下 src/views/foo/” 或 “用 performance skill 帮我看 sales 页慢的问题”。
- **打包分发**：可通过 `package_skill.py`（随 skill-creator 提供）把整个 skill 目录打包成 `.skill` 文件，供团队其他成员安装。

## 设计准则（写新 skill 或修改时请遵守）

1. **不让 AI 改业务代码**——输出是“报告”，不是 diff；修改需要人确认。
2. **必须复用 ai-kit**——任何建议出现“自己实现一个 debounce / 一个 dispose / 一个分页 hook”都是反模式。
3. **不能写没有抓手的话**——每条建议必须给出 文件:行号 + 具体动作 + 验收标准。
4. **度量必须可量化**（performance skill 尤其）——没有 baseline 和目标的报告不接受。
5. **路径用项目相对路径**（`src/ai-kit/hooks/useTable.ts`），不用绝对路径。
6. **不能过早抽象**（engineering skill 尤其）——仅 1 处真实用例的进“观察项”，≥ 2 处稳定的才进“抽取候选”。
