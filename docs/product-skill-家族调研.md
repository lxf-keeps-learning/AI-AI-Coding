# product 项目 AI Skill 家族全景（调研笔记）

> 来源：`/Users/lxf/Downloads/product/.qoder/skills/`（公司内部项目）
> 整理日期：2026-08-20 ｜ 用途：学习团队 AI 工程化体系 + 面试弹药
> ⚠️ 已脱敏：内部域名/系统名已移除；公司内部资产，仅供个人学习，勿公开传播

## 一句话认知

product 的 11 个 skill 不是零散工具，而是一条**完整的 AI 交付流水线**（skill 家族）：
每个环节一个专用 AI 专家，**上一个的产出文件 = 下一个的输入**，质量门控内建。

## 流水线全景

```
① prd-spec-enhancer      需求完善：MRD/原始 PRD → PRD-SPEC
        ↓
② architecture-designer  架构设计：PRD → 架构方案（领域模型/模块边界/ADR）
        ↓
③ design-spec-generator  设计文档：PRD → HLD + 各端 LLD
        ↓
④ dev-task-planner       任务规划：PRD+HLD+LLD → 任务清单/DAG/里程碑
        ↓
⑤ ai-coding-orchestrator 多专家并行编码：任务+DAG → 代码+单测+Mock+质量报告
        ↓
⑥ ai-testing-orchestrator 分层测试：代码 → curl 脚本/E2E/工作流验证/门控评分
        ↓
⑦ code-reviewer          代码审查：diff → HTML 审查报告（PASS/FAIL）
```

辅助：`code-archaeologist`（老代码考古）、`grilling`（拷问压力测试）、`subtree-sync`（git 子仓库同步，product 专用）。

## 逐个 skill（岗位视角）

| Skill | 岗位类比 | 干什么 | 输入 → 输出 |
|-------|---------|--------|------------|
| prd-spec-enhancer | 产品经理 | 补全需求成规范 Spec | MRD/需求片段 → PRD-SPEC |
| architecture-designer | 架构师 | 定架构风格/领域边界/ADR | PRD → 架构方案 |
| design-spec-generator | 设计 | 产出可开发的设计文档 | PRD → HLD + LLD |
| dev-task-planner | 项目经理 | 拆任务/依赖图/里程碑 | 设计文档 → 任务 DAG |
| ai-coding-orchestrator | 开发组长 | 调度多编码 Agent 并行写码 | 任务+DAG → 代码+测试 |
| ai-testing-orchestrator | 测试主管 | 递进验证 + 质量门控 | 设计+代码 → 测试报告+评分 |
| code-reviewer | QA | 规则库扫 diff 出报告 | git diff → HTML 报告 |
| code-archaeologist | 考古学家 | 挖老代码隐式业务规则 | 老代码 → 知识/变更方案 |
| grilling | 拷问官 | 追问到方案无漏洞 | 方案 → 共识 |
| subtree-sync | 运维 | git subtree 同步子仓库 | —（product 专用） |

## 核心机制（值得吸收的共性）

1. **checklist 驱动**：每个 skill 都有"元素检查清单"——必要性（必备/条件必备/可选）+ 触发条件 + 补全动作
2. **来源标注**：默认不标即已确认；`≈推断`（AI 补全需复核）、`⚠️待确认`（未定需补齐）、`(KB)`/`(MCP)`（系统来源）
3. **不编造**：真实业务信息拿不到就标待确认，一次性集中提问用户
4. **交互式确认**：所有缺口整理成一个清单一次问完，不边补边打断（与 grilling 的"一轮问完 frontier"同一思想）
5. **质量门控内建**：编码有 DoD、测试有评分、审查有 PASS/FAIL

## 技术栈绑定（换项目需适配）

- 后端：Golang + go-zero + Eino + MySQL（或 PHP Laravel/Lumen）
- 前端：React 18 + TS + @arco-design/web-react + FlowGram.ai
- 知识库：内部知识库 CLI rag 检索；MCP 内部系统接口（预留）
- 工具链：Qoder（.qoder 目录）

## 已吸收到 AICoding（2026-08-20）

- `skills/grilling/`：拷问方法论 + SDD 结合注记
- `skills/prd-spec-enhancer/`：去教育化适配（checklist A-G + R 复用板块、template、lexicon 机制），知识来源改为 AICoding 资产（design/_templates、.cursor/rules、src/ai-kit）

## 面试弹药（对应明天 Hungry Studio JD）

JD 的端到端 AI Coding 流水线 + SDD + Harness + 质量门控 ≈ product 这套体系的缩小版。
话术：见过/参与过完整 AI 研发流水线，各环节独立 AI 角色 + 文档接力 + 质量门控。
