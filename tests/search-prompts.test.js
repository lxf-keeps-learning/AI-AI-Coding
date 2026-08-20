"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
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
