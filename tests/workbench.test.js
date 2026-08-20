"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const root = path.resolve(__dirname, "..");

test("交付工作台首次打开 API 设置时不预填密钥", () => {
  const html = fs.readFileSync(path.join(root, "workbench", "index.html"), "utf8");
  const script = fs.readFileSync(path.join(root, "workbench", "app.js"), "utf8");
  const dom = new JSDOM(html, {
    runScripts: "outside-only",
    url: "http://localhost/",
  });

  dom.window.marked = { parse: () => "" };
  dom.window.eval(script);
  dom.window.document.getElementById("btn-settings").click();

  assert.equal(dom.window.document.getElementById("set-apikey").value, "");
  dom.window.close();
});
