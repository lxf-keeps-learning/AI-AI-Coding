# AI 交付流水线工作流（AICoding 版）

> 用途：把"模糊需求 → 上线"整条研发链，用 AICoding 现有资产串成可执行的工作流。
> 每个环节 = 用什么资产 + 产出什么文件 + 谁来执行 + 质量门控。
> 参照：product 团队的 skill 家族（见 docs/product-skill-家族调研.md），本手册是其 TS/Vue 落地版。
> 已跑通样例：`design/cascade-filter/`（三级级联筛选组件，全链路示例）。

## 流水线总览

```
需求进入 → ①需求完善 → ②架构设计(可选) → ③概要设计 → ④详细设计
        → ⑤任务规划 → ⑥编码实现 → ⑦验证测试 → ⑧代码审查 → ⑨交付验收
```

**核心原则**：
- 一需求一 slug 目录：`design/<slug>/`（命名规范见 `design/_templates/00-规范基线.md`）
- 文档接力：前一个环节的产出文件 = 下一个环节的输入
- 复用优先：凡 ai-kit 已有能力必须复用，禁止重复造轮子
- 不编造：真实业务信息拿不到标 `⚠️待确认`，集中一次问人

---

## 各环节操作手册

### ① 需求完善（产品经理角色）
| 项 | 内容 |
|----|------|
| 输入 | MRD / 原始 PRD / 一句模糊需求 |
| 用什么 | `skills/prd-spec-enhancer/`（checklist 逐项检查 + 自动补全 + 集中提问）+ `design/_templates/PRD-SPEC模板.md` |
| 产出 | `design/<slug>/PRD-SPEC-<slug>.md`（含 待确认项汇总） |
| 执行 | Claude Code/Cowork 触发 prd-spec-enhancer，或 OpenClaw 说"用 prd-spec-enhancer 完善这段需求" |
| 门控 | 无必备项缺口；`≈推断`/`⚠️待确认` 均有标注；R 板块（ai-kit 复用清单）已填 |

### ② 架构设计（架构师角色，复杂需求才走）
| 项 | 内容 |
|----|------|
| 输入 | PRD-SPEC |
| 用什么 | 方法论：质量属性驱动 + 领域建模优先（借鉴 product architecture-designer）；参考 `.cursor/rules/global/architecture.mdc` |
| 产出 | `design/<slug>/ARCH-<slug>.md`（领域模型/模块边界/技术选型/ADR）——简单需求可并入 HLD 第 7 节 |
| 执行 | OpenClaw 或 Claude Code 按方法论产出 |
| 门控 | 每个关键技术决策有 ADR；模块边界清晰可落到 HLD |

### ③ 概要设计 HLD（设计角色）
| 项 | 内容 |
|----|------|
| 输入 | PRD-SPEC（+ ARCH） |
| 用什么 | `design/_templates/HLD-前端模板.md`（架构模块/接口契约/状态管理/交互数据流/ai-kit 复用/ADR/风险） |
| 产出 | `design/<slug>/HLD-<slug>-概要设计.md` |
| 执行 | 人工/AI 协作产出 |
| 门控 | 接口契约表完整（供 LLD/TASKS 引用）；ai-kit 复用列明确；ADR ≥ 关键决策数 |

### ④ 详细设计 LLD（设计角色）
| 项 | 内容 |
|----|------|
| 输入 | HLD |
| 用什么 | `design/_templates/LLD-前端模板.md`（组件 API/类型定义/Hook 抽象/边界表/测试要点） |
| 产出 | `design/<slug>/LLD-前端-<slug>.md` |
| 门控 | 组件 API 定稿；类型定义写死（TS strict 可编译）；测试要点可执行 |

### ⑤ 任务规划（项目经理角色）
| 项 | 内容 |
|----|------|
| 输入 | HLD + LLD |
| 用什么 | `design/_templates/TASKS模板.md` + 方法论（定义先行/垂直切片/依赖拓扑/里程碑，借鉴 product dev-task-planner） |
| 产出 | `design/<slug>/<slug>-TASKS-总览.md` + `<slug>-TASKS-执行序列.md` |
| 门控 | 每个任务有 ID/端/模块/依赖/DoD（完成定义）/设计引用；任务只引用设计不重复设计 |

### ⑥ 编码实现（开发角色）
| 项 | 内容 |
|----|------|
| 输入 | LLD + TASKS |
| 用什么 | **方式 A**：OpenClaw 对话驱动（LLD 当 Prompt 生成代码，如 cascade-filter 组件）<br>**方式 B**：`skills/aicoding-codegen/` 接入业务项目（`npx aicoding install --target .`，Codex/Cursor 自动触发）<br>**方式 C**：Cursor + `.cursor/rules/` + `src/ai-kit/` 参考实现 |
| 产出 | 组件/Hook/类型/页面代码 + 单测 |
| 门控 | TS strict 零错误（`npm run type-check`）；复用 ai-kit 不重复造轮子 |

### ⑦ 验证测试（测试角色）
| 项 | 内容 |
|----|------|
| 输入 | 代码 + LLD 测试要点 |
| 用什么 | `npm run type-check`（vue-tsc）+ `npm run test:ai-kit`（vitest）+ `npm run check:ai-kit-contracts`；分层方法论：Hook 单测 → 组件交互测试 → E2E（借鉴 product ai-testing-orchestrator 的"底层稳了才测上层"） |
| 产出 | 测试报告 / vitest 通过记录 |
| 门控 | 关键交互链路有测试（LLD 测试要点全覆盖）；type-check 零错误 |

### ⑧ 代码审查（QA 角色）
| 项 | 内容 |
|----|------|
| 输入 | git diff / 文件变更 |
| 用什么 | 方法论：规则库扫描（适配 TS/Vue：`.cursor/rules/global/*` + `performance/*` + `review/*`）；`npm run check:ai-kit-contracts` 校验契约；产出单体 HTML 报告（借鉴 product code-reviewer） |
| 产出 | `design/<slug>/code-review-<slug>.html` 或审查结论 |
| 门控 | PASS（Error=0）/ FAIL / CONDITIONAL；复用合规、无 any、性能规则命中 |

### ⑨ 交付验收（质检角色）
| 项 | 内容 |
|----|------|
| 输入 | 全部产出 + PRD 验收标准 |
| 用什么 | 逐条核对 PRD-SPEC 第 6 节验收标准（DoD）+ 埋点事件；`design/_templates/` 上线 Checklist |
| 产出 | `design/<slug>/上线Checklist-<slug>.md`；文档链状态流转 `草稿→评审中→已定版→已交付`（更新 design/README.md 索引） |
| 门控 | 验收标准全部勾选；README 索引状态正确 |

---

## 执行方式（三条路任选）

| 场景 | 怎么做 |
|------|--------|
| **Claude Code / Cowork** | 说"按 ai-delivery-workflow 走：<需求>"，工具自动按环节触发对应 skill/模板 |
| **OpenClaw（我）** | 说"开始流水线"或直接丢需求，我按环节逐步执行、每个门控点停下让你确认 |
| **Cursor** | 结合 `.cursor/rules/` 按文档手动走，AI 生成时自动遵守规范 |

## 质量门控速查（每个环节过关标准）

1. 需求：无必备缺口 + 风险标注齐全
2. 设计：接口契约/API/类型写死，ADR 记录取舍
3. 任务：每任务有 DoD 和设计引用
4. 编码：type-check 零错误 + 复用 ai-kit
5. 测试：关键链路有测试覆盖
6. 审查：PASS 或 CONDITIONAL
7. 验收：PRD 验收标准全勾选

## 面试话术（30 秒版）

"我有一套完整的 AI 交付流水线：需求增强 → 架构/概要/详细设计（文档接力）→ 任务编排 → 编码（AI 生成 + 资产复用）→ 分层测试 → 代码审查 → 交付验收，每个环节有模板、有质量门控。cascade-filter 组件就是全链路跑通的样例：从一句'三级筛选框'需求，产出 PRD/HLD/LLD 文档链，再生成通过 type-check 的真实组件代码。"
