# Hybrid Codebase Search Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend `scripts/search-prompts.js` into a backward-compatible hybrid search entry point that retrieves Prompt matches plus explainable AICoding and business-project code contexts without Embeddings or new runtime dependencies.

**Architecture:** Keep Prompt search and its public API in `search-prompts.js`, then delegate safe file discovery to `codebase-scanner.js`, structure-aware chunking to `codebase-chunker.js`, and deterministic scoring/deduplication to `hybrid-ranker.js`. The CLI adds an optional project root and context limit, while installed Codex/Cursor instructions consume the new `contexts` array.

**Tech Stack:** Node.js 18 CommonJS, built-in `node:fs`/`node:path`, Node test runner, existing AICoding CLI and npm validation pipeline. No new runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-08-20-hybrid-codebase-search-design.md`

## Global Constraints

- Preserve the existing `searchPrompts(query, options)` API and every field currently returned in `matches`.
- Treat `prompts/asset-contracts.json` as the authoritative Prompt-to-Rules/ai-kit mapping; keep directory inference only as a warned compatibility fallback.
- Do not add Embeddings, vector storage, AST parsers, file watchers, persistent caches, or external network calls.
- Scan only the explicit AICoding roots and optional `project` root; never scan outside them.
- Default limits are 5,000 files, 512 KiB per file, five Prompt matches, and ten Context matches.
- Fixed exclusions and sensitive files cannot be re-included by `.gitignore` negation rules.
- All returned paths use `/`; business paths are relative to `project`, AICoding paths are relative to `root`.
- Use test-first development for every production behavior and observe the expected failure before implementation.
- Preserve unrelated changes already present in the dirty worktree.

---

## File Map

| File | Responsibility |
| --- | --- |
| `prompts/asset-contracts.json` | Versioned, authoritative Prompt-to-Rules/ai-kit mappings |
| `scripts/prompt-contracts.js` | Load, validate, and audit asset contracts |
| `scripts/codebase-scanner.js` | Validate roots, discover safe text files, apply fixed and `.gitignore` exclusions, enforce limits, report warnings |
| `scripts/codebase-chunker.js` | Convert supported files into normalized Markdown/MDC, Vue, TS, and JS chunks |
| `scripts/hybrid-ranker.js` | Score chunks with explainable lexical/reference signals, deduplicate, and limit results |
| `scripts/search-prompts.js` | Preserve Prompt search, orchestrate Context search, parse CLI flags, render text/JSON output |
| `scripts/install-integration.js` | Generate installed instructions that pass `--project .` and consume `contexts` |
| `tests/codebase-scanner.test.js` | Scanner safety, ignore, limit, and error tests |
| `tests/prompt-contracts.test.js` | Contract schema, path, coverage, drift, and fallback tests |
| `tests/codebase-chunker.test.js` | Chunk shape, symbol, line range, and fallback tests |
| `tests/hybrid-ranker.test.js` | Score ordering, reasons, reference boost, deduplication tests |
| `tests/search-prompts.test.js` | Public API and AICoding/business Context integration tests |
| `tests/search-prompts-cli.test.js` | CLI flag, JSON/text output, and invalid-project tests |
| `tests/install-integration.test.js` | Installed workflow contract tests |
| `package.json` | Publish new scripts and include them in syntax checks |
| `README.md` | Document hybrid search and example command |
| `docs/实际项目接入指南.md` | Document project scanning, safety boundaries, and offline behavior |
| `skills/aicoding-codegen/SKILL.md` | Instruct Codex to retrieve business contexts before generating code |

---

### Task 1: Prompt Asset Contract

**Files:**
- Create: `prompts/asset-contracts.json`
- Create: `scripts/prompt-contracts.js`
- Create: `tests/prompt-contracts.test.js`
- Modify: `scripts/search-prompts.js`
- Modify: `tests/search-prompts.test.js`

**Interfaces:**
- Produces: `loadPromptContracts(root) -> Map<string, { rules, references, noReferenceReason? }>`
- Produces: `validatePromptContracts(root) -> { errors, warnings, coverage }`
- Coverage shape: `{ promptCount, contractedPromptCount, mappedRules, unmappedRules, mappedReferences, unmappedReferences }`
- Search fallback warning: `{ code: "CONTRACT_FALLBACK", path, message }`

- [ ] **Step 1: Write failing tests for the repository contract**

Create `tests/prompt-contracts.test.js`. Assert `validatePromptContracts(root).errors` is empty, `promptCount === 22`, `contractedPromptCount === 22`, every loaded entry has a non-empty `rules` array, and an empty `references` array always has a non-empty `noReferenceReason`.

```js
const report = validatePromptContracts(root);
assert.deepEqual(report.errors, []);
assert.equal(report.coverage.promptCount, 22);
assert.equal(report.coverage.contractedPromptCount, 22);
for (const contract of loadPromptContracts(root).values()) {
  assert.ok(contract.rules.length > 0);
  if (contract.references.length === 0) assert.ok(contract.noReferenceReason?.trim());
}
```

- [ ] **Step 2: Run the contract test and verify RED**

Run: `node --test tests/prompt-contracts.test.js`

Expected: FAIL with `Cannot find module '../scripts/prompt-contracts.js'`.

- [ ] **Step 3: Create the complete version-1 contract**

Create `prompts/asset-contracts.json` with one entry for each of the 22 non-README Prompt files. Use these exact mapping decisions; prepend `.cursor/rules/` to Rule values and `src/ai-kit/` to reference values:

| Prompt | Rules | References |
| --- | --- | --- |
| `charts/bar-chart.md` | `charts/chart.mdc`, `charts/bar-chart.mdc` | `charts/BaseChart.vue`, `hooks/useChart.ts`, `hooks/useRequest.ts` |
| `charts/bigscreen-chart.md` | `charts/chart.mdc`, `charts/bigscreen-chart.mdc` | `charts/BaseChart.vue`, `hooks/useChart.ts`, `hooks/useRequest.ts` |
| `charts/chart.md` | `charts/chart.mdc` | `charts/BaseChart.vue`, `hooks/useChart.ts`, `hooks/useRequest.ts` |
| `charts/gauge-chart.md` | `charts/chart.mdc` | `charts/BaseChart.vue`, `hooks/useChart.ts`, `hooks/useRequest.ts` |
| `charts/line-chart.md` | `charts/chart.mdc`, `charts/line-chart.mdc` | `charts/BaseChart.vue`, `hooks/useChart.ts`, `hooks/useRequest.ts` |
| `charts/pie-chart.md` | `charts/chart.mdc`, `charts/pie-chart.mdc` | `charts/BaseChart.vue`, `hooks/useChart.ts`, `hooks/useRequest.ts` |
| `charts/radar-chart.md` | `charts/chart.mdc` | `charts/BaseChart.vue`, `hooks/useChart.ts`, `hooks/useRequest.ts` |
| `charts/scatter-chart.md` | `charts/chart.mdc` | `charts/BaseChart.vue`, `hooks/useChart.ts`, `hooks/useRequest.ts` |
| `components/dialog.md` | `components/component.mdc`, `components/dialog.mdc` | `components/BaseDialog.vue`, `forms/BaseForm.vue`, `hooks/useDialog.ts` |
| `components/drawer.md` | `components/component.mdc`, `components/drawer.mdc` | `components/BaseDrawer.vue`, `forms/BaseForm.vue`, `hooks/useDialog.ts`, `tree/BaseTree.vue`, `hooks/useTree.ts` |
| `forms/dynamic-form.md` | `forms/form.mdc`, `forms/dynamic-form.mdc` | `forms/BaseForm.vue`, `hooks/useRequest.ts` |
| `forms/form.md` | `forms/form.mdc` | `forms/BaseForm.vue`, `components/BaseDialog.vue`, `hooks/useDialog.ts`, `search/BaseSearch.vue`, `hooks/useSearch.ts`, `hooks/useTable.ts`, `components/BaseDrawer.vue` |
| `git/commit.md` | `global/git.mdc` | empty; reason `Git 提交工作流没有对应的 ai-kit 运行时资产` |
| `hooks/use-request.md` | `hooks/use-request.mdc` | `hooks/useRequest.ts` |
| `pages/list-page.md` | `global/architecture.mdc`, `pages/list-page.mdc` | `components/list-page-template.vue`, `hooks/useTable.ts`, `hooks/useSearch.ts`, `hooks/useDialog.ts`, `search/BaseSearch.vue` |
| `performance/large-data.md` | `performance/render.mdc`, `performance/large-data.mdc` | empty; reason `大数据性能 Prompt 是诊断指导，不绑定单一 ai-kit 实现` |
| `refactor/component.md` | `refactor/component-refactor.mdc` | empty; reason `组件重构 Prompt 面向业务代码，没有单一 ai-kit 依赖` |
| `review/review.md` | `review/code-review.mdc` | empty; reason `代码审查 Prompt 是规则工作流，没有运行时 ai-kit 依赖` |
| `search/base-search.md` | `search/base-search.mdc` | `search/BaseSearch.vue`, `hooks/useSearch.ts` |
| `table/crud-table.md` | `hooks/use-table.mdc`, `table/crud-table.mdc` | `hooks/useTable.ts` |
| `tree/lazy-tree.md` | `tree/tree.mdc`, `tree/lazy-tree.mdc` | `tree/BaseTree.vue`, `hooks/useTree.ts` |
| `tree/tree.md` | `tree/tree.mdc` | `tree/BaseTree.vue`, `hooks/useTree.ts`, `components/list-page-template.vue`, `hooks/useTable.ts` |

Every JSON key begins with `prompts/`. Add no global `base.mdc` or `typescript.mdc` entries because search injects them uniformly.

- [ ] **Step 4: Implement contract loading and validation**

In `scripts/prompt-contracts.js`, walk non-README Markdown files under `prompts/`, Rules under `.cursor/rules/`, and `.vue`/`.ts` files under `src/ai-kit/`. Parse JSON with an error that names `prompts/asset-contracts.json`. Validate version `1`, exact Prompt coverage, non-empty unique Rules, unique References, required/forbidden `noReferenceReason`, path prefixes, root containment, existence, and Prompt-body ai-kit references missing from the contract. Return stable error objects `{ code, path, message }` using these codes:

```js
const ERROR_CODES = [
  "INVALID_CONTRACT",
  "MISSING_PROMPT_CONTRACT",
  "ORPHAN_PROMPT_CONTRACT",
  "INVALID_RULES",
  "INVALID_REFERENCES",
  "MISSING_ASSET",
  "PATH_ESCAPE",
  "REFERENCE_DRIFT",
];
```

Report unmapped Rules and ai-kit as warning/coverage arrays, not errors. When executed directly with `--check`, print each error and exit `1`; otherwise print contract and coverage counts and exit `0`.

- [ ] **Step 5: Run repository contract tests and verify GREEN**

Run: `node --test tests/prompt-contracts.test.js`

Expected: PASS.

- [ ] **Step 6: Write failing fixture tests for each validation error**

Build minimal temporary roots by copying a one-Prompt/one-Rule/one-ai-kit fixture. Mutate the contract separately to assert stable errors for a missing Prompt entry, orphan entry, duplicate Rule, missing asset, `../` path escape, empty References without a reason, reason with non-empty References, and a Prompt-body reference absent from the contract. Assert unmapped assets appear in `coverage` while `errors` remains empty.

- [ ] **Step 7: Run fixture tests and verify RED, then complete validation branches**

Run: `node --test tests/prompt-contracts.test.js`

Expected before completing branches: FAIL on the first unimplemented error case. Add only the missing validation branches, rerun, and expect PASS.

- [ ] **Step 8: Write a failing search integration test for contract authority and fallback**

In `tests/search-prompts.test.js`, assert line-chart search returns the contract's three ai-kit References and chart Rules. In a temporary legacy root with a Prompt but no `asset-contracts.json`, assert existing directory inference still returns Rules and `warnings` contains `CONTRACT_FALLBACK`.

- [ ] **Step 9: Make the contract authoritative in search and preserve fallback**

Load the contract once per `searchPrompts()` call. For each Prompt, set `references` and domain/scenario `rules` from its entry, then inject `.cursor/rules/global/base.mdc` and `.cursor/rules/global/typescript.mdc`. If the file or entry is missing, run the existing `findRules()` and body-reference extraction and append one deduplicated `CONTRACT_FALLBACK` warning for that Prompt.

- [ ] **Step 10: Run contract and search tests**

Run: `node --test tests/prompt-contracts.test.js tests/search-prompts.test.js`

Expected: PASS.

- [ ] **Step 11: Commit the asset contract**

```bash
git add prompts/asset-contracts.json scripts/prompt-contracts.js tests/prompt-contracts.test.js scripts/search-prompts.js tests/search-prompts.test.js
git commit -m "feat: add prompt asset contracts"
```

---

### Task 2: Safe Codebase Scanner

**Files:**
- Create: `scripts/codebase-scanner.js`
- Create: `tests/codebase-scanner.test.js`

**Interfaces:**
- Produces: `scanCodebase(root, options) -> { files, warnings }`
- Produces file records: `{ absolutePath, path, extension, source, type, content }`
- Produces warnings: `{ code, path, message }`
- `options`: `{ source, roots, maxFiles, maxFileBytes }`; `roots` is an allowlist of relative directories or `null` for the whole explicit root.

- [ ] **Step 1: Write failing tests for allowed files and fixed exclusions**

Create a temporary project containing `src/UserTable.vue`, `src/user-api.ts`, `docs/guide.md`, `.env`, `node_modules/pkg/index.js`, `dist/app.js`, `image.png`, and `archive.zip`. Assert that `scanCodebase(project, { source: "business", roots: null })` returns only the three supported safe text files, with POSIX relative paths and `source === "business"`.

```js
const result = scanCodebase(project, { source: "business", roots: null });
assert.deepEqual(result.files.map((file) => file.path), [
  "docs/guide.md",
  "src/UserTable.vue",
  "src/user-api.ts",
]);
assert.ok(result.files.every((file) => file.source === "business"));
```

- [ ] **Step 2: Run the scanner test and verify RED**

Run: `node --test tests/codebase-scanner.test.js`

Expected: FAIL with `Cannot find module '../scripts/codebase-scanner.js'`.

- [ ] **Step 3: Implement minimal discovery and fixed safety exclusions**

Implement these constants and helpers in `scripts/codebase-scanner.js`:

```js
const ALLOWED_EXTENSIONS = new Set([".md", ".mdc", ".vue", ".ts", ".tsx", ".js", ".jsx"]);
const FIXED_DIRECTORIES = new Set([".git", "node_modules", "dist", "build", "coverage", ".cache", ".vite", ".next", ".nuxt"]);
const SENSITIVE_BASENAMES = [/^\.env(?:\..+)?$/i, /\.(?:pem|key|p12|pfx|crt|cer)$/i];

function normalizePath(value) {
  return value.split(path.sep).join("/");
}
```

Validate the root with `fs.statSync()`, recursively traverse entries sorted by name, reject fixed directories before descending, accept only allowlisted extensions, reject sensitive basenames, read UTF-8 content, and return files sorted by relative path. Map AICoding paths to `rule`, `ai-kit`, `skill`, or `document`; map all business files to `business-code` except Markdown/MDC, which use `document`.

- [ ] **Step 4: Run the scanner test and verify GREEN**

Run: `node --test tests/codebase-scanner.test.js`

Expected: PASS.

- [ ] **Step 5: Write failing tests for `.gitignore`, allowlisted roots, and safety limits**

Add tests that create:

```text
.gitignore                 generated/
generated/skip.ts
generated/keep.ts          re-included by !generated/keep.ts
src/small.ts
src/large.ts               larger than maxFileBytes
outside/not-scanned.ts     excluded by roots: ["src"]
```

Use a `.gitignore` containing `generated/` and `!generated/keep.ts`. Assert `keep.ts` is included, `skip.ts` is excluded, `roots: ["src"]` never includes `outside/`, `FILE_TOO_LARGE` identifies `src/large.ts`, and `maxFiles: 1` yields `MAX_FILES_REACHED`. Also assert a missing root and a regular-file root throw messages containing the resolved path.

- [ ] **Step 6: Run the new tests and verify RED**

Run: `node --test tests/codebase-scanner.test.js`

Expected: FAIL because ignore rules and limit warnings are not implemented.

- [ ] **Step 7: Implement common `.gitignore` rules, allowlisted roots, and warnings**

Parse non-empty, non-comment `.gitignore` lines into ordered rules with `{ negate, directoryOnly, anchored, pattern }`. Convert `*`, `?`, and `**` into segment-aware regular expressions; apply rules in order so the last match wins. Permit traversal into an ignored directory when a later negation targets a descendant, but always reject `FIXED_DIRECTORIES` and sensitive files first.

Apply `roots` by resolving every entry under the explicit root and rejecting any resolved path that escapes it. Before reading, compare `stat.size` to `maxFileBytes`; stop accepting new files at `maxFiles`. Catch per-file read errors as `FILE_UNREADABLE`. Use these exact defaults and warning codes:

```js
const DEFAULT_MAX_FILES = 5000;
const DEFAULT_MAX_FILE_BYTES = 512 * 1024;
// FILE_TOO_LARGE, FILE_UNREADABLE, MAX_FILES_REACHED
```

- [ ] **Step 8: Run scanner tests and all existing Node tests**

Run: `node --test tests/codebase-scanner.test.js tests/search-prompts.test.js`

Expected: PASS.

- [ ] **Step 9: Commit the scanner**

```bash
git add scripts/codebase-scanner.js tests/codebase-scanner.test.js
git commit -m "feat: add safe codebase scanner"
```

---

### Task 3: Structure-Aware Chunker

**Files:**
- Create: `scripts/codebase-chunker.js`
- Create: `tests/codebase-chunker.test.js`

**Interfaces:**
- Consumes scanner file records from Task 2.
- Produces: `chunkFile(file) -> Chunk[]`
- Produces: `chunkFiles(files) -> { chunks, warnings }`
- Chunk shape: `{ source, type, path, title, symbol, kind, content, startLine, endLine }`

- [ ] **Step 1: Write failing Markdown chunk tests**

Use a Markdown file containing frontmatter, an introduction, `# Users`, `## Search`, and `## Pagination`. Assert that chunks are non-empty, line numbers are 1-based, the nested title is `Users / Search`, and a heading-free Markdown file returns one `document` chunk.

```js
const chunks = chunkFile(markdownFile);
assert.ok(chunks.some((chunk) => chunk.title === "Users / Search"));
assert.ok(chunks.every((chunk) => chunk.startLine >= 1 && chunk.endLine >= chunk.startLine));
```

- [ ] **Step 2: Run the chunker test and verify RED**

Run: `node --test tests/codebase-chunker.test.js`

Expected: FAIL with `Cannot find module '../scripts/codebase-chunker.js'`.

- [ ] **Step 3: Implement normalized Chunk creation and Markdown/MDC splitting**

Create a line-offset helper and `makeChunk(file, fields)` that copies `source`, `type`, and `path`, trims content, and rejects blank content. Parse ATX headings with `/^(#{1,6})\s+(.+?)\s*#*\s*$/`; maintain a six-level heading stack and form titles with `" / "`. Emit pre-heading content as a file-summary chunk and use the filename without extension when no heading exists.

- [ ] **Step 4: Run Markdown tests and verify GREEN**

Run: `node --test tests/codebase-chunker.test.js`

Expected: PASS.

- [ ] **Step 5: Write failing Vue and TS/JS symbol tests**

Use a Vue SFC with `<template>`, `<script setup lang="ts">`, `interface Device`, `const loadDevices = async () => {}`, and `<style>`. Assert a template chunk exists, `Device` and `loadDevices` symbols exist, and CSS content is absent. Use a TS file with exported interface, type, class, function, and const plus a non-exported top-level function; assert all symbols are emitted in source order.

- [ ] **Step 6: Run symbol tests and verify RED**

Run: `node --test tests/codebase-chunker.test.js`

Expected: FAIL because Vue and script declarations are not split.

- [ ] **Step 7: Implement Vue block and top-level declaration splitting**

Identify Vue blocks with a global top-level tag expression and convert opening-tag character positions to line numbers. Skip style blocks. Emit template as `kind: "template"`; send script bodies to the script splitter with their starting-line offset.

Recognize declarations with this anchored expression:

```js
/^(?:export\s+(?:default\s+)?)?(?:declare\s+)?(?:async\s+)?(function|class|interface|type|enum|const|let|var)\s+([A-Za-z_$][\w$]*)/gm
```

Only accept matches whose brace/parenthesis/bracket depth at the match position is zero. A declaration ends at the next accepted top-level declaration or the script end. Emit imports preceding the first declaration as an `imports` chunk. If no declaration is recognized, return one `script` chunk. Wrap `chunkFile()` inside `chunkFiles()` so a file-specific exception produces `CHUNK_FAILED` without discarding other files.

- [ ] **Step 8: Run chunker and scanner tests**

Run: `node --test tests/codebase-chunker.test.js tests/codebase-scanner.test.js`

Expected: PASS.

- [ ] **Step 9: Commit the chunker**

```bash
git add scripts/codebase-chunker.js tests/codebase-chunker.test.js
git commit -m "feat: add structure-aware code chunks"
```

---

### Task 4: Explainable Hybrid Ranker

**Files:**
- Create: `scripts/hybrid-ranker.js`
- Create: `tests/hybrid-ranker.test.js`

**Interfaces:**
- Consumes normalized chunks, `terms`, Prompt matches, and rank options.
- Produces: `rankContexts(chunks, { terms, promptMatches, limit, maxPerFile }) -> Context[]`
- Context shape omits raw `content` and line fields from public output, but includes `{ type, source, path, title, symbol, score, preview, reasons }`.

- [ ] **Step 1: Write a failing test for score ordering and reasons**

Create three chunks where `useTable` appears respectively in `symbol`, `path`, and body. Rank with `terms: ["usetable"]`. Assert symbol > path > body and assert reasons contain these exact prefixes: `符号命中:`, `路径命中:`, and `正文命中:`.

- [ ] **Step 2: Run the ranker test and verify RED**

Run: `node --test tests/hybrid-ranker.test.js`

Expected: FAIL with `Cannot find module '../scripts/hybrid-ranker.js'`.

- [ ] **Step 3: Implement deterministic lexical scoring**

Normalize text with lowercase and collapsed whitespace. Use these weights per term, with body occurrences capped at five:

```js
const WEIGHTS = {
  symbol: 40,
  title: 30,
  path: 16,
  body: 4,
  promptReference: 24,
  businessSource: 3,
  ruleType: 2,
};
```

Add a reason only when its signal contributes points. Produce a 160-character whitespace-normalized preview. Filter out scores `<= 0`; sort by descending score, then `source`, `path`, and `title` using `localeCompare`.

- [ ] **Step 4: Run the ordering test and verify GREEN**

Run: `node --test tests/hybrid-ranker.test.js`

Expected: PASS.

- [ ] **Step 5: Write failing tests for Prompt references, deduplication, and limits**

Assert that a chunk whose path appears in a top Prompt's `references` receives `Prompt 显式引用` and outranks an otherwise equal chunk. Assert identical `{ source, path, symbol, kind }` values collapse to one result, each file contributes at most two results, `limit` truncates the final list, and an unrelated query returns `[]`.

- [ ] **Step 6: Run the new ranker tests and verify RED**

Run: `node --test tests/hybrid-ranker.test.js`

Expected: FAIL because reference boosts and per-file limits are absent.

- [ ] **Step 7: Implement reference boosts and stable deduplication**

Create a normalized Set from every Prompt match's `references` and `rules`. Apply `promptReference` when `chunk.path` is present. Deduplicate by `[source, path, symbol || title, kind].join("\0")`, then count accepted items by `[source, path].join("\0")`. Default `maxPerFile` to `2` and `limit` to `10`.

- [ ] **Step 8: Run all ranker tests**

Run: `node --test tests/hybrid-ranker.test.js`

Expected: PASS.

- [ ] **Step 9: Commit the ranker**

```bash
git add scripts/hybrid-ranker.js tests/hybrid-ranker.test.js
git commit -m "feat: add explainable hybrid ranking"
```

---

### Task 5: Integrate Context Search into the Public API

**Files:**
- Modify: `scripts/search-prompts.js`
- Modify: `tests/search-prompts.test.js`

**Interfaces:**
- Consumes the authoritative contract from Task 1 plus `scanCodebase`, `chunkFiles`, and `rankContexts` from Tasks 2–4.
- Extends `searchPrompts()` options with `project`, `contextLimit`, `maxFiles`, and `maxFileBytes`.
- Extends the return value with `project`, `contexts`, and `warnings` while preserving every existing field.

- [ ] **Step 1: Write a failing AICoding Context integration test**

Call `searchPrompts("生成折线图", { root, limit: 1, contextLimit: 10 })`. Assert the existing `matches[0]` contract still holds, `project === null`, and `contexts` contains `.cursor/rules/charts/line-chart.mdc` or `src/ai-kit/charts/BaseChart.vue` with `source === "aicoding"` and a non-empty `reasons` array.

- [ ] **Step 2: Run the integration test and verify RED**

Run: `node --test tests/search-prompts.test.js`

Expected: FAIL because `contexts` and `project` are missing.

- [ ] **Step 3: Add AICoding scanning, chunking, and ranking**

Import the three modules. Scan only these roots:

```js
const AICODING_CONTEXT_ROOTS = [".cursor/rules", "src/ai-kit", "skills", "design", "docs"];
```

Keep the current Prompt ranking code and output unchanged. After `matches` is finalized, scan/chunk/rank AICoding files using the same `terms`; pass `matches` as `promptMatches`. Return `project: null`, `contexts`, and concatenated scanner/chunker warnings.

- [ ] **Step 4: Run existing and new integration tests and verify GREEN**

Run: `node --test tests/search-prompts.test.js`

Expected: PASS, including all four pre-existing tests.

- [ ] **Step 5: Write a failing business-project Context test**

Create a temporary project with `src/api/device.ts` exporting `getDeviceList` and `src/views/device/DeviceList.vue` defining `loadDevices`. Search `"设备列表 getDeviceList"` with `project` set to the temporary root. Assert both AICoding and business sources can appear, `project` is the resolved root, the API symbol is returned as `business-code`, business paths are relative, and no raw `content` field leaks into public Context results.

- [ ] **Step 6: Run the business test and verify RED**

Run: `node --test tests/search-prompts.test.js`

Expected: FAIL because `project` is not yet scanned.

- [ ] **Step 7: Add optional business scanning and option validation**

When `options.project` is supplied, resolve and validate it through the scanner, scan the full explicit project with `source: "business"`, merge its chunks with AICoding chunks, then rank once. Validate `limit`, `contextLimit`, `maxFiles`, and `maxFileBytes` as finite positive integers with a shared helper. Pass the file limits separately to each explicit root so AICoding warnings cannot hide business results.

- [ ] **Step 8: Run public API tests**

Run: `node --test tests/search-prompts.test.js tests/codebase-scanner.test.js tests/codebase-chunker.test.js tests/hybrid-ranker.test.js`

Expected: PASS.

- [ ] **Step 9: Commit API integration**

```bash
git add scripts/search-prompts.js tests/search-prompts.test.js
git commit -m "feat: return hybrid codebase contexts"
```

---

### Task 6: CLI and Installed Workflow Integration

**Files:**
- Modify: `scripts/search-prompts.js`
- Create: `tests/search-prompts-cli.test.js`
- Modify: `scripts/install-integration.js`
- Modify: `tests/install-integration.test.js`
- Modify: `skills/aicoding-codegen/SKILL.md`

**Interfaces:**
- CLI flags: `--project <path>` and `--context-limit <positive integer>`.
- Installed Cursor Rule and Codex Skill invoke search with `--project .` and consume `contexts`.

- [ ] **Step 1: Write failing CLI JSON and invalid-path tests**

Use `spawnSync(process.execPath, [script, query, "--project", fixture, "--context-limit", "3", "--json"])`. Assert exit status `0`, valid JSON, `contexts.length <= 3`, and resolved `project`. Spawn again with a missing project and assert non-zero status plus a stderr message containing `业务项目目录` and the missing path.

- [ ] **Step 2: Run CLI tests and verify RED**

Run: `node --test tests/search-prompts-cli.test.js`

Expected: FAIL because the flags are treated as query text and CLI errors are uncaught.

- [ ] **Step 3: Implement CLI parsing, rendering, and top-level error handling**

Extend `parseArgs()` to consume flag values and reject missing values. Wrap `searchPrompts()` in `runCli()` with `try/catch`, print only `error.message`, and set `process.exitCode = 1`. JSON mode prints the full result. Text mode prints the existing Prompt section followed by:

```text
代码上下文：
1. [business-code] getDeviceList  [score]
   src/api/device.ts
   原因：符号命中: getdevicelist
```

Print `告警：N 项` and at most the first five warning summaries. Export `parseArgs` for direct unit testing if parsing assertions require it.

- [ ] **Step 4: Run CLI tests and verify GREEN**

Run: `node --test tests/search-prompts-cli.test.js`

Expected: PASS.

- [ ] **Step 5: Write failing installed-instruction tests**

Extend `tests/install-integration.test.js` to assert the generated Cursor Rule and copied Skill contain `--project .`, mention `contexts`, and instruct reading high-ranked business code, Rules, and ai-kit files. Assert the old command without a project is no longer emitted in installed instructions.

- [ ] **Step 6: Run installer tests and verify RED**

Run: `node --test tests/install-integration.test.js`

Expected: FAIL because current instructions only consume `matches`, `rules`, and `references`.

- [ ] **Step 7: Update source Skill and generated Cursor Rule**

Change the source Skill command to:

```bash
node "$AICODING_ROOT/scripts/search-prompts.js" "<用户需求>" --project . --json --limit 5 --context-limit 10
```

Tell the workflow to read relevant top Prompt files, then high-ranked `contexts`, prioritizing `business-code` for project facts and `rule` for hard constraints. Update the template string in `install-integration.js` with the same command and priority rules; keep the restriction against importing AICoding absolute paths.

- [ ] **Step 8: Run CLI, installer, and search tests**

Run: `node --test tests/search-prompts-cli.test.js tests/install-integration.test.js tests/search-prompts.test.js`

Expected: PASS.

- [ ] **Step 9: Commit CLI and workflow integration**

```bash
git add scripts/search-prompts.js tests/search-prompts-cli.test.js scripts/install-integration.js tests/install-integration.test.js skills/aicoding-codegen/SKILL.md
git commit -m "feat: connect hybrid search to codegen workflow"
```

---

### Task 7: Package, Document, and Verify the Feature

**Files:**
- Modify: `package.json`
- Modify: `README.md`
- Modify: `docs/实际项目接入指南.md`

**Interfaces:**
- Published npm package contains all modules required by `search-prompts.js`.
- `npm run check` syntax-checks all new scripts.

- [ ] **Step 1: Write a failing package-content assertion**

Extend `tests/install-integration.test.js` or add a focused assertion that every runtime module required by `scripts/search-prompts.js` appears in `package.json#files`. The expected entries are:

```js
[
  "scripts/prompt-contracts.js",
  "scripts/codebase-scanner.js",
  "scripts/codebase-chunker.js",
  "scripts/hybrid-ranker.js",
]
```

- [ ] **Step 2: Run the package assertion and verify RED**

Run: `node --test tests/install-integration.test.js`

Expected: FAIL because the four scripts are absent from the publish allowlist.

- [ ] **Step 3: Update package files and validation commands**

Add all four modules to `package.json#files`. Add a `check:prompt-contracts` script that runs `node scripts/prompt-contracts.js --check`. Add `node --check` for each module and `npm run check:prompt-contracts` to the existing `check` sequence before `check:prompts`, without changing the remaining validation order.

- [ ] **Step 4: Run the package assertion and syntax checks**

Run: `node --test tests/install-integration.test.js`

Run: `node --check scripts/prompt-contracts.js && node --check scripts/codebase-scanner.js && node --check scripts/codebase-chunker.js && node --check scripts/hybrid-ranker.js && node --check scripts/search-prompts.js && npm run check:prompt-contracts`

Expected: all commands PASS.

- [ ] **Step 5: Update user documentation**

In `README.md`, describe the coding chain as `Prompt 契约 + Codebase 混合检索`, add `npx aicoding search "用户 CRUD 列表" --project .`, document `prompts/asset-contracts.json` and `npm run check:prompt-contracts`, and state that the first version is deterministic, offline, and does not upload source code.

In `docs/实际项目接入指南.md`, update the execution flow so search receives `--project .`, explain that `matches.rules` and `matches.references` come from the validated asset contract, explain the `matches`/`contexts` split, list supported extensions and fixed exclusions, document the 5,000-file/512-KiB defaults, and clarify that Embeddings are a future optional provider rather than a current requirement.

- [ ] **Step 6: Run focused Node tests**

Run: `node --test tests/prompt-contracts.test.js tests/codebase-scanner.test.js tests/codebase-chunker.test.js tests/hybrid-ranker.test.js tests/search-prompts.test.js tests/search-prompts-cli.test.js tests/install-integration.test.js`

Expected: PASS with no warnings or skipped tests.

- [ ] **Step 7: Run the complete repository verification**

Run: `npm run check`

Expected: exit status `0`; Prompt catalog check, ai-kit contracts, TypeScript checking, Node tests, and Vitest all pass.

- [ ] **Step 8: Inspect packaging and diff scope**

Run: `npm pack --dry-run`

Expected: output includes `prompts/asset-contracts.json`, `scripts/prompt-contracts.js`, `scripts/codebase-scanner.js`, `scripts/codebase-chunker.js`, `scripts/hybrid-ranker.js`, and `scripts/search-prompts.js`.

Run: `git diff --check`

Expected: no whitespace errors. Review `git status --short` and ensure only files from this plan are staged for the feature commit; leave unrelated pre-existing changes untouched.

- [ ] **Step 9: Commit packaging and documentation**

```bash
git add package.json README.md docs/实际项目接入指南.md tests/install-integration.test.js
git commit -m "docs: publish and explain hybrid codebase search"
```

---

## Completion Gate

Before claiming completion, use `superpowers:verification-before-completion` and confirm from fresh output that:

- Every new production behavior was preceded by an observed failing test.
- Every non-README Prompt has a valid contract, and contract paths/body references cannot drift silently.
- Existing Prompt ranking and `matches` fields did not regress.
- Business scanning occurs only when `project` is explicitly supplied.
- Sensitive files and fixed excluded directories are never read or returned.
- Context results are explainable, stable, deduplicated, and bounded.
- Installed Skill and Cursor Rule pass `--project .` and consume `contexts`.
- No runtime dependency was added.
- `npm run check`, `npm pack --dry-run`, and `git diff --check` succeed.
