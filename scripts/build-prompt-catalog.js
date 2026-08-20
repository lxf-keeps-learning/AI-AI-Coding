"use strict";

const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const promptsRoot = path.join(root, "prompts");
const outputPath = path.join(root, "js", "prompt-catalog.js");
const checkOnly = process.argv.includes("--check");

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

function makePreview(content) {
  return content
    .replace(/```[a-z]*\n?/gi, "")
    .replace(/^#+\s*/gm, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 140);
}

const catalog = walk(promptsRoot)
  .filter((file) => file.endsWith(".md") && path.basename(file).toLowerCase() !== "readme.md")
  .map((file) => {
    const relativePath = path.relative(promptsRoot, file).split(path.sep).join("/");
    const content = fs.readFileSync(file, "utf8").trim();
    return {
      id: relativePath.replace(/\.md$/, "").replace(/\//g, "-"),
      category: relativePath.split("/")[0],
      path: relativePath,
      title: getTitle(content, file),
      preview: makePreview(content),
      content,
    };
  })
  .sort((a, b) => a.category.localeCompare(b.category) || a.title.localeCompare(b.title));

const output =
  "// 此文件由 scripts/build-prompt-catalog.js 自动生成，请勿手动修改。\n" +
  "window.PROMPT_CATALOG = " +
  JSON.stringify(catalog, null, 2) +
  ";\n";

if (checkOnly) {
  const current = fs.existsSync(outputPath) ? fs.readFileSync(outputPath, "utf8") : "";
  if (current !== output) {
    console.error("Prompt 目录已过期，请运行 npm run build:prompts");
    process.exit(1);
  }
} else {
  fs.writeFileSync(outputPath, output);
  console.log(`已生成 ${catalog.length} 个 Prompt：${path.relative(root, outputPath)}`);
}
