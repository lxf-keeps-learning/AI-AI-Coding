# skills/

> 本目录存放本项目专属的 Anthropic Skill,供 Claude Code / Cowork 在团队场景中自动触发。
> 与 `.cursor/rules/`(Cursor IDE 用的细粒度约束规则)互为补充:`.cursor/rules/` 是"约束",`skills/` 是"工作流"。

---

## 当前已收录

### `aicoding-codegen/` — 智能代码生成

供真实业务项目安装使用。用户提出“生成一个折线图”“创建 CRUD 列表页”等前端开发需求时，自动检索本仓库 Prompt 和 ai-kit 参考资产，再结合业务项目的真实依赖、接口和目录生成代码并执行验证。

**接入方式**：`npx aicoding install --target .`

**触发方式**：Codex 支持隐式触发或显式 `$aicoding-codegen`；Cursor 通过安装器生成的项目规则触发。

### `engineering/` — 可复用资产沉淀

围绕本项目"基于 ai-kit 生成,不从 0 造轮子"的核心理念,提供识别重复 → 判定抽取 → 设计契约 → 同步 AI 注释和 .cursor/rules → 输出改造报告的完整闭环。

**触发场景**:抽公共组件、沉淀到 ai-kit、重复代码整理、review 哪些可以抽、新组件入库、hook 拆分等。

**输出**:Markdown 改造报告(默认产出位置 `docs/engineering-reports/`)。

### `performance/` — 前端性能诊断与改造

固定的三段式工作流:**采集症状 → 分类瓶颈(渲染/内存/大数据/网络/计算/图表)→ 输出报告**。每类瓶颈对应一份 reference,只在该类成立时才读对应文件。

**触发场景**:页面卡顿、列表渲染慢、图表卡死、首屏白屏、内存占用高、性能 review、切 tab 慢等。

**输出**:Markdown 优化报告,包含问题、影响面、改造步骤、优先级、度量指标、回滚预案(默认产出位置 `docs/performance-reports/`)。

---

## 目录结构

```
skills/
├── README.md(当前文件)
│
├── aicoding-codegen/
│   ├── SKILL.md
│   └── agents/
│       └── openai.yaml
│
├── engineering/
│   ├── SKILL.md
│   ├── references/
│   │   ├── ai-kit-catalog.md       现有资产目录与禁用裸写法
│   │   ├── extraction-criteria.md  抽取判定标准
│   │   ├── annotation-template.md  AI 注释模板
│   │   └── report-template.md      改造报告模板
│   └── evals/
│       └── evals.json              测试用例
│
└── performance/
    ├── SKILL.md
    ├── references/
    │   ├── diagnosis-flow.md       症状采集 + 瓶颈路由
    │   ├── render.md               渲染瓶颈
    │   ├── memory.md               内存瓶颈
    │   ├── large-data.md           大数据瓶颈
    │   ├── network.md              网络瓶颈
    │   ├── chart.md                ECharts 性能
    │   ├── compute.md              计算/响应式瓶颈
    │   └── report-template.md      优化报告模板
    └── evals/
        └── evals.json              测试用例
```

---

## 如何让 Claude 调用这些 skill

- **Claude Code / Cowork**:把项目目录连接进去后,Claude 会读到 SKILL.md 的 frontmatter,在用户输入符合 description 中的触发场景时自动启用 skill。
- **手动调用**:直接告诉 Claude "用 engineering skill review 一下 src/views/foo/" 或 "用 performance skill 帮我看 sales 页慢的问题"。
- **打包分发**:可通过 `package_skill.py`(随 skill-creator 提供)把整个 skill 目录打包成 `.skill` 文件,供团队其他成员安装。

---

## 设计准则(写新 skill 或修改时请遵守)

1. **不让 AI 改业务代码**——两个 skill 的输出都是"报告",不是 diff。修改需要人确认。
2. **必须复用 ai-kit**——任何建议出现"自己实现一个 debounce / 一个 dispose / 一个分页 hook"都是反模式。
3. **不能写没有抓手的话**——每条建议必须给出 文件:行号 + 具体动作 + 验收标准。
4. **度量必须可量化**(performance skill 尤其)——没有 baseline 和目标的报告不接受。
5. **路径用项目相对路径**(`src/ai-kit/hooks/useTable.ts`),不用绝对路径。
6. **不能过早抽象**(engineering skill 尤其)——仅 1 处真实用例的进"观察项",≥ 2 处稳定的才进"抽取候选"。

---

## 后续迭代建议

收到团队反馈后,典型的迭代路径:

- 加新 reference(例如 `references/router-perf.md`、`references/upload-perf.md`)
- 收紧 description(让触发更精准),用 skill-creator 的 `run_loop` 自动优化
- 加更多 eval 用例(`evals/evals.json`)覆盖新场景
- 把改造报告的真实样例放到 `docs/engineering-reports/` 和 `docs/performance-reports/`,反过来喂回 skill 作为 few-shot 示范
