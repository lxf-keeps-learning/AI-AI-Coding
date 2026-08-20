#!/usr/bin/env node
"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { loadPromptContracts } = require("./prompt-contracts.js");

const DEFAULT_ROOT = path.resolve(__dirname, "..");

const CATEGORY_RULES = {
  charts: [".cursor/rules/charts/chart.mdc"],
  components: [".cursor/rules/components/component.mdc"],
  forms: [".cursor/rules/forms/form.mdc"],
  hooks: [".cursor/rules/global/typescript.mdc"],
  pages: [".cursor/rules/global/architecture.mdc"],
  performance: [".cursor/rules/performance/render.mdc"],
  refactor: [".cursor/rules/refactor/component-refactor.mdc"],
  review: [".cursor/rules/review/code-review.mdc"],
  search: [".cursor/rules/search/base-search.mdc"],
  table: [".cursor/rules/hooks/use-table.mdc"],
  tree: [".cursor/rules/tree/tree.mdc"],
};

const ROUTES = [
  { aliases: ["折线图", "曲线图", "趋势图", "line chart"], terms: ["折线图", "line-chart", "趋势", "charts"] },
  { aliases: ["柱状图", "条形图", "bar chart"], terms: ["柱状图", "bar", "charts"] },
  { aliases: ["饼图", "pie chart"], terms: ["饼图", "pie", "charts"] },
  { aliases: ["图表", "echarts", "chart"], terms: ["图表", "echarts", "charts"] },
  { aliases: ["列表", "表格", "crud", "table"], terms: ["列表", "表格", "crud", "table", "pages"] },
  { aliases: ["搜索", "查询", "筛选"], terms: ["搜索", "查询", "search"] },
  { aliases: ["表单", "form"], terms: ["表单", "form", "forms"] },
  { aliases: ["弹窗", "对话框", "dialog"], terms: ["弹窗", "dialog", "components"] },
  { aliases: ["抽屉", "drawer"], terms: ["抽屉", "drawer", "components"] },
  { aliases: ["树", "树形", "tree"], terms: ["树", "tree"] },
  { aliases: ["性能", "卡顿", "优化"], terms: ["性能", "优化", "performance"] },
  { aliases: ["重构", "refactor"], terms: ["重构", "refactor"] },
  { aliases: ["审查", "review"], terms: ["审查", "review"] },
  { aliases: ["请求", "request", "hook"], terms: ["请求", "request", "hooks"] },
];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function getTitle(content, filename) {
  const heading = content.match(/^#\s+(.+)$/m);
  if (heading) return heading[1].trim();
  const firstLine = content.split(/\r?\n/).find((line) => line.trim());
  return firstLine ? firstLine.replace(/^#+\s*/, "").trim() : path.basename(filename, ".md");
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function findRules(root, promptFile) {
  const relativePrompt = path.relative(path.join(root, "prompts"), promptFile);
  const parsed = path.parse(relativePrompt);
  const category = relativePrompt.split(path.sep)[0];
  const candidates = [
    ".cursor/rules/global/base.mdc",
    ".cursor/rules/global/typescript.mdc",
    ...(CATEGORY_RULES[category] || []),
    `.cursor/rules/${category}/${parsed.name}.mdc`,
  ];

  return unique(candidates).filter((relativePath) => fs.existsSync(path.join(root, relativePath)));
}

function queryTerms(query) {
  const normalized = query.toLowerCase().trim();
  const terms = normalized
    .replace(/[，。、“”‘’！？：；（）()\[\]{}]/g, " ")
    .split(/\s+/)
    .filter((term) => term.length > 1 && !/^(生成|创建|实现|开发|一个|帮我|请|需要|组件|页面|功能)$/.test(term));

  ROUTES.forEach((route) => {
    if (route.aliases.some((alias) => normalized.includes(alias))) terms.push(...route.terms);
  });
  return unique(terms);
}

function countIncludes(text, term) {
  if (!term || !text.includes(term)) return 0;
  return text.split(term).length - 1;
}

function searchPrompts(query, options = {}) {
  const root = path.resolve(options.root || DEFAULT_ROOT);
  const promptsRoot = path.join(root, "prompts");
  if (!fs.existsSync(promptsRoot)) throw new Error(`AICoding prompts 目录不存在：${promptsRoot}`);

  let contracts;
  let missingContractFile = false;
  try {
    contracts = loadPromptContracts(root);
  } catch (cause) {
    if (cause.code === "ENOENT") missingContractFile = true;
    else throw cause;
  }

  const terms = queryTerms(query);
  const warnings = [];
  const ranked = walk(promptsRoot)
    .filter((file) => file.endsWith(".md") && path.basename(file).toLowerCase() !== "readme.md")
    .map((file) => {
      const content = fs.readFileSync(file, "utf8");
      const relativePath = path.relative(root, file).split(path.sep).join("/");
      const title = getTitle(content, file);
      const titleText = title.toLowerCase();
      const pathText = relativePath.toLowerCase();
      const bodyText = content.toLowerCase();
      let score = 0;

      terms.forEach((term) => {
        score += countIncludes(titleText, term) * 30;
        score += countIncludes(pathText, term) * 16;
        score += Math.min(countIncludes(bodyText, term), 5) * 4;
      });

      const inferredReferences = unique(
        [...content.matchAll(/(?:^|[\s`(])((?:src\/ai-kit|\.cursor\/rules)\/[\w./-]+)/gm)].map((match) => match[1])
      );
      const contract = contracts && contracts.get(relativePath);
      const useFallback = missingContractFile || !contract;
      const references = useFallback ? inferredReferences : [...contract.references];
      const rules = useFallback
        ? unique([...findRules(root, file), ...inferredReferences.filter((reference) => reference.startsWith(".cursor/rules/"))])
        : unique([...contract.rules, ".cursor/rules/global/base.mdc", ".cursor/rules/global/typescript.mdc"]);
      if (useFallback) {
        warnings.push({
          code: "CONTRACT_FALLBACK",
          path: relativePath,
          message: missingContractFile
            ? `缺少 prompts/asset-contracts.json，使用兼容性资产推断：${relativePath}`
            : `Prompt 缺少资产合同，使用兼容性资产推断：${relativePath}`,
        });
      }

      return {
        path: relativePath,
        title,
        category: path.relative(promptsRoot, file).split(path.sep)[0],
        score,
        references,
        rules,
        preview: content.replace(/```/g, "").replace(/\s+/g, " ").trim().slice(0, 160),
      };
    })
    .sort((a, b) => b.score - a.score || a.path.localeCompare(b.path));

  const positiveMatches = ranked.filter((item) => item.score > 0);
  const results = positiveMatches.length ? positiveMatches : ranked;

  return {
    query,
    terms,
    root,
    warnings,
    matches: results.slice(0, Math.max(1, Number(options.limit) || 5)),
  };
}

function parseArgs(argv) {
  const options = { limit: 5, json: false, root: DEFAULT_ROOT };
  const queryParts = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--json") options.json = true;
    else if (argv[i] === "--limit") options.limit = Number(argv[++i]);
    else if (argv[i] === "--root") options.root = argv[++i];
    else queryParts.push(argv[i]);
  }
  return { query: queryParts.join(" ").trim(), options };
}

function runCli() {
  const { query, options } = parseArgs(process.argv.slice(2));
  if (!query) {
    console.error('用法：node scripts/search-prompts.js "折线图" [--json] [--limit 5]');
    process.exitCode = 1;
    return;
  }
  const result = searchPrompts(query, options);
  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  console.log(`查询：${result.query}`);
  console.log(`检索词：${result.terms.join("、")}`);
  result.matches.forEach((match, index) => {
    console.log(`\n${index + 1}. ${match.title}  [${match.score}]`);
    console.log(`   ${match.path}`);
    if (match.references.length) console.log(`   参考：${match.references.join("、")}`);
    if (match.rules.length) console.log(`   规则：${match.rules.join("、")}`);
  });
}

if (require.main === module) runCli();

module.exports = { searchPrompts, queryTerms, findRules };
