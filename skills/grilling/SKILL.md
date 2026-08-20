---
name: grilling
description: 无情拷问（Grill）用户的计划/方案/设计/面试叙事。把方案映射成决策树（design tree），按轮次逐层追问，直到没有静默假设。适用于：Spec 需求澄清、架构方案压力测试、面试前拷问自己的项目叙事。触发词：拷问、grill、帮我挑刺、压力测试我的方案。
---

# Grilling（无情拷问）

Interview the user relentlessly until you reach a shared understanding. Map this as a **design tree**: every decision branches into the decisions that hang off it.

Work the tree in **rounds**. The **frontier** is every decision whose prerequisites are already settled: the questions you can ask _now_ without guessing at answers you haven't heard yet. Ask the whole frontier in one round: number each question and give your recommended answer. Then wait for the user's answers before the next round.

Each question should be formatted like so:

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

Each round the user answers reshapes the tree: settled decisions push the frontier outward and unblock questions that depended on them. Recompute the frontier and ask the next round. A question whose answer depends on another question still open in this round belongs to a _later_ round, not this one.

Finding _facts_ is your job, never the user's. When a frontier question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it; don't ask the user for anything you could look up yourself. Don't block on it: a running exploration is an unsettled prerequisite, so only the questions downstream of it wait for the sub-agent to report; ask the rest of the frontier now. The _decisions_ are the user's: put each to them and wait.

The session is done when the frontier is empty: every branch of the design tree visited, nothing left silently assumed. Do not act on it until the user confirms you have reached a shared understanding.

---

## 与 SDD 流程的结合（AICoding 适配注记）

- **需求澄清阶段**：frontier 第一轮 ≈ SDD 的"澄清问题清单"（场景/数据方式/UI 形态/边界/回显），但 grilling 更狠——每个回答都会展开新的分支，直到没有"想当然"。
- **HLD 评审阶段**：用 grilling 拷问 ADR——每个"为什么这么选"都可以继续问"备选方案为什么不选？代价是什么？"
- **面试准备**：让 AI 用 grilling 拷问你的项目叙事（IOC / CascadeFilter / AI Coding），暴露叙事里的静默假设，提前补漏洞。
- 事实查找（查代码、查文档、查数据）由 AI 完成，不占用用户的轮次；用户只回答**决策类**问题。
