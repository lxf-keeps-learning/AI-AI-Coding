#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");

const CONTRACT_PATH = "prompts/asset-contracts.json";
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

function toPosix(filePath) {
  return filePath.split(path.sep).join("/");
}

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function pathsUnder(root, directory, predicate) {
  return walk(path.join(root, directory))
    .filter(predicate)
    .map((file) => toPosix(path.relative(root, file)))
    .sort();
}

function promptPaths(root) {
  return pathsUnder(root, "prompts", (file) => file.endsWith(".md") && path.basename(file).toLowerCase() !== "readme.md");
}

function assetPaths(root) {
  return {
    rules: pathsUnder(root, ".cursor/rules", (file) => file.endsWith(".mdc")),
    references: pathsUnder(root, "src/ai-kit", (file) => file.endsWith(".vue") || file.endsWith(".ts")),
  };
}

function readContract(root) {
  const filename = path.join(root, CONTRACT_PATH);
  let parsed;
  try {
    parsed = JSON.parse(fs.readFileSync(filename, "utf8"));
  } catch (error) {
    if (error && error.code === "ENOENT") throw error;
    throw new Error(`无法解析 ${CONTRACT_PATH}: ${error.message}`);
  }
  return parsed;
}

function error(code, assetPath, message) {
  return { code, path: assetPath, message };
}

function isArrayOfUniqueStrings(value) {
  return Array.isArray(value) && value.every((item) => typeof item === "string" && item.trim()) && new Set(value).size === value.length;
}

function isContained(root, relativePath) {
  if (relativePath.split("/").includes("..")) return false;
  const target = path.resolve(root, relativePath);
  return target === root || target.startsWith(`${root}${path.sep}`);
}

function isAssetPath(value, prefix) {
  return typeof value === "string" && value.startsWith(prefix) && !value.includes("\\");
}

function promptReferences(root, promptPath) {
  const content = fs.readFileSync(path.join(root, promptPath), "utf8");
  return [...new Set([...content.matchAll(/src\/ai-kit\/[\w./-]+/g)].map((match) => match[0]))].sort();
}

function validatePromptContracts(root) {
  const resolvedRoot = path.resolve(root);
  const errors = [];
  const warnings = [];
  const prompts = promptPaths(resolvedRoot);
  const assets = assetPaths(resolvedRoot);
  let document;
  try {
    document = readContract(resolvedRoot);
  } catch (cause) {
    if (cause.code === "ENOENT") {
      return {
        errors: [error("INVALID_CONTRACT", CONTRACT_PATH, `缺少 ${CONTRACT_PATH}`)],
        warnings,
        coverage: { promptCount: prompts.length, contractedPromptCount: 0, mappedRules: [], unmappedRules: assets.rules, mappedReferences: [], unmappedReferences: assets.references },
      };
    }
    return {
      errors: [error("INVALID_CONTRACT", CONTRACT_PATH, cause.message)],
      warnings,
      coverage: { promptCount: prompts.length, contractedPromptCount: 0, mappedRules: [], unmappedRules: assets.rules, mappedReferences: [], unmappedReferences: assets.references },
    };
  }

  if (!document || typeof document !== "object" || document.version !== 1 || !document.prompts || typeof document.prompts !== "object" || Array.isArray(document.prompts)) {
    errors.push(error("INVALID_CONTRACT", CONTRACT_PATH, "合同必须包含 version: 1 和 prompts 对象"));
  }
  const contracts = document && document.prompts && typeof document.prompts === "object" && !Array.isArray(document.prompts) ? document.prompts : {};
  const contractPaths = Object.keys(contracts).sort();
  const promptSet = new Set(prompts);
  const mappedRules = new Set();
  const mappedReferences = new Set();

  prompts.forEach((promptPath) => {
    if (!Object.prototype.hasOwnProperty.call(contracts, promptPath)) {
      errors.push(error("MISSING_PROMPT_CONTRACT", promptPath, `Prompt 缺少资产合同：${promptPath}`));
    }
  });
  contractPaths.forEach((promptPath) => {
    if (!promptSet.has(promptPath)) {
      errors.push(error("ORPHAN_PROMPT_CONTRACT", promptPath, `合同指向不存在的 Prompt：${promptPath}`));
    }
  });

  contractPaths.forEach((promptPath) => {
    const contract = contracts[promptPath];
    if (!contract || typeof contract !== "object" || Array.isArray(contract)) {
      errors.push(error("INVALID_CONTRACT", promptPath, "Prompt 合同必须是对象"));
      return;
    }
    const rules = contract.rules;
    const references = contract.references;
    if (!isArrayOfUniqueStrings(rules) || rules.length === 0 || rules.some((rule) => !isAssetPath(rule, ".cursor/rules/"))) {
      errors.push(error("INVALID_RULES", promptPath, "rules 必须是非空、不重复的 .cursor/rules/ 路径数组"));
    } else {
      rules.forEach((rule) => {
        if (!isContained(resolvedRoot, rule)) {
          errors.push(error("PATH_ESCAPE", rule, `资产路径超出仓库根目录：${rule}`));
        } else if (!fs.existsSync(path.join(resolvedRoot, rule))) {
          errors.push(error("MISSING_ASSET", rule, `合同资产不存在：${rule}`));
        } else {
          mappedRules.add(rule);
        }
      });
    }
    const noReferenceReason = contract.noReferenceReason;
    const validReferences = isArrayOfUniqueStrings(references) && references.every((reference) => isAssetPath(reference, "src/ai-kit/"));
    const hasReason = typeof noReferenceReason === "string" && noReferenceReason.trim().length > 0;
    if (!validReferences || (references.length === 0 && !hasReason) || (references.length > 0 && noReferenceReason !== undefined)) {
      errors.push(error("INVALID_REFERENCES", promptPath, "references 与 noReferenceReason 的组合无效"));
    } else {
      references.forEach((reference) => {
        if (!isContained(resolvedRoot, reference)) {
          errors.push(error("PATH_ESCAPE", reference, `资产路径超出仓库根目录：${reference}`));
        } else if (!fs.existsSync(path.join(resolvedRoot, reference))) {
          errors.push(error("MISSING_ASSET", reference, `合同资产不存在：${reference}`));
        } else {
          mappedReferences.add(reference);
        }
      });
    }
    if (promptSet.has(promptPath) && Array.isArray(references)) {
      const referencesInBody = promptReferences(resolvedRoot, promptPath);
      referencesInBody.filter((reference) => !references.includes(reference)).forEach((reference) => {
        errors.push(error("REFERENCE_DRIFT", promptPath, `Prompt 正文引用未纳入合同：${reference}`));
      });
    }
  });

  const coverage = {
    promptCount: prompts.length,
    contractedPromptCount: prompts.filter((promptPath) => Object.prototype.hasOwnProperty.call(contracts, promptPath)).length,
    mappedRules: [...mappedRules].sort(),
    unmappedRules: assets.rules.filter((rule) => !mappedRules.has(rule)),
    mappedReferences: [...mappedReferences].sort(),
    unmappedReferences: assets.references.filter((reference) => !mappedReferences.has(reference)),
  };
  coverage.unmappedRules.forEach((rule) => warnings.push({ code: "UNMAPPED_RULE", path: rule, message: `Rule 尚未映射到 Prompt：${rule}` }));
  coverage.unmappedReferences.forEach((reference) => warnings.push({ code: "UNMAPPED_REFERENCE", path: reference, message: `ai-kit 资产尚未映射到 Prompt：${reference}` }));
  return { errors, warnings, coverage };
}

function loadPromptContracts(root) {
  const resolvedRoot = path.resolve(root);
  const filename = path.join(resolvedRoot, CONTRACT_PATH);
  if (!fs.existsSync(filename)) {
    const cause = new Error(`缺少 ${CONTRACT_PATH}`);
    cause.code = "ENOENT";
    throw cause;
  }
  const report = validatePromptContracts(resolvedRoot);
  if (report.errors.length) {
    const details = report.errors.map((item) => `${item.code}: ${item.path}`).join("; ");
    throw new Error(`无效的 ${CONTRACT_PATH}: ${details}`);
  }
  const document = readContract(resolvedRoot);
  return new Map(Object.entries(document.prompts).map(([promptPath, contract]) => [promptPath, {
    rules: [...contract.rules],
    references: [...contract.references],
    ...(contract.noReferenceReason === undefined ? {} : { noReferenceReason: contract.noReferenceReason }),
  }]));
}

function runCli() {
  const root = path.resolve(__dirname, "..");
  const report = validatePromptContracts(root);
  if (process.argv.includes("--check") && report.errors.length) {
    report.errors.forEach((item) => console.error(`${item.code} ${item.path}: ${item.message}`));
    process.exitCode = 1;
    return;
  }
  console.log(`Prompt contracts: ${report.coverage.contractedPromptCount}/${report.coverage.promptCount}`);
  console.log(`Rules: ${report.coverage.mappedRules.length} mapped, ${report.coverage.unmappedRules.length} unmapped`);
  console.log(`References: ${report.coverage.mappedReferences.length} mapped, ${report.coverage.unmappedReferences.length} unmapped`);
}

if (require.main === module) runCli();

module.exports = { ERROR_CODES, loadPromptContracts, validatePromptContracts };
