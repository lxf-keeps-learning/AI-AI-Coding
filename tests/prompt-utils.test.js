"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const utils = require("../js/prompt-utils.js");

test("变量扫描会去重、去空格并保持出现顺序", () => {
  assert.deepEqual(utils.extractUniqueVarNames("{{ name }} / {{id}} / {{name}} / {{ }}"), ["name", "id"]);
});

test("变量替换支持空字符串并保留未提供的变量", () => {
  assert.equal(
    utils.replaceVariables("你好 {{ name }}，编号 {{id}}", { name: "", id: "A-01" }),
    "你好 ，编号 A-01"
  );
  assert.equal(utils.replaceVariables("{{known}} {{unknown}}", { known: "yes" }), "yes {{unknown}}");
});

test("格式化统一换行、清理行尾空白并限制连续空行", () => {
  assert.equal(utils.formatPrompt("  标题  \r\n\r\n\r\n\r\n内容\t\r\n"), "标题\n\n\n内容\n");
});

test("历史记录清洗只保留满足契约的数据", () => {
  const valid = { id: "h-1", ts: 1, content: "prompt" };
  assert.deepEqual(
    utils.sanitizeHistory([valid, null, { id: 2, ts: 1, content: "x" }, { id: "h-2", ts: NaN, content: "x" }]),
    [valid]
  );
  assert.deepEqual(utils.sanitizeHistory({}), []);
});
