"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { searchPrompts, queryTerms } = require("../scripts/search-prompts.js");

const root = path.resolve(__dirname, "..");

test("中文自然语言可以路由到折线图 Prompt", () => {
  const result = searchPrompts("帮我生成一个折线图组件", { root, limit: 3 });
  assert.ok(result.matches.length > 0);
  assert.match(result.matches[0].path, /charts\/(line-chart|chart)\.md/);
  assert.ok(result.matches[0].score > 0);
});

test("CRUD 需求会展开表格和列表检索词", () => {
  const terms = queryTerms("创建一个用户 CRUD 列表页面");
  assert.ok(terms.includes("crud"));
  assert.ok(terms.includes("列表"));
  assert.ok(terms.includes("table"));
});

test("检索结果包含 Prompt 引用的 ai-kit 文件", () => {
  const result = searchPrompts("部门树", { root, limit: 3 });
  const references = result.matches.flatMap((item) => item.references);
  assert.ok(references.some((item) => item.includes("src/ai-kit/tree/BaseTree.vue")));
});

test("检索结果会自动关联全局规则和同名场景规则", () => {
  const result = searchPrompts("生成折线图", { root, limit: 1 });
  assert.ok(result.matches[0].rules.includes(".cursor/rules/global/base.mdc"));
  assert.ok(result.matches[0].rules.includes(".cursor/rules/charts/chart.mdc"));
  assert.ok(result.matches[0].rules.includes(".cursor/rules/charts/line-chart.mdc"));
});

test("检索使用 Prompt 合同作为规则和 ai-kit 引用的权威来源", () => {
  const result = searchPrompts("生成折线图", { root, limit: 3 });
  const lineChart = result.matches.find((item) => item.path === "prompts/charts/line-chart.md");
  assert.deepEqual(lineChart.references, [
    "src/ai-kit/charts/BaseChart.vue",
    "src/ai-kit/hooks/useChart.ts",
    "src/ai-kit/hooks/useRequest.ts",
  ]);
  assert.deepEqual(lineChart.rules, [
    ".cursor/rules/charts/chart.mdc",
    ".cursor/rules/charts/line-chart.mdc",
    ".cursor/rules/global/base.mdc",
    ".cursor/rules/global/typescript.mdc",
  ]);
});

test("没有合同文件时检索保留目录推断并报告兼容性回退", () => {
  const legacyRoot = fs.mkdtempSync(path.join(os.tmpdir(), "search-prompts-legacy-"));
  try {
    fs.mkdirSync(path.join(legacyRoot, "prompts", "demo"), { recursive: true });
    fs.mkdirSync(path.join(legacyRoot, ".cursor", "rules", "global"), { recursive: true });
    fs.mkdirSync(path.join(legacyRoot, ".cursor", "rules", "demo"), { recursive: true });
    fs.writeFileSync(path.join(legacyRoot, "prompts", "demo", "legacy.md"), "# Legacy search\n\nsrc/ai-kit/demo/Legacy.vue\n");
    fs.writeFileSync(path.join(legacyRoot, ".cursor", "rules", "global", "base.mdc"), "# Base\n");
    fs.writeFileSync(path.join(legacyRoot, ".cursor", "rules", "global", "typescript.mdc"), "# TypeScript\n");
    fs.writeFileSync(path.join(legacyRoot, ".cursor", "rules", "demo", "legacy.mdc"), "# Legacy\n");
    const result = searchPrompts("legacy", { root: legacyRoot, limit: 1 });
    assert.ok(result.matches[0].rules.includes(".cursor/rules/demo/legacy.mdc"));
    assert.deepEqual(result.matches[0].references, ["src/ai-kit/demo/Legacy.vue"]);
    assert.ok(result.warnings.some((warning) => warning.code === "CONTRACT_FALLBACK" && warning.path === "prompts/demo/legacy.md"));
  } finally {
    fs.rmSync(legacyRoot, { recursive: true, force: true });
  }
});
