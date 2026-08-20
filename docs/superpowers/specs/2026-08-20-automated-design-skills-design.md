# AICoding 自动设计文档 Skills 设计

> 状态：已确认  
> 日期：2026-08-20  
> 范围：将当前 PRD-SPEC → HLD → LLD → TASKS 模板链升级为可分阶段执行、自动接力、可恢复和可机械校验的 Skill 工作流

## 1. 背景与目标

AICoding 已有 `prd-spec-enhancer` Skill，以及 HLD、LLD、TASKS 模板，但后三个阶段仍依赖人工或通用 Agent 按模板生成。主要问题是：执行入口不统一、阶段间容易丢失决策、缺少确定性门控、无法稳定续跑，也不能判断下游是否完整覆盖上游。

本次扩展新增三个专业 Skill 和一个编排 Skill：

```text
spec-delivery-orchestrator
├── prd-spec-enhancer       已存在
├── hld-generator           新增
├── frontend-lld-generator  新增
└── dev-task-planner        新增
```

目标：

- 原始需求或已有 PRD-SPEC 可以自动接力生成 HLD、LLD、TASKS；
- 每个阶段既能独立执行，也能由编排器自动调用；
- 没有真实业务缺口时自动进入下一阶段；
- 接口、权限、字段或关键技术选型缺失时集中暂停确认；
- 已有文档可继续执行，已定版文档不会被静默覆盖；
- 文档结构、引用关系和 TASKS DAG 可由脚本机械校验；
- 下游不能修改上游决策，发现矛盾必须回退上游阶段。

## 2. 非目标

- 不在本次实现代码生成、测试执行或上线发布编排；
- 不为后端、移动端分别创建 LLD Skill；
- 不引入数据库、工作流服务或外部 Agent 平台；
- 不使用 LLM 生成结果替代产品、架构师或研发的关键业务确认；
- 不复制现有 `design/_templates/`，Skill 必须读取同一份模板；
- 不通过删除 `⚠️待确认` 或虚构业务内容绕过门控。

## 3. 总体架构

```text
原始需求 / 现有 PRD
        │
        ▼
prd-spec-enhancer
        │ PRD 门控
        ▼
hld-generator
        │ HLD 门控
        ▼
frontend-lld-generator
        │ LLD 门控
        ▼
dev-task-planner
        │ TASKS 门控
        ▼
跨文档一致性校验 + design/README.md 更新
```

编排器只负责定位、调用、门控、暂停和续跑，不直接生成 HLD、LLD 或 TASKS 的专业内容。每个专业 Skill 对自己的产出负责，并调用统一校验器检查机械契约。

## 4. 输入与文档契约

### 4.1 编排输入

```text
需求内容：原始需求或已有 PRD
需求 slug：英文小写短横线
目标端：frontend
执行模式：new / continue / update
```

示例：

```text
使用 $spec-delivery-orchestrator 自动完成设计链：

需求：做一个设备管理页面，支持搜索、分页、新增编辑删除
slug：device-management
模式：new
```

### 4.2 固定产出

```text
design/<slug>/
├── PRD-SPEC-<slug>.md
├── HLD-<slug>-概要设计.md
├── LLD-前端-<slug>.md
├── <slug>-TASKS-总览.md
└── <slug>-TASKS-执行序列.md
```

### 4.3 文档即状态

不新增独立 pipeline 状态文件。编排器通过文件是否存在、文档头状态、变更记录和待确认项确定当前阶段：

| 已有内容 | 下一步 |
|---|---|
| 无 `design/<slug>/` | 执行 PRD-SPEC |
| 只有 PRD-SPEC | 校验后生成 HLD |
| 已有 HLD | 校验后生成 LLD |
| 已有 LLD | 校验后生成 TASKS |
| 全部存在 | 执行全链路一致性复核 |
| 当前阶段存在阻断项 | 集中询问，确认后从当前阶段继续 |

### 4.4 覆盖规则

- `草稿`：可以保留用户内容并增量更新；
- `评审中`：可以补充缺口，不自动改变已明确决策；
- `已定版`：禁止覆盖，只有明确使用 `mode: update` 才能创建变更；
- `已交付`：禁止直接重生成，先记录变更原因和影响范围；
- 下游发现上游矛盾时回退对应上游阶段；
- 每份文档必须包含状态、版本、slug、上游路径和变更记录；
- 更新模式只修改与本次变更相关的章节，并同步检查所有下游文档。

## 5. Skill 设计

### 5.1 `hld-generator`

触发条件：已有可评审 PRD-SPEC，需要生成或更新前端 HLD、接口契约、模块边界、状态设计、数据流或 ADR。

输入：

- `design/<slug>/PRD-SPEC-<slug>.md`；
- `design/<slug>/ARCH-<slug>.md`，如存在；
- 业务项目已有 API、路由、Store、公共组件和项目规则。

读取：

- `design/_templates/HLD-前端模板.md`；
- `.cursor/rules/global/architecture.mdc`；
- PRD-SPEC 的功能、验收标准和 R 板块；
- 业务项目实际资产。

产出：`design/<slug>/HLD-<slug>-概要设计.md`。

必须明确：

- 页面、组件、Hook、Store 模块边界；
- 接口方法、入参、出参、错误码和使用方；
- 状态属于组件、本地 Hook 还是全局 Store；
- 加载、空数据、失败和权限不足的数据流；
- 业务项目资产或 ai-kit 参考资产复用；
- 关键技术决策、备选方案和 ADR；
- 风险、上下游依赖和降级方式。

阻断条件：

- PRD-SPEC 必备项未完成；
- 接口入参或出参完全未知；
- 权限模型会改变模块边界但未确认；
- 存在两个会显著改变实现的技术方案且尚未决策。

### 5.2 `frontend-lld-generator`

触发条件：已有通过门控的 HLD，需要生成或更新 Vue 3 + TypeScript 前端详细设计、组件 API、类型、Hook、异常或测试设计。

输入：

- PRD-SPEC；
- `design/<slug>/HLD-<slug>-概要设计.md`；
- 目标业务项目目录、依赖、相似代码和工程命令。

读取：

- `design/_templates/LLD-前端模板.md`；
- HLD 接口契约和 ADR；
- 匹配的 `.cursor/rules/`；
- `src/ai-kit/` 参考实现；
- 业务项目已有公共资产。

产出：`design/<slug>/LLD-前端-<slug>.md`。

必须明确：

- 精确文件目录和模块职责；
- 组件 Props、Emits、Expose 和父子关系；
- 完整 TypeScript 类型；
- API services 适配边界；
- Hook 输入、返回值、生命周期和并发行为；
- loading、error、empty、retry 和资源清理；
- 单元测试与组件交互测试点；
- 每项设计对应的 Cursor Rule、业务资产或 ai-kit 参考。

阻断条件：

- HLD 接口契约不完整；
- 组件 API 需要业务或交互决策；
- 目标项目技术栈、依赖或目录无法确定；
- 无法判断应该复用业务资产、参考 ai-kit 还是新增能力。

### 5.3 `dev-task-planner`

触发条件：已有通过门控的 HLD 和 LLD，需要拆解可执行前端开发任务、依赖关系、DoD、design_ref 或执行序列。

输入：

- HLD；
- LLD；
- 业务项目 `package.json` 和实际工程命令。

读取：

- `design/_templates/TASKS模板.md`；
- HLD 模块与接口；
- LLD 文件、组件、Hook、类型和测试点；
- 业务项目已有 type-check、test、lint 和 build 命令。

产出：

- `design/<slug>/<slug>-TASKS-总览.md`；
- `design/<slug>/<slug>-TASKS-执行序列.md`。

每个任务必须包含：

- Task ID、模块和类型；
- 精确创建或修改文件；
- 前置依赖；
- 输入和输出接口；
- DoD；
- `design_ref`；
- 真实验证命令；
- 是否可以并行。

约束：

- TASKS 只能拆解设计，不能新增设计决策；
- Task ID 唯一且依赖 DAG 无循环；
- 类型和 API 定义先于消费方；
- 每个任务必须能独立验证；
- 不虚构 `package.json` 中不存在的命令；
- 文档修改并入其支撑的代码任务，不拆无价值文档任务。

### 5.4 `spec-delivery-orchestrator`

触发条件：用户要求自动走完需求设计链、从需求生成 PRD/HLD/LLD/TASKS、继续已有设计流水线或检查整条设计链一致性。

职责：

1. 验证 slug、模式和目标端；
2. 定位 `design/<slug>/` 现有文档；
3. 识别当前阶段和文档状态；
4. 调用对应专业 Skill；
5. 执行阶段门控；
6. 对结构问题最多自动修正两轮；
7. 对真实业务缺口集中询问；
8. 无阻断项时自动进入下一阶段；
9. 全部生成后执行跨文档一致性检查；
10. 更新 `design/README.md` 的需求状态。

编排器不得自己补写专业设计来绕过子 Skill，也不得在下游修正上游决策。

## 6. 统一机械校验器

新增：

```text
scripts/validate-design-chain.js
```

CLI：

```bash
node scripts/validate-design-chain.js --slug device-management
node scripts/validate-design-chain.js --slug device-management --stage hld --json
```

### 6.1 PRD-SPEC 检查

- 固定板块存在；
- 待确认项数量与汇总一致；
- R 板块包含复用清单和规范引用；
- 引用的 ai-kit 和 Rule 路径存在；
- 阻断级 `⚠️待确认` 不允许传入 HLD。

### 6.2 HLD 检查

- 接口契约表包含接口、方法、入参、出参、错误码和使用方；
- 状态管理、数据流、复用、ADR、风险章节存在；
- 每个 P0 功能可以映射到模块；
- 接口契约不存在未确认的关键字段；
- 引用路径存在。

### 6.3 LLD 检查

- 目录、组件、类型、API、Hook、状态、异常、测试章节存在；
- 组件 Props/Emits 和 Hook 返回值具有明确类型；
- 引用的 HLD 接口存在；
- Rule 和 ai-kit 引用路径存在；
- 不包含 `any` 或未解释的类型断言；
- HLD 模块均有对应实现设计或明确不涉及前端代码。

### 6.4 TASKS 检查

- 每项包含 ID、文件、依赖、DoD、design_ref 和验证命令；
- Task ID 唯一，依赖指向真实 Task；
- DAG 无循环；
- design_ref 指向真实 HLD/LLD 章节；
- 验证命令存在于目标项目 `package.json`；
- LLD 中的组件、Hook、API 和测试点均有对应任务；
- TASKS 不包含超出 PRD scope 的功能。

### 6.5 跨文档检查

- PRD 功能点映射到 HLD 模块；
- HLD 接口映射到 LLD services 和类型；
- LLD 组件、Hook、API、类型和测试点映射到 TASKS；
- PRD 验收标准映射到测试任务；
- slug、状态、版本和上游路径一致。

校验器输出人类可读格式和 JSON 格式，退出码 0 表示通过，退出码 1 表示存在阻断项或机械契约失败。

## 7. 自动修复与失败恢复

```text
专业 Skill 生成文档
        │
        ▼
校验器检查
        ├── 结构缺失/引用错误 → 当前 Skill 自动修正，最多两轮
        ├── 上游矛盾 → 回退上游 Skill
        ├── 真实业务信息缺失 → 集中询问用户
        └── 通过 → 编排器进入下一阶段
```

分类规则：

- **结构问题**：缺章节、字段为空、路径错误、任务依赖错误，可由 Agent 修正；
- **上游问题**：接口、状态、功能范围在上下游冲突，回退上游；
- **业务问题**：权限、字段枚举、接口契约或关键选型缺失，必须询问用户；
- **环境问题**：项目路径、package.json、模板或规则不存在，停止并报告恢复命令。

编排器不得无限重试。两轮结构修正仍失败时停止，输出校验器结果、失败阶段和建议动作。

## 8. 测试与 Skill 评估

### 8.1 Skill 基线测试

遵循 `superpowers:writing-skills`：创建 Skill 前，先使用没有对应 Skill 的 Agent 运行压力场景，记录实际遗漏、错误假设和越权行为。加入 Skill 后用相同输入复测。

每个 Skill 的 `evals/evals.json` 至少覆盖：

- 标准成功场景；
- 上游缺字段；
- 已有文档继续执行；
- 已定版文档禁止覆盖；
- ai-kit 有可复用资产；
- 业务项目已有自有组件；
- 缺少接口或权限时正确暂停；
- 非目标请求不误触发。

编排器增加端到端场景：一句模糊需求经过 PRD-SPEC、HLD、LLD、TASKS 并通过跨文档一致性校验。

### 8.2 校验器测试

新增 Node 测试，使用临时目录和固定 Markdown fixture，覆盖：

- 完整链通过；
- 缺章节失败；
- 断裂的上游路径失败；
- 重复 Task ID 失败；
- 缺失 Task 依赖失败；
- TASKS DAG 循环失败；
- design_ref 指向不存在章节失败；
- package.json 中不存在验证命令时失败；
- JSON 输出和退出码正确。

### 8.3 项目验证

`package.json` 增加设计链校验器的语法和单元测试，但不要求仓库内所有草稿需求每次都通过门控。CI 只检查校验器自身和标记为 `已定版/已交付` 的设计链。

## 9. 文件结构

```text
skills/
├── hld-generator/
│   ├── SKILL.md
│   ├── spec/checklist.md
│   └── evals/evals.json
├── frontend-lld-generator/
│   ├── SKILL.md
│   ├── spec/checklist.md
│   └── evals/evals.json
├── dev-task-planner/
│   ├── SKILL.md
│   ├── spec/checklist.md
│   └── evals/evals.json
└── spec-delivery-orchestrator/
    ├── SKILL.md
    └── evals/evals.json

scripts/
└── validate-design-chain.js

tests/
└── validate-design-chain.test.js
```

现有 `design/_templates/` 继续作为唯一模板来源。

## 10. 分发边界

第一阶段先作为 AICoding 仓库内 Skills 验证，不立即扩大默认 `aicoding install` 的发布范围。待端到端 eval 和真实需求试跑通过后，再单独设计 `--with-spec`，将编排器、四个专业 Skill 和模板安装到业务项目。

这样可以避免尚未验证的设计链影响当前稳定的 Codegen 安装器。

## 11. 完成定义

实现完成必须同时满足：

1. 四个 Skill 具备准确触发描述、输入输出契约和阻断条件；
2. 三个专业 Skill 可独立执行；
3. 编排器可以从任意已有阶段继续；
4. 无阻断项时可以自动完成 PRD-SPEC → HLD → LLD → TASKS；
5. 关键业务缺口被集中询问，不被虚构；
6. 已定版和已交付文档不会被静默覆盖；
7. 校验器可发现结构、引用、覆盖、DAG 和验证命令问题；
8. Skill 基线测试和加入 Skill 后的复测均有记录；
9. 校验器 Node 测试全部通过；
10. `npm run check` 全绿；
11. `docs/ai-delivery-workflow.md`、`skills/README.md`、`项目总结.md` 和 `面试大纲.md` 与最终实现一致。
