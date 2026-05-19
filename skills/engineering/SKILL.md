---
name: engineering
description: "在本项目(Vue3 + TS + Element Plus + ECharts 的 ai-kit 体系)里做'可复用资产沉淀'时使用。识别重复模式、判断应当复用还是新抽取到 src/ai-kit/、按项目 AI 注释规范补齐元数据、并同步更新 .cursor/rules/。任何涉及'抽公共组件/Hook''沉淀到 ai-kit''重复代码整理''review 哪些可以抽''新组件入库'的请求都应当触发本 skill,即使用户没有明确说'工程化'。输出形态固定为 Markdown 改造报告 + 改造清单,不直接修改业务代码。"
---

# Engineering — 可复用资产沉淀

## 你在做什么

你正在为 **AI-AI-Coding** 项目做"可复用资产沉淀"。这个项目的核心理念是:

> 不让 AI 从 0 生成,让 AI 基于 `src/ai-kit/` 中已经沉淀的组件、Hook、模板生成。

所以"工程化"在本项目里的含义非常具体:**让 ai-kit 的覆盖面持续扩张、规范持续收敛、AI 持续能够识别并复用**。它不是泛指 Vite 配置或 CI/CD,而是"资产沉淀工程"。

你的工作是产出一份 **优化报告 + 改造清单**,告诉用户:

1. 哪些地方违反了"必须复用 ai-kit"的核心规范(可以直接改)
2. 哪些重复模式值得抽取到 ai-kit(需要决策)
3. 抽取后应当如何补 AI 注释、更新 `.cursor/rules/`、保持团队可发现

**你不主动修改业务文件**,除非用户明确同意改造清单中的具体项目并要求执行。

## 触发场景与典型 prompt

无论用户的措辞是什么,只要本质是下面这些诉求,都属于本 skill 的范围:

- "review 一下 src/views/xxx/,看看哪些可以抽到 ai-kit"
- "我新写了 N 个搜索表单,该不该抽公共组件?"
- "把这段重复的请求逻辑沉淀一下"
- "ai-kit 里还缺什么?有什么建议加进去?"
- "这两个页面看起来很像,帮我整理"
- "新增 BaseXxx 到 ai-kit,顺便补好规则"
- "这个 hook 太杂了,帮我拆"

## 第一步:对照 ai-kit 现有资产

**在分析任何重复之前,先把项目里已经有什么背熟。** 重复的判断必须以"现有 ai-kit 不能覆盖"为前提,否则结论一定是"复用现有的",而不是"新抽一个"。

完整的 ai-kit 资产目录见 [references/ai-kit-catalog.md](references/ai-kit-catalog.md)。**读这个文件**,然后再开始扫描业务代码。如果业务代码中出现了 ai-kit 已能覆盖的能力(裸用 el-dialog、自己写 debounce、页面里裸声明 tableData/loading/pagination 等),这些直接归类为"违反核心规范",写进报告的第一节,不需要走"是否值得抽取"的讨论。

## 第二步:判断是"复用"、"抽取"还是"留在原地"

读取 [references/extraction-criteria.md](references/extraction-criteria.md) 中的判定标准。简化版的判断流程:

1. **能用现有 ai-kit 覆盖?** → 复用,写进"违反复用规范"清单
2. **重复 ≥ 2 处且语义稳定?** → 候选抽取,继续评估
3. **重复但业务耦合强、形态差异大?** → 留在原地,但建议提取"约定"而非组件
4. **只出现 1 次?** → 留在原地,不要过早抽象

注意:**过早抽象比重复更可怕**。本项目的所有公共组件都是经过 ≥ 2 个真实业务验证后才进 ai-kit 的,新建议也应当遵循这个门槛。如果只看到 1 处用法,即使"看起来很通用",也只在报告里标"观察项",不写进改造清单。

## 第三步:为候选抽取项设计契约

每个进入"建议新抽取"清单的项,必须给出:

- **名称**:遵循 `BaseXxx.vue` 或 `useXxx.ts` 命名,放置路径(`src/ai-kit/<category>/`)
- **Props / Emits / 返回类型**:用 TypeScript 接口写,不允许 `any`(项目硬性规则)
- **AI 注释**:按 [references/annotation-template.md](references/annotation-template.md) 的模板补全,这是让 Cursor 和未来的 AI 调用能正确发现的关键
- **配套 .cursor/rule**:列出应当在 `.cursor/rules/<category>/` 下新增或修改的 `.mdc` 文件名与要点

如果跳过 AI 注释或 .cursor/rule,新组件即使写了,AI 也不会用,沉淀就失效——这是本项目特有的失败模式,必须重点防止。

## 第四步:输出报告

**最终交付物是一份 Markdown 报告**(不是直接改代码)。结构模板见 [references/report-template.md](references/report-template.md)。报告必须包含 5 个 section:

1. **范围与方法** — 扫了哪些文件、对照了 ai-kit 的哪一版
2. **违反复用规范的清单** — 必须改,直接对应到现有 ai-kit
3. **建议新抽取到 ai-kit 的清单** — 含契约、AI 注释、.cursor/rule 同步项、所需验证场景数(≥ 2)
4. **观察项** — 出现 1 次但值得跟踪,下次再看
5. **改造清单与优先级** — 用 P0/P1/P2 标记,每项给出影响面与工作量估计

报告语言:中文为主,代码片段、文件路径、组件名保留英文。

## 文件路径写法

报告里所有项目内文件路径必须用**相对项目根的写法**(例如 `src/ai-kit/hooks/useTable.ts`、`.cursor/rules/global/base.mdc`),不要使用绝对路径或省略号路径,这样团队成员复制就能在 Cursor 里跳转。

## 一个反模式提醒

不要写"这里可以优化"这种没有抓手的话。每条建议必须能落到具体的:

- 文件路径 + 行号区间(或函数名)
- 拟做的具体动作(替换为 `BaseDialog`、抽取为 `useFormDraft`、补 AI 注释)
- 验收标准(怎样算改完)

如果你写不出具体抓手,说明对该处的分析还不充分,回到第一步重读代码,而不是含糊地写进报告。

## 参考文件索引

| 文件 | 何时读 |
|------|--------|
| [references/ai-kit-catalog.md](references/ai-kit-catalog.md) | 每次任务开始前,确认现有资产边界 |
| [references/extraction-criteria.md](references/extraction-criteria.md) | 判断是否值得抽取时 |
| [references/annotation-template.md](references/annotation-template.md) | 为新抽取项设计 AI 注释时 |
| [references/report-template.md](references/report-template.md) | 撰写最终报告时 |
