# <slug>-TASKS

> 需求 slug：<slug> ｜ 上游：design/<slug>/HLD + LLD

## 一、总览表

| 任务ID | 模块 | 类型 | 依赖 | 负责 Agent | DoD（完成定义） | design_ref |
|--------|------|------|------|-----------|----------------|-----------|
| T1 | API 封装 | api | - | frontend-vue-coder | api/<slug>.ts + 类型 + 单测 | LLD §5 |
| T2 | 页面骨架 | page | T1 | frontend-vue-coder | pages/<slug>/index.vue + 路由 | LLD §3 |
| T3 | 组件开发 | component | T2 | frontend-vue-coder | 组件 + Props + 单测 | LLD §3 |
| T4 | 交互联调 | page | T2,T3 | frontend-vue-coder | 全流程跑通 | HLD §5 |
| T5 | UI 测试 | test | T4 | ui-tester | 交互用例通过 | LLD §9 |

## 二、执行序列（编排器输入）

### DAG
```
T1 → T2 → T3 → T4 → T5
```
（无依赖任务可并行：如 T2/T3 互不依赖时可并行）

### 门控
- M1（T1-T3 完成）：eslint + vue-tsc + vitest + validate-ai-kit.js
- M2（T4 完成）：api-tester + ui-tester 报告
- M3（T5 完成）：CR + DoD 对照

### 上下文包组装（编排器自动）
- design_ref 章节：LLD §2/§3/§5 + HLD §3
- rules：.cursor/rules/global/* + 对应场景（table/forms/charts）
- prompts：prompts/<场景>/ 命中项
- ai-kit refs：src/ai-kit/<模块>/ 清单
- 业务事实：package.json 依赖 + 已有相似页面 + 接口定义
