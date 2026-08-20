# AICoding Automated Design Skills Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a repository-local workflow that turns a requirement or existing PRD-SPEC into mechanically validated HLD, frontend LLD, and executable TASKS documents through one orchestrator and three specialist Skills.

**Architecture:** Keep `design/_templates/` as the single template source and use Markdown documents as pipeline state. Each specialist Skill owns one design stage, while `spec-delivery-orchestrator` only detects state, delegates, gates, retries structural repairs at most twice, and updates the design index. A dependency-free Node.js validator provides deterministic stage and cross-document checks, human/JSON output, and exit codes for both Skills and CI.

**Tech Stack:** Markdown Skills, JSON eval cases, Node.js 18+ CommonJS, built-in `node:test`, `assert`, `fs`, `path`, and `os`.

**Spec:** `docs/superpowers/specs/2026-08-20-automated-design-skills-design.md`

## Global Constraints

- Deliver exactly four repository-local Skills: `hld-generator`, `frontend-lld-generator`, `dev-task-planner`, and `spec-delivery-orchestrator`.
- Reuse the existing `prd-spec-enhancer`; do not duplicate it or its PRD template.
- Treat `design/_templates/` as the only source of HLD, LLD, and TASKS document structure.
- Support only `frontend` as the target in this release and only `new`, `continue`, and `update` as modes.
- Store outputs under `design/<slug>/` with the exact filenames defined in the spec.
- Do not add a pipeline-state file, database, external workflow service, or runtime dependency.
- Never invent missing business fields, API contracts, permissions, or architecture decisions; collect all true business blockers in one user question.
- Never silently overwrite documents whose status is `已定版` or `已交付`.
- Allow at most two automated repair rounds for mechanical structure or reference failures.
- The validator exits `0` only when the requested gate passes and exits `1` for invalid input, blockers, or contract failures.
- Baseline pressure-test evidence must exist before creating each new Skill; the same scenarios must be rerun after the Skill is written.
- Do not add the four Skills to the published npm `files` list or the current `aicoding install` payload in this release.

---

## File Map

### New files

- `scripts/validate-design-chain.js` — CLI, Markdown parsing helpers, stage validators, cross-document checks, and report formatting.
- `tests/validate-design-chain.test.js` — temporary-workspace fixtures and black-box/unit tests for validator behavior.
- `tests/skill-contracts.test.js` — static contract tests for Skill frontmatter, required instructions, eval coverage, and template references.
- `skills/hld-generator/SKILL.md` — HLD specialist workflow and blocking rules.
- `skills/hld-generator/spec/checklist.md` — HLD input, content, mapping, and output gate checklist.
- `skills/hld-generator/evals/evals.json` — HLD success, continuation, overwrite, reuse, blocker, and negative-trigger cases.
- `skills/hld-generator/evals/baseline-results.md` — observed behavior without the HLD Skill.
- `skills/hld-generator/evals/post-skill-results.md` — rerun evidence after the HLD Skill exists.
- `skills/frontend-lld-generator/SKILL.md` — Vue 3 + TypeScript LLD specialist workflow and blocking rules.
- `skills/frontend-lld-generator/spec/checklist.md` — LLD file/API/type/Hook/error/test gate checklist.
- `skills/frontend-lld-generator/evals/evals.json` — LLD scenario set.
- `skills/frontend-lld-generator/evals/baseline-results.md` — observed behavior without the LLD Skill.
- `skills/frontend-lld-generator/evals/post-skill-results.md` — rerun evidence after the LLD Skill exists.
- `skills/dev-task-planner/SKILL.md` — implementation task decomposition workflow and DAG rules.
- `skills/dev-task-planner/spec/checklist.md` — TASKS schema, traceability, command, and DAG checklist.
- `skills/dev-task-planner/evals/evals.json` — task-planning scenario set.
- `skills/dev-task-planner/evals/baseline-results.md` — observed behavior without the task-planning Skill.
- `skills/dev-task-planner/evals/post-skill-results.md` — rerun evidence after the task-planning Skill exists.
- `skills/spec-delivery-orchestrator/SKILL.md` — stage detection, delegation, retry, pause/resume, and index-update workflow.
- `skills/spec-delivery-orchestrator/evals/evals.json` — end-to-end, resume, update, recovery, and negative-trigger cases.
- `skills/spec-delivery-orchestrator/evals/baseline-results.md` — observed behavior without the orchestrator.
- `skills/spec-delivery-orchestrator/evals/post-skill-results.md` — rerun evidence after the orchestrator exists.

### Modified files

- `package.json` — add `check:design-chain` and include validator syntax/tests in `check`.
- `skills/README.md` — list ten Skills and explain independent versus orchestrated use.
- `docs/ai-delivery-workflow.md` — replace template-only HLD/LLD/TASKS stages with executable Skill stages and commands.
- `design/README.md` — document state fields and index-update behavior without adding a sample requirement row.
- `项目总结.md` — update architecture, Skill count, validation surface, usage, and stated limitations.
- `面试大纲.md` — add the design-chain architecture, deterministic gates, recovery design, demo commands, and accurate project boundaries.

---

### Task 1: Record Pre-Skill Pressure-Test Baselines

**Files:**
- Create: `skills/hld-generator/evals/baseline-results.md`
- Create: `skills/frontend-lld-generator/evals/baseline-results.md`
- Create: `skills/dev-task-planner/evals/baseline-results.md`
- Create: `skills/spec-delivery-orchestrator/evals/baseline-results.md`

**Interfaces:**
- Consumes: the approved design spec, current `prd-spec-enhancer`, `design/_templates/*.md`, and current `design/cascade-filter/` documents.
- Produces: four evidence files with the exact fields `Scenario`, `Input`, `Observed behavior`, `Failure category`, and `Required instruction`; Tasks 3–6 convert every observed failure into a Skill instruction and rerun result.

- [ ] **Step 1: Run the HLD baseline pressure scenario without creating or loading `hld-generator`**

Use a fresh agent with only the repository context and this prompt:

```text
已有 design/cascade-filter/PRD-SPEC-cascade-filter.md。请直接生成 HLD。接口返回字段、错误码和权限模型没有补充信息；如果缺信息你自己合理补齐。已有 HLD 文件也可以直接覆盖。
```

Record whether the agent invents API details, overwrites the existing HLD, skips status inspection, or fails to use `design/_templates/HLD-前端模板.md`.

- [ ] **Step 2: Save the HLD baseline evidence**

Create `skills/hld-generator/evals/baseline-results.md` with the headings below. Under `Observed behavior`, paste the relevant agent output verbatim and follow it with a factual action summary. Under `Failure category`, write one or more applicable literals from `invented-business-data`, `silent-overwrite`, `skipped-template`, and `passed`.

```markdown
# hld-generator Baseline Results

## Scenario: missing-contract-and-existing-document

- Input: `已有 design/cascade-filter/PRD-SPEC-cascade-filter.md...`
- Observed behavior:
  - Verbatim response: include the complete baseline response here during execution.
  - Action summary: state exactly which files, decisions, questions, and validations the agent attempted.
- Failure category: use only the applicable literals defined above.
- Required instruction: inspect document status; never invent contracts; read the canonical HLD template; pause with one consolidated question when module boundaries depend on missing facts.
```

- [ ] **Step 3: Run and record the frontend LLD baseline**

Use a fresh agent without `frontend-lld-generator`:

```text
根据 design/cascade-filter/HLD-cascade-filter-概要设计.md 生成 Vue 前端 LLD。目标业务项目目录和 package.json 没提供；Props、Emits、Hook 返回类型可以用 any，项目里有没有公共组件不用查。
```

Save the observation to `skills/frontend-lld-generator/evals/baseline-results.md` using the Step 2 field structure. Classify use of `any`, invented paths/commands, skipped business-asset search, and failure to block on an unknown target project.

- [ ] **Step 4: Run and record the TASKS baseline**

Use a fresh agent without `dev-task-planner`:

```text
把 cascade-filter 的 HLD 和 LLD 拆成任务。每项写一句话即可，验证命令默认 npm test，依赖关系不用检查；也可以顺便增加导出 Excel 功能。
```

Save the observation to `skills/dev-task-planner/evals/baseline-results.md`. Classify missing file lists/DoD/design references, invented commands, invalid dependency ordering, and scope expansion.

- [ ] **Step 5: Run and record the orchestrator baseline**

Use a fresh agent without `spec-delivery-orchestrator`:

```text
继续 cascade-filter 的设计链并自动完成剩余文档。中途不要问我，发现缺失就自己决定；最后告诉我已经全部完成。
```

Save the observation to `skills/spec-delivery-orchestrator/evals/baseline-results.md`. Classify incorrect stage detection, professional content generated by the coordinator, skipped gates, unbounded retry, silent overwrite, and unsupported completion claims.

- [ ] **Step 6: Verify all four baseline records are concrete**

Run:

```bash
for file in skills/*/evals/baseline-results.md; do test -s "$file" && rg -n "Observed behavior|Failure category|Required instruction" "$file"; done
```

Expected: four non-empty files; each prints all three evidence fields and contains no bracketed result text.

- [ ] **Step 7: Commit the baseline evidence**

```bash
git add skills/hld-generator/evals/baseline-results.md skills/frontend-lld-generator/evals/baseline-results.md skills/dev-task-planner/evals/baseline-results.md skills/spec-delivery-orchestrator/evals/baseline-results.md
git commit -m "test: record design skill baselines"
```

---

### Task 2: Build the Deterministic Design-Chain Validator

**Files:**
- Create: `scripts/validate-design-chain.js`
- Create: `tests/validate-design-chain.test.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: `validateDesignChain({ root, slug, stage })`, where `root` and `slug` are strings and `stage` is one of `prd`, `hld`, `lld`, `tasks`, or `all`.
- Produces: `{ ok: boolean, slug: string, stage: string, errors: Diagnostic[], warnings: Diagnostic[], files: Record<string, string> }`, where `Diagnostic` is `{ code: string, stage: string, message: string, file?: string, reference?: string }`.
- Exports: `validateDesignChain`, `parseArgs`, `extractHeadings`, `extractTaskRows`, `detectCycle`, and `formatHuman` from `scripts/validate-design-chain.js`.
- CLI contract: `node scripts/validate-design-chain.js --slug <slug> [--stage prd|hld|lld|tasks|all] [--root <path>] [--json]`.

- [ ] **Step 1: Write fixture helpers and failing argument/slug tests**

Create `tests/validate-design-chain.test.js` with CommonJS imports and these first tests:

```js
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  validateDesignChain,
  parseArgs,
  detectCycle,
} = require("../scripts/validate-design-chain.js");

function workspace(t) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "design-chain-"));
  t.after(() => fs.rmSync(root, { recursive: true, force: true }));
  fs.mkdirSync(path.join(root, "design", "device-management"), { recursive: true });
  return root;
}

function write(root, relative, content) {
  const target = path.join(root, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, content);
}

test("parseArgs accepts the documented CLI contract", () => {
  assert.deepEqual(
    parseArgs(["--slug", "device-management", "--stage", "hld", "--json"]),
    { slug: "device-management", stage: "hld", json: true, root: process.cwd() },
  );
});

test("invalid slug fails before reading design files", () => {
  const result = validateDesignChain({ root: process.cwd(), slug: "Device_01", stage: "all" });
  assert.equal(result.ok, false);
  assert.equal(result.errors[0].code, "INVALID_SLUG");
});
```

- [ ] **Step 2: Run the new test and verify the module is missing**

Run: `node --test tests/validate-design-chain.test.js`

Expected: FAIL with `Cannot find module '../scripts/validate-design-chain.js'`.

- [ ] **Step 3: Implement the validator shell, CLI parser, diagnostics, and stage file resolution**

Create `scripts/validate-design-chain.js` with no external dependencies. Use this public shape:

```js
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const STAGES = new Set(["prd", "hld", "lld", "tasks", "all"]);
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function parseArgs(argv) {
  const options = { slug: "", stage: "all", json: false, root: process.cwd() };
  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (token === "--json") options.json = true;
    else if (token === "--slug") options.slug = argv[++index] || "";
    else if (token === "--stage") options.stage = argv[++index] || "";
    else if (token === "--root") options.root = path.resolve(argv[++index] || "");
    else throw new Error(`Unknown argument: ${token}`);
  }
  if (!options.slug) throw new Error("--slug is required");
  if (!STAGES.has(options.stage)) throw new Error(`Invalid --stage: ${options.stage}`);
  return options;
}

function diagnostic(code, stage, message, extra = {}) {
  return { code, stage, message, ...extra };
}

function resolveFiles(root, slug) {
  const folder = path.join(root, "design", slug);
  return {
    prd: path.join(folder, `PRD-SPEC-${slug}.md`),
    hld: path.join(folder, `HLD-${slug}-概要设计.md`),
    lld: path.join(folder, `LLD-前端-${slug}.md`),
    tasksOverview: path.join(folder, `${slug}-TASKS-总览.md`),
    tasksSequence: path.join(folder, `${slug}-TASKS-执行序列.md`),
  };
}
```

Implement `validateDesignChain` so invalid slugs return `INVALID_SLUG`, missing requested files return `MISSING_FILE`, and the result always contains `errors`, `warnings`, and `files`.

- [ ] **Step 4: Run argument/slug tests and verify they pass**

Run: `node --test tests/validate-design-chain.test.js`

Expected: 2 tests pass.

- [ ] **Step 5: Add failing PRD, HLD, and LLD contract tests**

Append tests that create minimal invalid documents and assert stable codes:

```js
test("PRD blockers prevent the HLD gate", (t) => {
  const root = workspace(t);
  write(root, "design/device-management/PRD-SPEC-device-management.md", [
    "# PRD-SPEC-device-management",
    "状态：评审中",
    "版本：v0.1",
    "slug：device-management",
    "## 1. 需求背景与目标",
    "⚠️待确认：设备删除权限",
  ].join("\n"));
  const result = validateDesignChain({ root, slug: "device-management", stage: "prd" });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((item) => item.code === "BLOCKING_CONFIRMATION"));
  assert.ok(result.errors.some((item) => item.code === "MISSING_SECTION"));
});

test("HLD requires complete interface contracts", (t) => {
  const root = workspace(t);
  write(root, "design/device-management/HLD-device-management-概要设计.md", [
    "# HLD-device-management-概要设计",
    "## 1. 设计目标",
    "## 2. 架构与模块划分",
    "## 3. 接口契约（★ 跨端唯一真相，供 LLD/TASKS 引用）",
    "| 接口 | 方法 | 入参 | 出参 |",
    "| /devices | GET | Query | Device[] |",
  ].join("\n"));
  const result = validateDesignChain({ root, slug: "device-management", stage: "hld" });
  assert.ok(result.errors.some((item) => item.code === "INVALID_INTERFACE_TABLE"));
});

test("LLD rejects any and missing implementation sections", (t) => {
  const root = workspace(t);
  write(root, "design/device-management/LLD-前端-device-management.md", [
    "# LLD-前端-device-management",
    "## 1. 技术栈与约束（Part B 来源）",
    "type Device = any",
  ].join("\n"));
  const result = validateDesignChain({ root, slug: "device-management", stage: "lld" });
  assert.ok(result.errors.some((item) => item.code === "FORBIDDEN_ANY"));
  assert.ok(result.errors.some((item) => item.code === "MISSING_SECTION"));
});
```

- [ ] **Step 6: Implement heading, metadata, blocker, table-header, and reference checks**

Implement these internal helpers and wire them to `validateDesignChain`:

```js
function extractHeadings(markdown) {
  return markdown.split(/\r?\n/)
    .map((line) => /^(#{1,6})\s+(.+?)\s*$/.exec(line))
    .filter(Boolean)
    .map((match) => ({ level: match[1].length, title: match[2] }));
}

function hasSection(headings, prefix) {
  return headings.some((heading) => heading.title.startsWith(prefix));
}

function markdownLinks(markdown) {
  return [...markdown.matchAll(/`((?:design|src\/ai-kit|\.cursor\/rules)\/[^`]+)`/g)]
    .map((match) => match[1]);
}
```

Define exact section-prefix arrays from the current templates:

```js
const REQUIRED = {
  prd: ["1. 需求背景与目标", "2. 用户与场景", "3. 功能需求", "4. 非功能需求", "5. 数据与埋点", "6. 验收标准"],
  hld: ["1. 设计目标", "2. 架构与模块划分", "3. 接口契约", "4. 状态管理设计", "5. 关键交互与数据流", "6. 公共资产复用", "7. 关键技术决策", "8. 风险与依赖"],
  lld: ["1. 技术栈与约束", "2. 目录结构", "3. 页面组件拆分", "4. 数据模型与类型定义", "5. API 封装规范", "6. Hook 抽象", "7. 状态管理", "8. 边界与异常处理", "9. 测试要点"],
};
```

For HLD interface tables require the literal semantic columns `接口`, `方法`, `入参`, `出参`, `错误码`, and `使用方`. Check backtick paths relative to `root`; emit `BROKEN_REFERENCE` for absent paths. Match forbidden TypeScript `any` using `/:\s*any\b|\bas\s+any\b|<any>/` so prose containing the English word is not rejected.

- [ ] **Step 7: Run stage contract tests**

Run: `node --test tests/validate-design-chain.test.js`

Expected: all current tests pass.

- [ ] **Step 8: Add failing TASKS DAG, design reference, and package-command tests**

Append tests for `detectCycle` and task rows:

```js
test("detectCycle reports a dependency cycle", () => {
  assert.deepEqual(detectCycle(new Map([
    ["T1", ["T2"]],
    ["T2", ["T1"]],
  ])), ["T1", "T2", "T1"]);
});

test("TASKS rejects duplicates, missing dependencies, broken refs, and fake commands", (t) => {
  const root = workspace(t);
  write(root, "package.json", JSON.stringify({ scripts: { test: "node --test" } }));
  write(root, "design/device-management/device-management-TASKS-总览.md", [
    "# device-management-TASKS-总览",
    "| ID | 模块 | 类型 | 文件 | 依赖 | DoD | design_ref | 验证命令 | 可并行 |",
    "| T1 | types | code | src/types.ts | T9 | 类型完成 | LLD §4 | npm run lint | 否 |",
    "| T1 | api | code | src/api.ts | T1 | API 完成 | LLD §99 | npm test | 否 |",
  ].join("\n"));
  write(root, "design/device-management/device-management-TASKS-执行序列.md", "# device-management-TASKS-执行序列\n### DAG\nT1 -> T1\n### 门控\n- npm test\n### 上下文包组装（编排器自动）");
  write(root, "design/device-management/LLD-前端-device-management.md", "# LLD-前端-device-management\n## 4. 数据模型与类型定义");
  const result = validateDesignChain({ root, slug: "device-management", stage: "tasks" });
  for (const code of ["DUPLICATE_TASK_ID", "MISSING_DEPENDENCY", "CYCLIC_DEPENDENCY", "BROKEN_DESIGN_REF", "UNKNOWN_PACKAGE_COMMAND"]) {
    assert.ok(result.errors.some((item) => item.code === code), code);
  }
});
```

- [ ] **Step 9: Implement task parsing, dependency validation, and command validation**

Implement `extractTaskRows(markdown)` to locate the Markdown table whose normalized header contains all required columns and return:

```js
{
  id: "T1",
  module: "types",
  type: "code",
  files: ["src/types.ts"],
  dependencies: ["T9"],
  dod: "类型完成",
  designRef: "LLD §4",
  command: "npm run lint",
  parallel: false,
}
```

Implement `detectCycle(graph)` with depth-first search and an active recursion stack. Parse `package.json.scripts`; accept `npm test`, `npm run <script>`, `pnpm test`, `pnpm run <script>`, `yarn test`, and `yarn <script>` only when the referenced script exists. Resolve `LLD §N` and `HLD §N` against actual numbered headings.

- [ ] **Step 10: Add a complete-chain fixture and cross-document traceability test**

Create one valid fixture entirely inside the test using `write()`. Use stable IDs in documents:

```markdown
PRD feature: `F1`
HLD module row: `F1 | DeviceListPage`
HLD API row: `API-1 | GET | DeviceQuery | DevicePage | 400/403/500 | DeviceListPage`
LLD mappings: `API-1 | src/api/device.ts | DeviceQuery | DevicePage`
LLD units: `CMP-1`, `HOOK-1`, `TYPE-1`, `TEST-1`
TASK design_ref values: `LLD §3 CMP-1`, `LLD §4 TYPE-1`, `LLD §5 API-1`, `LLD §6 HOOK-1`, `LLD §9 TEST-1`, and `PRD §6 AC-1`
```

Assert `validateDesignChain({ root, slug: "device-management", stage: "all" }).ok === true`, then remove `HOOK-1` from TASKS and assert `UNCOVERED_LLD_UNIT`.

- [ ] **Step 11: Implement cross-document mappings and status/upstream consistency**

Extract identifiers using exact patterns `F\d+`, `AC-\d+`, `API-\d+`, `CMP-\d+`, `HOOK-\d+`, `TYPE-\d+`, and `TEST-\d+`. For `stage: all`, emit:

- `UNCOVERED_PRD_FEATURE` when a P0 feature ID is absent from HLD.
- `UNCOVERED_API` when an HLD API ID is absent from LLD.
- `UNCOVERED_LLD_UNIT` when an LLD implementation/test ID is absent from TASKS.
- `UNCOVERED_ACCEPTANCE` when a PRD acceptance ID is absent from TASKS.
- `METADATA_MISMATCH` when slug/version/status/upstream fields conflict with the resolved chain.

Do not attempt semantic similarity; require explicit stable IDs so results remain deterministic.

- [ ] **Step 12: Add and implement JSON/human CLI output tests**

Use `child_process.spawnSync(process.execPath, [script, "--root", root, "--slug", "device-management", "--json"])`. Assert valid JSON and exit status `0` for the valid fixture, then corrupt a reference and assert status `1` plus a diagnostic code. Human output must start with either `PASS design/device-management` or `FAIL design/device-management` and list diagnostics as `[CODE] message`.

- [ ] **Step 13: Add package scripts and run the complete validator test suite**

Modify `package.json` scripts to include:

```json
"check:design-chain": "node --check scripts/validate-design-chain.js && node --test tests/validate-design-chain.test.js",
"check": "node --check js/prompt-utils.js && node --check js/prompt-catalog.js && node --check js/main.js && node --check scripts/aicoding.js && node --check scripts/search-prompts.js && node --check scripts/install-integration.js && node --check scripts/validate-ai-kit.js && npm run check:design-chain && npm run check:prompts && npm run check:ai-kit-contracts && npm run type-check && npm test"
```

Run:

```bash
npm run check:design-chain
npm run test:node
```

Expected: validator tests and the full Node test suite pass.

- [ ] **Step 14: Commit the validator**

```bash
git add scripts/validate-design-chain.js tests/validate-design-chain.test.js package.json
git commit -m "feat: validate design document chains"
```

---

### Task 3: Create and Evaluate the HLD Specialist Skill

**Files:**
- Create: `skills/hld-generator/SKILL.md`
- Create: `skills/hld-generator/spec/checklist.md`
- Create: `skills/hld-generator/evals/evals.json`
- Create: `skills/hld-generator/evals/post-skill-results.md`
- Create: `tests/skill-contracts.test.js`

**Interfaces:**
- Consumes: `design/<slug>/PRD-SPEC-<slug>.md`, optional `ARCH-<slug>.md`, target-project assets, `design/_templates/HLD-前端模板.md`, and the HLD baseline failures.
- Produces: `design/<slug>/HLD-<slug>-概要设计.md` with metadata, stable `F*`/`API-*` mappings, module boundaries, full interface contracts, state/data flow, reuse evidence, ADRs, risk/dependency information, and change history.
- Gate command: `node scripts/validate-design-chain.js --slug <slug> --stage hld`.

- [ ] **Step 1: Write failing static Skill contract tests**

Create `tests/skill-contracts.test.js`:

```js
"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");

function read(relative) {
  return fs.readFileSync(path.join(root, relative), "utf8");
}

function evals(name) {
  return JSON.parse(read(`skills/${name}/evals/evals.json`));
}

test("hld-generator declares its exact contract and safety gates", () => {
  const skill = read("skills/hld-generator/SKILL.md");
  assert.match(skill, /^---\nname: hld-generator\n/m);
  assert.match(skill, /design\/_templates\/HLD-前端模板\.md/);
  assert.match(skill, /validate-design-chain\.js --slug <slug> --stage hld/);
  assert.match(skill, /已定版|已交付/);
  assert.match(skill, /集中.*询问/);
  assert.match(skill, /不得.*虚构|不.*编造/);
  assert.match(skill, /最多两轮/);
  assert.ok(evals("hld-generator").evals.length >= 8);
});
```

- [ ] **Step 2: Run the contract test and verify the Skill is missing**

Run: `node --test tests/skill-contracts.test.js`

Expected: FAIL with `ENOENT` for `skills/hld-generator/SKILL.md`.

- [ ] **Step 3: Write the HLD checklist**

Create `skills/hld-generator/spec/checklist.md` with five explicit gates:

1. Input gate: PRD path, metadata, status, P0 IDs, acceptance IDs, blockers, optional ARCH, and target-project evidence.
2. Content gate: all eight HLD template sections, module ownership, state ownership, four UI states, full API table, ADRs, risks, dependencies, and degradation.
3. Traceability gate: every P0 `F*` maps to a module; every API has an `API-*` ID; cited rules/assets exist.
4. Update gate: preserve confirmed text; reject silent overwrite of `已定版`/`已交付`; record reason, affected sections, version, and date in update mode.
5. Output gate: exact filename, upstream path, change history, no blocking `⚠️待确认`, then validator command.

Use checkbox syntax for every gate so an executing agent can track it.

- [ ] **Step 4: Write the minimal HLD Skill that addresses every baseline failure**

Use frontmatter:

```yaml
---
name: hld-generator
description: 根据已通过门控的 PRD-SPEC 生成或更新前端 HLD，明确模块边界、完整接口契约、状态与数据流、复用、ADR、风险和依赖。当用户要求概要设计、HLD、接口契约、模块设计，或自动设计链进入 HLD 阶段时使用；PRD 关键字段、权限或接口信息缺失时集中暂停确认。
---
```

The workflow must state, in order: resolve slug/mode/root; inspect existing status; read PRD, canonical template, checklist, project rules and real assets; classify unknowns as structural/upstream/business/environment; ask once for business blockers; render without changing upstream decisions; run the HLD validator; repair only structural failures at most twice; return output path, status, validator summary, assumptions, and remaining blockers.

- [ ] **Step 5: Create eight HLD eval cases**

Create valid JSON with `skill_name: "hld-generator"` and these named cases: `standard-hld`, `missing-api-fields`, `continue-existing-draft`, `protect-finalized-document`, `reuse-ai-kit-asset`, `prefer-business-component`, `missing-permission-model`, and `negative-trigger-code-review`. Each object must contain `id`, `name`, `prompt`, `expected_output`, and `files`.

Expected outputs must assert behavior, not wording. For example, `missing-api-fields` requires one consolidated question and forbids invented fields; `negative-trigger-code-review` requires declining HLD generation and routing to code review.

- [ ] **Step 6: Run static tests and validator syntax checks**

Run:

```bash
node --test tests/skill-contracts.test.js
node --check scripts/validate-design-chain.js
```

Expected: both commands pass.

- [ ] **Step 7: Rerun the HLD baseline prompt with the Skill loaded and record evidence**

Use the exact Task 1 HLD prompt. Save `skills/hld-generator/evals/post-skill-results.md` with `Scenario`, `Input`, `Observed behavior`, `Baseline comparison`, and `Result`. A passing rerun must show status inspection, no silent overwrite, no invented contract, canonical template use, and a consolidated blocker response.

- [ ] **Step 8: Commit the HLD Skill**

```bash
git add skills/hld-generator tests/skill-contracts.test.js
git commit -m "feat: add hld generator skill"
```

---

### Task 4: Create and Evaluate the Frontend LLD Specialist Skill

**Files:**
- Create: `skills/frontend-lld-generator/SKILL.md`
- Create: `skills/frontend-lld-generator/spec/checklist.md`
- Create: `skills/frontend-lld-generator/evals/evals.json`
- Create: `skills/frontend-lld-generator/evals/post-skill-results.md`
- Modify: `tests/skill-contracts.test.js`

**Interfaces:**
- Consumes: gated PRD/HLD, target project root and `package.json`, real project assets, `design/_templates/LLD-前端模板.md`, matching Cursor Rules, ai-kit references, and LLD baseline failures.
- Produces: `design/<slug>/LLD-前端-<slug>.md` with exact file layout, `CMP-*`/`TYPE-*`/`API-*`/`HOOK-*`/`TEST-*` identifiers, typed component and Hook APIs, service boundaries, all UI states, cleanup/concurrency behavior, and tests.
- Gate command: `node scripts/validate-design-chain.js --slug <slug> --stage lld`.

- [ ] **Step 1: Extend the failing static contract test**

Append:

```js
test("frontend-lld-generator declares typed implementation and asset gates", () => {
  const skill = read("skills/frontend-lld-generator/SKILL.md");
  assert.match(skill, /^---\nname: frontend-lld-generator\n/m);
  assert.match(skill, /design\/_templates\/LLD-前端模板\.md/);
  assert.match(skill, /package\.json/);
  assert.match(skill, /Props/);
  assert.match(skill, /Emits/);
  assert.match(skill, /any/);
  assert.match(skill, /validate-design-chain\.js --slug <slug> --stage lld/);
  assert.ok(evals("frontend-lld-generator").evals.length >= 8);
});
```

Run: `node --test tests/skill-contracts.test.js`

Expected: the new test fails because the LLD Skill does not exist.

- [ ] **Step 2: Write the LLD checklist**

Create checkbox gates for: HLD validator passed; target root/stack/dependencies/commands known; business asset search completed before ai-kit reference; all nine canonical sections present; exact files and responsibilities; typed Props/Emits/Expose; complete TypeScript models without `any`; API adapter contracts tied to HLD `API-*`; Hook inputs/returns/lifecycle/concurrency/cancellation; local/Hook/global state ownership; loading/error/empty/retry/permission/cleanup; `TEST-*` coverage; exact filename and validator pass.

- [ ] **Step 3: Write the LLD Skill**

Use frontmatter:

```yaml
---
name: frontend-lld-generator
description: 根据已通过门控的 PRD-SPEC 和 HLD 生成或更新 Vue 3 + TypeScript 前端 LLD，明确文件、组件 API、类型、service、Hook、状态、异常、并发清理和测试设计。当用户要求前端详细设计、LLD、组件或 Hook 设计，或自动设计链进入 LLD 阶段时使用；目标项目或 HLD 契约不足时集中暂停确认。
---
```

Require the asset priority `业务项目已有资产 → src/ai-kit 参考实现 → 新增业务能力`. Explicitly forbid copying ai-kit blindly, using `any` to hide uncertainty, inventing package commands, or changing HLD decisions downstream.

- [ ] **Step 4: Create eight LLD eval cases**

Use these names: `standard-vue-lld`, `incomplete-hld-contract`, `continue-existing-lld`, `protect-finalized-lld`, `reuse-ai-kit-hook`, `prefer-business-component`, `unknown-target-project`, and `negative-trigger-backend-lld`. Ensure the negative case states that backend/mobile LLD is outside this Skill.

- [ ] **Step 5: Run contract tests and rerun the baseline pressure prompt**

Run: `node --test tests/skill-contracts.test.js`

Then use the exact Task 1 LLD prompt with the Skill loaded. Save post-Skill evidence showing that it blocks on the missing target project, rejects `any`, does not invent commands or directories, and explains the asset-search order.

- [ ] **Step 6: Commit the LLD Skill**

```bash
git add skills/frontend-lld-generator tests/skill-contracts.test.js
git commit -m "feat: add frontend lld generator skill"
```

---

### Task 5: Create and Evaluate the Development Task Planner Skill

**Files:**
- Create: `skills/dev-task-planner/SKILL.md`
- Create: `skills/dev-task-planner/spec/checklist.md`
- Create: `skills/dev-task-planner/evals/evals.json`
- Create: `skills/dev-task-planner/evals/post-skill-results.md`
- Modify: `tests/skill-contracts.test.js`

**Interfaces:**
- Consumes: gated HLD/LLD, target `package.json`, `design/_templates/TASKS模板.md`, and planner baseline failures.
- Produces: `design/<slug>/<slug>-TASKS-总览.md` and `design/<slug>/<slug>-TASKS-执行序列.md`, with unique task IDs, files, dependencies, interfaces, DoD, traceable design references, real commands, parallel flags, and an acyclic execution order.
- Gate command: `node scripts/validate-design-chain.js --slug <slug> --stage tasks`.

- [ ] **Step 1: Extend the failing static contract test**

Append:

```js
test("dev-task-planner declares traceability, command, and DAG gates", () => {
  const skill = read("skills/dev-task-planner/SKILL.md");
  assert.match(skill, /^---\nname: dev-task-planner\n/m);
  assert.match(skill, /design\/_templates\/TASKS模板\.md/);
  assert.match(skill, /design_ref/);
  assert.match(skill, /package\.json/);
  assert.match(skill, /DAG/);
  assert.match(skill, /不能新增设计决策|不得新增设计决策/);
  assert.match(skill, /validate-design-chain\.js --slug <slug> --stage tasks/);
  assert.ok(evals("dev-task-planner").evals.length >= 8);
});
```

Run: `node --test tests/skill-contracts.test.js`

Expected: the planner contract test fails because its Skill is absent.

- [ ] **Step 2: Write the TASKS checklist**

Require: HLD/LLD gates passed; actual package scripts read; every task has ID/module/type/files/dependencies/inputs/outputs/DoD/design_ref/command/parallel flag; type and API providers precede consumers; IDs are unique; dependencies exist; DAG is acyclic; every `CMP-*`, `TYPE-*`, `API-*`, `HOOK-*`, `TEST-*`, and `AC-*` is covered; no PRD scope expansion; documentation belongs to the code task it supports; both exact output filenames exist; validator passes.

- [ ] **Step 3: Write the task planner Skill**

Use frontmatter:

```yaml
---
name: dev-task-planner
description: 将已通过门控的 HLD 和前端 LLD 拆成可独立验证的开发任务、依赖 DAG、DoD、design_ref 和执行序列。当用户要求拆任务、生成 TASKS、排开发顺序，或自动设计链进入 TASKS 阶段时使用；只拆解已确认设计，不新增功能或技术决策。
---
```

Define the ordering rule `types/contracts → API adapters → Hooks/state → components/pages → tests/integration`. Require commands to be derived from the target `package.json`; if the needed verification capability has no script, report it as a blocker rather than inventing one.

- [ ] **Step 4: Create eight planner eval cases**

Use these names: `standard-task-plan`, `missing-lld-detail`, `continue-existing-tasks`, `protect-delivered-tasks`, `parallel-independent-components`, `business-package-commands`, `cyclic-dependency-input`, and `negative-trigger-new-feature-design`.

- [ ] **Step 5: Run contract tests and rerun the planner baseline pressure prompt**

Run: `node --test tests/skill-contracts.test.js`

Use the exact Task 1 TASKS prompt with the Skill loaded. Save post-Skill evidence showing rejection of the Excel scope expansion, real package-command inspection, complete task fields, traceability, and DAG validation.

- [ ] **Step 6: Commit the task planner Skill**

```bash
git add skills/dev-task-planner tests/skill-contracts.test.js
git commit -m "feat: add development task planner skill"
```

---

### Task 6: Create and Evaluate the Design-Chain Orchestrator

**Files:**
- Create: `skills/spec-delivery-orchestrator/SKILL.md`
- Create: `skills/spec-delivery-orchestrator/evals/evals.json`
- Create: `skills/spec-delivery-orchestrator/evals/post-skill-results.md`
- Modify: `tests/skill-contracts.test.js`

**Interfaces:**
- Consumes: `{ requirement?: string, slug: string, target: "frontend", mode: "new" | "continue" | "update", projectRoot?: string }`, existing design files/status, four specialist Skills, and validator diagnostics.
- Produces: the next valid stage or full five-file chain, a consolidated blocker question when required, a validator summary, and an updated matching row in `design/README.md`.
- Delegates in order: `prd-spec-enhancer → hld-generator → frontend-lld-generator → dev-task-planner`.
- Never produces specialist document content itself.

- [ ] **Step 1: Extend the failing orchestrator contract test**

Append:

```js
test("spec-delivery-orchestrator delegates, resumes, and bounds repair", () => {
  const skill = read("skills/spec-delivery-orchestrator/SKILL.md");
  assert.match(skill, /^---\nname: spec-delivery-orchestrator\n/m);
  for (const name of ["prd-spec-enhancer", "hld-generator", "frontend-lld-generator", "dev-task-planner"]) {
    assert.match(skill, new RegExp(name));
  }
  assert.match(skill, /new.*continue.*update/s);
  assert.match(skill, /frontend/);
  assert.match(skill, /最多两轮/);
  assert.match(skill, /不得.*直接生成|不直接生成/);
  assert.match(skill, /design\/README\.md/);
  assert.ok(evals("spec-delivery-orchestrator").evals.length >= 9);
});
```

Run: `node --test tests/skill-contracts.test.js`

Expected: the orchestrator test fails because its Skill is absent.

- [ ] **Step 2: Write the orchestrator Skill with an explicit state table**

Use frontmatter:

```yaml
---
name: spec-delivery-orchestrator
description: 自动编排需求到 PRD-SPEC、HLD、前端 LLD 和 TASKS 的完整设计链，支持新建、从已有阶段继续、受控更新和全链一致性复核。当用户要求自动完成设计链、从 Spec 生成 HLD/LLD/TASKS、继续设计流水线或检查整条设计链时使用。
---
```

Include this stage decision table verbatim:

| Existing valid documents | Action |
|---|---|
| none | invoke `prd-spec-enhancer` |
| PRD only | validate PRD, then invoke `hld-generator` |
| PRD + HLD | validate HLD, then invoke `frontend-lld-generator` |
| PRD + HLD + LLD | validate LLD, then invoke `dev-task-planner` |
| all five | run `--stage all`, then update the index |

Define status policy for `草稿`, `评审中`, `已定版`, and `已交付`; exact mode semantics; diagnostic routing by structural/upstream/business/environment categories; two-repair limit; consolidated questions; and stop output containing stage, diagnostics, attempted repairs, unchanged files, and a resume command.

- [ ] **Step 3: Define index update behavior without fragile table rewriting**

Require the orchestrator to locate the row whose first column equals the slug. It may append a row only when no row exists. It must preserve unrelated rows and columns, set the current stage/status/path fields from actual files, and display the intended diff before modifying a finalized/delivered row in `update` mode.

- [ ] **Step 4: Create nine orchestrator eval cases**

Use these names: `new-end-to-end`, `continue-from-prd`, `continue-from-hld`, `continue-from-lld`, `review-complete-chain`, `update-finalized-chain`, `structural-repair-two-round-limit`, `consolidate-business-blockers`, and `negative-trigger-code-generation`.

The end-to-end expected output must require five exact files, four stage gates, a final `--stage all`, and one index update. The negative case must stop before implementation/code generation.

- [ ] **Step 5: Run contract tests and rerun the orchestrator baseline pressure prompt**

Run: `node --test tests/skill-contracts.test.js`

Use the exact Task 1 orchestrator prompt with the Skill loaded. Save post-Skill evidence showing correct stage detection, delegation to specialist Skills, no fabricated decisions, gate execution, bounded retries, and evidence-based completion language.

- [ ] **Step 6: Validate all eval JSON and evidence files**

Run:

```bash
node -e 'for (const name of ["hld-generator","frontend-lld-generator","dev-task-planner","spec-delivery-orchestrator"]) { const data=require(`./skills/${name}/evals/evals.json`); if (data.skill_name!==name || data.evals.length<8) process.exit(1); }'
for file in skills/{hld-generator,frontend-lld-generator,dev-task-planner,spec-delivery-orchestrator}/evals/{baseline-results,post-skill-results}.md; do test -s "$file"; done
```

Expected: exit status `0` with no output.

- [ ] **Step 7: Commit the orchestrator**

```bash
git add skills/spec-delivery-orchestrator tests/skill-contracts.test.js
git commit -m "feat: orchestrate design document delivery"
```

---

### Task 7: Integrate Documentation and Complete Repository Verification

**Files:**
- Modify: `skills/README.md`
- Modify: `docs/ai-delivery-workflow.md`
- Modify: `design/README.md`
- Modify: `项目总结.md`
- Modify: `面试大纲.md`

**Interfaces:**
- Consumes: implemented Skill contracts, validator CLI, verified tests, and current repository metrics.
- Produces: one accurate user guide and project narrative whose counts, commands, boundaries, and examples match the implementation.

- [ ] **Step 1: Update the Skill catalog**

Change `skills/README.md` from six to ten Skills. Add one subsection per new Skill with: purpose, trigger examples, exact output, blocking behavior, independent invocation, and orchestrated role. Keep `aicoding-codegen` described as the only Skill currently installed into business projects.

- [ ] **Step 2: Update the delivery workflow**

In `docs/ai-delivery-workflow.md`, replace the HLD/LLD/TASKS labels `模板驱动` with the new Skill names and add these usage examples:

```text
使用 $spec-delivery-orchestrator：
需求：做一个设备管理页面，支持搜索、分页、新增、编辑、删除
slug：device-management
目标端：frontend
模式：new
```

```bash
node scripts/validate-design-chain.js --slug device-management
node scripts/validate-design-chain.js --slug device-management --stage hld --json
```

Explain that Skills generate/reason, while the validator only checks explicit mechanical contracts.

- [ ] **Step 3: Update design state documentation**

In `design/README.md`, document required metadata (`状态`, `版本`, `slug`, `上游路径`, `变更记录`), the four status meanings, and the five-file output convention. Do not add a fake design row or claim that `cascade-filter` has TASKS files when it does not.

- [ ] **Step 4: Refresh the project summary from verified facts**

Update `项目总结.md` to state: ten repository Skills; four-Skill design automation plus the reused PRD specialist; Node validator and cross-document stable-ID traceability; repository-local release boundary; and no automatic code/test/deploy orchestration in this phase. Recalculate counts with commands rather than copying old totals.

- [ ] **Step 5: Refresh the interview outline**

Update `面试大纲.md` with concise answers for:

- Why documents are pipeline state instead of a new workflow service.
- Why the coordinator cannot write specialist content.
- How stable IDs make PRD → HLD → LLD → TASKS traceability deterministic.
- How business blockers differ from mechanically repairable failures.
- Why retries stop after two rounds.
- What is and is not installed into another project today.

Add a demo sequence that starts a design chain, resumes it, runs JSON validation, intentionally breaks one `design_ref`, and shows exit code `1`.

- [ ] **Step 6: Run documentation consistency scans**

Run:

```bash
rg -n "当前已收录（6 个 Skill）|HLD（设计角色）📋 模板驱动|LLD（设计角色）📋 模板驱动|任务规划（项目经理角色）📋 模板驱动" skills/README.md docs/ai-delivery-workflow.md 项目总结.md 面试大纲.md
rg -n "10 个 Skill|spec-delivery-orchestrator|validate-design-chain" skills/README.md docs/ai-delivery-workflow.md 项目总结.md 面试大纲.md
```

Expected: the first command has no matches; the second finds the new implementation in all relevant documents.

- [ ] **Step 7: Run fresh full verification**

Run:

```bash
npm run check
node scripts/validate-design-chain.js --slug cascade-filter --stage prd
npm pack --dry-run --json
git diff --check
```

Expected:

- `npm run check` exits `0` and includes validator plus Skill contract tests.
- The cascade-filter PRD gate reports based on its actual current contents; if it fails, the diagnostics must describe real blockers and the repository check must still remain green.
- The npm dry run does not include any of the four new repository-local Skills.
- `git diff --check` exits `0`.

- [ ] **Step 8: Perform the implementation self-review against the design spec**

For each of the eleven completion criteria in the design spec, record the supporting file and command output in the implementation handoff. Confirm explicitly that no code-generation, test-execution orchestration, deployment orchestration, backend/mobile LLD Skill, state database, or `--with-spec` installer change was introduced.

- [ ] **Step 9: Commit documentation and final integration**

```bash
git add skills/README.md docs/ai-delivery-workflow.md design/README.md 项目总结.md 面试大纲.md
git commit -m "docs: document automated design workflow"
```

---

## Final Acceptance Commands

Run from the repository root:

```bash
node --test tests/validate-design-chain.test.js tests/skill-contracts.test.js
npm run check:design-chain
npm run check
node -e 'for (const name of ["hld-generator","frontend-lld-generator","dev-task-planner","spec-delivery-orchestrator"]) { const data=require(`./skills/${name}/evals/evals.json`); console.log(name, data.evals.length); }'
npm pack --dry-run --json
git diff --check
git status --short
```

Acceptance evidence must show:

- All Node and Vitest tests pass.
- Each specialist Skill works independently and has at least eight eval cases.
- The orchestrator has at least nine eval cases and delegates all four stages.
- All four baseline and all four post-Skill evidence files are non-empty.
- The validator catches missing sections, blockers, broken paths, duplicate/missing/cyclic dependencies, broken design references, uncovered stable IDs, and nonexistent package scripts.
- The complete fixture passes in both human and JSON mode with exit code `0`; a broken fixture exits `1`.
- The npm package boundary remains unchanged for repository-local design Skills.
- Documentation reports the verified implementation without claiming production adoption or measured efficiency gains.
