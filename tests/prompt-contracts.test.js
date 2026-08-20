"use strict";

const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");
const assert = require("node:assert/strict");
const { loadPromptContracts, validatePromptContracts } = require("../scripts/prompt-contracts.js");

const root = path.resolve(__dirname, "..");

function withFixture(mutator) {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "prompt-contracts-"));
  fs.mkdirSync(path.join(fixtureRoot, "prompts", "demo"), { recursive: true });
  fs.mkdirSync(path.join(fixtureRoot, ".cursor", "rules", "demo"), { recursive: true });
  fs.mkdirSync(path.join(fixtureRoot, "src", "ai-kit", "demo"), { recursive: true });
  fs.writeFileSync(path.join(fixtureRoot, "prompts", "demo", "example.md"), "# Example\n\n- src/ai-kit/demo/Example.vue\n");
  fs.writeFileSync(path.join(fixtureRoot, ".cursor", "rules", "demo", "example.mdc"), "# Rule\n");
  fs.writeFileSync(path.join(fixtureRoot, "src", "ai-kit", "demo", "Example.vue"), "<template />\n");
  const contract = {
    version: 1,
    prompts: {
      "prompts/demo/example.md": {
        rules: [".cursor/rules/demo/example.mdc"],
        references: ["src/ai-kit/demo/Example.vue"],
      },
    },
  };
  try {
    mutator(contract, fixtureRoot);
    fs.writeFileSync(path.join(fixtureRoot, "prompts", "asset-contracts.json"), JSON.stringify(contract, null, 2));
    return validatePromptContracts(fixtureRoot);
  } finally {
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

function errorCodes(report) {
  return report.errors.map((error) => error.code);
}

test("repository Prompt contract covers every Prompt and has valid assets", () => {
  const report = validatePromptContracts(root);
  assert.deepEqual(report.errors, []);
  assert.equal(report.coverage.promptCount, 22);
  assert.equal(report.coverage.contractedPromptCount, 22);
  for (const contract of loadPromptContracts(root).values()) {
    assert.ok(contract.rules.length > 0);
    if (contract.references.length === 0) assert.ok(contract.noReferenceReason?.trim());
  }
});

test("reports a missing Prompt contract", () => {
  const report = withFixture((contract) => delete contract.prompts["prompts/demo/example.md"]);
  assert.deepEqual(errorCodes(report), ["MISSING_PROMPT_CONTRACT"]);
});

test("reports an orphan Prompt contract", () => {
  const report = withFixture((contract) => {
    contract.prompts["prompts/demo/removed.md"] = contract.prompts["prompts/demo/example.md"];
  });
  assert.deepEqual(errorCodes(report), ["ORPHAN_PROMPT_CONTRACT"]);
});

test("reports duplicate Rules", () => {
  const report = withFixture((contract) => {
    contract.prompts["prompts/demo/example.md"].rules.push(".cursor/rules/demo/example.mdc");
  });
  assert.deepEqual(errorCodes(report), ["INVALID_RULES"]);
});

test("reports a contract asset that does not exist", () => {
  const report = withFixture((contract) => {
    contract.prompts["prompts/demo/example.md"].references = ["src/ai-kit/demo/Missing.vue"];
  });
  assert.deepEqual(errorCodes(report), ["MISSING_ASSET", "REFERENCE_DRIFT"]);
});

test("reports a contract path that escapes its asset root", () => {
  const report = withFixture((contract) => {
    contract.prompts["prompts/demo/example.md"].rules = [".cursor/rules/demo/../../../outside.mdc"];
  });
  assert.deepEqual(errorCodes(report), ["PATH_ESCAPE"]);
});

test("requires a reason when a contract has no ai-kit References", () => {
  const report = withFixture((contract) => {
    contract.prompts["prompts/demo/example.md"].references = [];
  });
  assert.deepEqual(errorCodes(report), ["INVALID_REFERENCES", "REFERENCE_DRIFT"]);
});

test("forbids a no-reference reason when References are present", () => {
  const report = withFixture((contract) => {
    contract.prompts["prompts/demo/example.md"].noReferenceReason = "Not applicable";
  });
  assert.deepEqual(errorCodes(report), ["INVALID_REFERENCES"]);
});

test("reports Prompt-body ai-kit references omitted from the contract", () => {
  const report = withFixture((contract) => {
    contract.prompts["prompts/demo/example.md"].references = [];
    contract.prompts["prompts/demo/example.md"].noReferenceReason = "No runtime asset is required.";
  });
  assert.deepEqual(errorCodes(report), ["REFERENCE_DRIFT"]);
});

test("reports unmapped assets in coverage without failing validation", () => {
  const report = withFixture((contract, fixtureRoot) => {
    fs.writeFileSync(path.join(fixtureRoot, ".cursor", "rules", "demo", "unused.mdc"), "# Unused\n");
    fs.writeFileSync(path.join(fixtureRoot, "src", "ai-kit", "demo", "Unused.ts"), "export {};\n");
  });
  assert.deepEqual(report.errors, []);
  assert.deepEqual(report.coverage.unmappedRules, [".cursor/rules/demo/unused.mdc"]);
  assert.deepEqual(report.coverage.unmappedReferences, ["src/ai-kit/demo/Unused.ts"]);
});
