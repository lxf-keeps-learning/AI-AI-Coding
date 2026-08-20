#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const SOURCE_ROOT = path.resolve(__dirname, "..");

function normalizePath(value) {
  return value.split(path.sep).join("/");
}

function installIntegration(options = {}) {
  const sourceRoot = path.resolve(options.source || SOURCE_ROOT);
  const targetRoot = path.resolve(options.target || process.cwd());
  const sourceSkill = path.join(sourceRoot, "skills", "aicoding-codegen");
  if (!fs.existsSync(path.join(sourceRoot, "prompts"))) throw new Error(`无效 AICoding 根目录：${sourceRoot}`);
  if (!fs.existsSync(path.join(sourceSkill, "SKILL.md"))) throw new Error(`缺少 codegen Skill：${sourceSkill}`);

  fs.mkdirSync(targetRoot, { recursive: true });
  const configDir = path.join(targetRoot, ".aicoding");
  const skillTarget = path.join(targetRoot, ".agents", "skills", "aicoding-codegen");
  const cursorRulesDir = path.join(targetRoot, ".cursor", "rules");
  fs.mkdirSync(configDir, { recursive: true });
  fs.mkdirSync(path.dirname(skillTarget), { recursive: true });
  fs.mkdirSync(cursorRulesDir, { recursive: true });
  fs.cpSync(sourceSkill, skillTarget, { recursive: true, force: true });

  const relativeSource = normalizePath(path.relative(targetRoot, sourceRoot) || ".");
  const config = {
    version: 1,
    sourceRoot: relativeSource,
    promptLimit: 5,
    assetMode: "reference",
  };
  fs.writeFileSync(path.join(configDir, "config.json"), `${JSON.stringify(config, null, 2)}\n`);

  const cursorRule = `---
description: AICoding Prompt 检索与前端代码生成工作流
alwaysApply: true
---

# AICoding 接入

当用户要求生成或实现前端页面、表格、表单、弹窗、抽屉、树、图表或 Hook 时：

1. 读取 \`.aicoding/config.json\`，相对当前项目根目录解析 \`sourceRoot\`。
2. 先执行 \`node <sourceRoot>/scripts/search-prompts.js "<完整用户需求>" --json --limit 5\`。
3. 读取最相关的 1–3 个 Prompt，以及检索结果中的 \`rules\` 和 ai-kit \`references\` 文件。
4. 检查当前业务项目的依赖、相似代码、API、类型和目录规范。
5. 依据 Prompt 和参考资产在当前项目生成代码，并运行项目已有检查命令。

约束：

- AICoding 默认是知识库，不是运行时依赖；禁止从业务代码导入 AICoding 绝对路径。
- 当前业务项目约定优先，优先复用项目已有组件和 Hook。
- 不虚构 API、字段、权限或依赖，不覆盖无关修改。
- 最终说明命中的 Prompt、参考资产、修改文件和验证结果。
`;
  fs.writeFileSync(path.join(cursorRulesDir, "aicoding-codegen.mdc"), cursorRule);

  return {
    sourceRoot,
    targetRoot,
    config: path.join(configDir, "config.json"),
    codexSkill: skillTarget,
    cursorRule: path.join(cursorRulesDir, "aicoding-codegen.mdc"),
  };
}

function parseArgs(argv) {
  const options = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--target") options.target = argv[++i];
    else if (argv[i] === "--source") options.source = argv[++i];
  }
  return options;
}

if (require.main === module) {
  try {
    const result = installIntegration(parseArgs(process.argv.slice(2)));
    console.log("AICoding 已接入业务项目：");
    console.log(`- 项目：${result.targetRoot}`);
    console.log(`- Codex Skill：${result.codexSkill}`);
    console.log(`- Cursor Rule：${result.cursorRule}`);
    console.log("重新打开 Codex/Cursor 会话后，可直接输入：生成一个折线图");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { installIntegration };
