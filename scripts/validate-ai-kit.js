#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.resolve(__dirname, "..");

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function validateRule(file, errors) {
  const relativePath = path.relative(ROOT, file).split(path.sep).join("/");
  const content = fs.readFileSync(file, "utf8");
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---/);

  if (!frontmatter) {
    errors.push(`${relativePath}: 缺少 YAML frontmatter`);
    return;
  }
  if (!/^description:\s*\S+/m.test(frontmatter[1])) errors.push(`${relativePath}: 缺少 description`);
  if (!/^alwaysApply:\s*(true|false)\s*$/m.test(frontmatter[1])) errors.push(`${relativePath}: alwaysApply 必须是 true 或 false`);

  const assetPaths = [...content.matchAll(/`(src\/ai-kit\/[\w./-]+)`/g)].map((match) => match[1]);
  assetPaths.forEach((assetPath) => {
    if (!fs.existsSync(path.join(ROOT, assetPath))) errors.push(`${relativePath}: 引用了不存在的 ${assetPath}`);
  });
}

function validateAiKit(file, errors) {
  const relativePath = path.relative(ROOT, file).split(path.sep).join("/");
  const content = fs.readFileSync(file, "utf8");
  if (/\bany\b/.test(content)) errors.push(`${relativePath}: 不允许使用 any`);
}

function validate() {
  const errors = [];
  const rules = walk(path.join(ROOT, ".cursor", "rules")).filter((file) => file.endsWith(".mdc"));
  const aiKitFiles = walk(path.join(ROOT, "src", "ai-kit")).filter((file) => /\.(vue|ts)$/.test(file));

  rules.forEach((file) => validateRule(file, errors));
  aiKitFiles.forEach((file) => validateAiKit(file, errors));

  if (errors.length) {
    console.error(`ai-kit 契约检查失败（${errors.length} 项）：`);
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }

  console.log(`ai-kit 契约检查通过：${rules.length} 条 Cursor 规则，${aiKitFiles.length} 个实现文件。`);
}

if (require.main === module) validate();

module.exports = { validate };
