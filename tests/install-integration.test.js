"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { installIntegration } = require("../scripts/install-integration.js");

test("安装器为业务项目创建 Codex Skill、Cursor Rule 和配置", (t) => {
  const target = fs.mkdtempSync(path.join(os.tmpdir(), "aicoding-integration-"));
  t.after(() => fs.rmSync(target, { recursive: true, force: true }));

  const result = installIntegration({ target });
  assert.ok(fs.existsSync(path.join(result.codexSkill, "SKILL.md")));
  assert.ok(fs.existsSync(result.cursorRule));
  assert.ok(fs.existsSync(result.config));

  const config = JSON.parse(fs.readFileSync(result.config, "utf8"));
  assert.equal(config.version, 1);
  assert.equal(config.assetMode, "reference");
  assert.equal(path.resolve(target, config.sourceRoot), result.sourceRoot);

  const cursorRule = fs.readFileSync(result.cursorRule, "utf8");
  assert.match(cursorRule, /`rules` 和 ai-kit `references`/);
});
