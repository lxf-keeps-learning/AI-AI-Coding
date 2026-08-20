#!/usr/bin/env node
"use strict";

const { spawnSync } = require("node:child_process");
const path = require("node:path");

const [command, ...args] = process.argv.slice(2);
const scripts = {
  install: "install-integration.js",
  search: "search-prompts.js",
};

if (!scripts[command]) {
  console.log("AICoding CLI");
  console.log("  aicoding install --target /path/to/business-project");
  console.log('  aicoding search "折线图" --json');
  process.exitCode = command ? 1 : 0;
} else {
  const result = spawnSync(process.execPath, [path.join(__dirname, scripts[command]), ...args], {
    stdio: "inherit",
  });
  process.exitCode = result.status == null ? 1 : result.status;
}
