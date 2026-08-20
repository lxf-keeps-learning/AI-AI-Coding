/**
 * AI Delivery Workbench — 交付工作台
 *
 * 纯前端静态实现：需求输入 → LLM 生成 PRD-SPEC（SSE 流式）→ 待确认交互 → 文档管理。
 * 所有数据存于浏览器 localStorage，无后端、无构建。
 *
 * 系统提示词内置 prd-spec-enhancer 机制：
 *   checklist 逐项检查（必备/条件必备/可选）+ ≈推断 / ⚠️待确认 来源标注
 *   + 不编造 + 按 PRD-SPEC模板 骨架输出。
 */

(function () {
  "use strict";

  /* ---------- 常量 ---------- */
  var STORAGE_DOCS = "workbench-docs-v1";
  var STORAGE_CONFIG = "workbench-config-v1";
  var STORAGE_ACTIVE = "workbench-active-v1";

  var DEFAULT_CONFIG = {
    baseURL: "https://api.deepseek.com/v1",
    model: "deepseek-chat",
    apiKey: "",
  };

  var MAX_HISTORY = 20;

  /* ---------- DOM ---------- */
  var $ = function (id) { return document.getElementById(id); };

  var els = {
    connStatus: $("conn-status"),
    btnSettings: $("btn-settings"),
    btnNewDoc: $("btn-new-doc"),
    docSearch: $("doc-search"),
    docList: $("doc-list"),
    docCount: $("doc-count"),
    reqInput: $("req-input"),
    reqCount: $("req-count"),
    btnGenSpec: $("btn-gen-spec"),
    btnGenTestplan: $("btn-gen-testplan"),
    btnStop: $("btn-stop"),
    genStatus: $("gen-status"),
    confirmPanel: $("confirm-panel"),
    confirmList: $("confirm-list"),
    btnContinue: $("btn-continue"),
    docTitle: $("doc-title"),
    docMeta: $("doc-meta"),
    btnModeEdit: $("btn-mode-edit"),
    btnHistory: $("btn-history"),
    btnExport: $("btn-export"),
    btnDelete: $("btn-delete"),
    preview: $("preview"),
    editor: $("editor"),
    historyPanel: $("history-panel"),
    historyList: $("history-list"),
    btnHistoryClose: $("btn-history-close"),
    toast: $("toast"),
    settingsModal: $("settings-modal"),
    setBaseURL: $("set-baseurl"),
    setModel: $("set-model"),
    setApiKey: $("set-apikey"),
    btnTestConn: $("btn-test-conn"),
    testResult: $("test-result"),
    settingsForm: $("settings-form"),
  };

  /* ---------- 状态 ---------- */
  var state = {
    config: loadConfig(),
    docs: loadDocs(),
    activeId: null,
    mode: "preview", // preview | edit
    generating: false,
    abortController: null,
    pendingQuestions: [], // [{ id, question }]
  };

  /* ---------- 系统提示词（prd-spec-enhancer 机制内嵌） ---------- */
  var SYSTEM_PROMPT = [
    "你是一名资深产品经理，负责把产品提出的模糊需求完善为可指导研发直接开发的 PRD-SPEC（Markdown）。",
    "",
    "## 执行机制（必须遵守）",
    "1. 逐项检查（checklist）：按下面的元素清单对每个元素判定必要性——必备（恒定必须）、条件必备（命中触发条件才必须）、可选（复杂需求才需要）。未命中触发条件的条件必备/可选元素不强求，避免过度膨胀。",
    "2. 来源标注（精简）：默认不标即为已确认（来自原始需求输入）；AI 推断补全的内容标注 ≈推断；取不到的真实业务信息（字段枚举、接口、权限等）标注 ⚠️待确认。严禁编造业务名词、字段、接口、权限。",
    "3. 缺口处理：所有 ⚠️待确认 项必须在文末「待确认项」集中汇总列出（编号 + 缺什么 + 建议来源）。",
    "4. 复用优先：功能方案涉及前端组件/Hook 时，标注应复用的团队公共能力（搜索/表单/弹窗/表格/树/图表/useRequest 等），禁止默认重复造轮子。",
    "5. 输出骨架：严格按下面 PRD-SPEC 模板的固定小节输出；不适用的小节保留标题并注明「本需求不涉及」。",
    "",
    "## 元素检查清单",
    "- A1 需求背景与目标（必备）；A2 目标用户/角色（必备）；A3 范围 In/Out-scope（必备）",
    "- B1 功能拆解：触发条件/输入/处理逻辑/输出，按功能点展开（必备）；B2 优先级 P0/P1/P2（条件必备：功能点≥2）",
    "- C1 业务流程（条件必备：多角色协作或多状态流转，用 mermaid）；C2 交互逻辑（条件必备：存在界面/操作）；C3 页面说明（条件必备：存在界面）",
    "- D1 字段规则（条件必备：涉及表单/存储/接口）；D2 业务规则/计算逻辑（条件必备：存在计算/匹配）；D3 状态机（条件必备：存在状态流转）",
    "- E1 边界条件（必备：极值/空值/并发/权限）；E2 异常场景与容错（必备）；E3 兼容性（可选：涉及历史数据/迁移）",
    "- F1 性能（条件必备：高并发/大数据量/首屏敏感）；F2 安全/权限/隐私（条件必备：涉及用户数据/支付）；F3 埋点/数据统计（条件必备：有数据分析诉求）",
    "- G1 验收标准/测试要点（条件必备：存在明确功能点，每功能点给完成定义与关键用例，可自动验证优先）；G2 依赖与约束（条件必备：依赖上下游/排期）",
    "",
    "## PRD-SPEC 输出模板骨架",
    "```",
    "# PRD-SPEC-<slug>",
    "",
    "> 状态：草稿 ｜ 版本：v1.0 ｜ 需求 slug：<slug>",
    "> 负责人：@产品    上游：需求来源",
    "",
    "## 1. 需求背景与目标",
    "- 背景：为什么做？（业务痛点/数据驱动点）",
    "- 目标：可量化的目标",
    "",
    "## 2. 用户与场景",
    "- 使用角色：",
    "- 核心场景：",
    "",
    "## 3. 功能需求（按优先级 P0/P1/P2）",
    "### F1. <功能名>（P0）",
    "- 描述：",
    "- 交互说明：",
    "- 边界条件：",
    "",
    "## 4. 非功能需求",
    "- 性能：",
    "- 兼容性：",
    "- 权限：",
    "",
    "## 5. 数据与埋点",
    "- 数据来源：",
    "- 埋点事件：",
    "",
    "## 6. 验收标准（★ 可自动验证）",
    "- [ ] 功能用例清单（正常/边界/异常 3 类，可转测试用例）",
    "- [ ] 性能指标可测量",
    "",
    "---",
    "",
    "## ⚠️ 待确认项汇总",
    "| # | 所属元素 | 缺什么 | 建议来源 |",
    "| --- | --- | --- | --- |",
    "```",
    "",
    "## 输出要求",
    "- 语言：中文；代码/接口/字段名保留英文。",
    "- 推断内容必须显式标注 ≈推断，已确认内容不标注；取不到的真实信息标注 ⚠️待确认，不得编造。",
    "- 只输出 PRD-SPEC 正文，不要额外解释。",
  ].join("\n");

  var TESTPLAN_SYSTEM_PROMPT = [
    "你是一名测试工程师。基于给定的 PRD-SPEC 中的验收标准与功能需求，生成一份可直接执行的测试用例清单。",
    "",
    "## 输出格式（Markdown）",
    "```",
    "# 测试计划-<slug>",
    "",
    "## 测试范围",
    "- 覆盖的功能点：",
    "",
    "## 测试用例清单",
    "| 用例ID | 用例名称 | 优先级 | 前置条件 | 测试步骤 | 预期结果 | 类型 |",
    "| --- | --- | --- | --- | --- | --- | --- |",
    "| TC-001 | <名称> | P0/P1/P2 | <前置> | 1. xxx<br>2. xxx | <预期> | 正常/边界/异常 |",
    "",
    "## 关键用例说明",
    "- 正常用例：",
    "- 边界用例：",
    "- 异常用例：",
    "```",
    "",
    "## 要求",
    "- 用例必须覆盖：正常、边界、异常三类，从 PRD-SPEC 的验收标准和边界条件逐条导出。",
    "- 每条用例：用例ID（TC-001 递增）、名称、优先级、前置条件、测试步骤、预期结果、类型。",
    "- 不得编造规格中不存在的功能；无法覆盖的验收标准标注 ⚠️待确认。",
    "- 只输出测试计划正文，不要额外解释。",
  ].join("\n");

  /* ---------- localStorage 读写 ---------- */

  function loadConfig() {
    try {
      var raw = localStorage.getItem(STORAGE_CONFIG);
      if (!raw) return Object.assign({}, DEFAULT_CONFIG);
      var parsed = JSON.parse(raw);
      return Object.assign({}, DEFAULT_CONFIG, parsed);
    } catch (e) {
      return Object.assign({}, DEFAULT_CONFIG);
    }
  }

  function persistConfig() {
    try {
      localStorage.setItem(STORAGE_CONFIG, JSON.stringify(state.config));
    } catch (e) {
      showToast("配置保存失败（可能超出配额）");
    }
  }

  function loadDocs() {
    try {
      var raw = localStorage.getItem(STORAGE_DOCS);
      if (!raw) return [];
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  function persistDocs() {
    try {
      localStorage.setItem(STORAGE_DOCS, JSON.stringify(state.docs));
    } catch (e) {
      showToast("文档保存失败（可能超出配额）");
    }
  }

  function loadActiveId() {
    try {
      return localStorage.getItem(STORAGE_ACTIVE);
    } catch (e) {
      return null;
    }
  }

  function persistActiveId() {
    try {
      if (state.activeId) localStorage.setItem(STORAGE_ACTIVE, state.activeId);
      else localStorage.removeItem(STORAGE_ACTIVE);
    } catch (e) {
      /* ignore */
    }
  }

  /* ---------- 工具函数 ---------- */

  function uid() {
    return "d" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function showToast(message, duration) {
    duration = duration == null ? 2600 : duration;
    els.toast.textContent = message;
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      els.toast.textContent = "";
    }, duration);
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function renderMarkdown(md) {
    if (window.marked && typeof window.marked.parse === "function") {
      try {
        return window.marked.parse(md || "");
      } catch (e) {
        return "<pre>" + escapeHtml(md || "") + "</pre>";
      }
    }
    // marked.js 未加载时降级为纯文本
    return "<pre>" + escapeHtml(md || "") + "</pre>";
  }

  function slugify(text) {
    var s = String(text || "").trim().toLowerCase();
    // 提取可用的 ascii 与中文
    var ascii = s.replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 24);
    if (ascii) return ascii;
    // 无 ascii：用中文前 8 字
    var cjk = String(text || "").trim().slice(0, 8);
    return cjk || "spec";
  }

  function nowStr() {
    var d = new Date();
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return (
      d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " +
      p(d.getHours()) + ":" + p(d.getMinutes())
    );
  }

  function fmtTime(ts) {
    var d = new Date(ts);
    var p = function (n) { return (n < 10 ? "0" : "") + n; };
    return (
      d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " +
      p(d.getHours()) + ":" + p(d.getMinutes())
    );
  }

  /* ---------- 待确认项提取 ---------- */

  function extractPendingQuestions(markdown) {
    var lines = String(markdown || "").split("\n");
    var seen = {};
    var questions = [];
    lines.forEach(function (line) {
      if (line.indexOf("⚠️待确认") === -1 && line.indexOf("待确认") === -1) return;
      var text = line
        .replace(/^\s*[\-*+]\s+/, "")
        .replace(/^\s*\d+\.\s+/, "")
        .replace(/^\s*\|\s*/, "")
        .replace(/\s*\|\s*$/, "")
        .replace(/^#{1,6}\s+/, "")
        .trim();
      // 表格行：取含"待确认"的单元格
      if (text.indexOf("|") !== -1) {
        var cells = line.split("|").map(function (c) { return c.trim(); });
        var hit = cells.filter(function (c) {
          return c.indexOf("待确认") !== -1 && c !== "缺什么" && c.indexOf("所属元素") === -1;
        });
        if (hit.length) text = hit[hit.length - 1];
      }
      if (!text || text.length < 3) return;
      if (text === "待确认项汇总" || text === "⚠️ 待确认项汇总") return;
      var key = text.replace(/\s+/g, "");
      if (seen[key]) return;
      seen[key] = true;
      questions.push({ id: uid(), question: text });
    });
    return questions.slice(0, 20);
  }

  /* ---------- API 调用（SSE 流式 + 降级） ---------- */

  function endpoint() {
    return String(state.config.baseURL || "").replace(/\/+$/, "") + "/chat/completions";
  }

  function headers() {
    var h = { "Content-Type": "application/json" };
    if (state.config.apiKey) h.Authorization = "Bearer " + state.config.apiKey;
    return h;
  }

  function isConfigured() {
    return !!(state.config.baseURL && state.config.model && state.config.apiKey);
  }

  /**
   * 调用 chat/completions。
   * @param {Array} messages [{role, content}]
   * @param {Function} onDelta 流式增量回调
   * @returns {Promise<string>} 完整文本
   */
  async function callChat(messages, onDelta) {
    var ctrl = new AbortController();
    state.abortController = ctrl;

    var tryStream = function () {
      return fetch(endpoint(), {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ model: state.config.model, messages: messages, stream: true }),
        signal: ctrl.signal,
      }).then(function (res) {
        if (!res.ok) {
          return res.text().then(function (t) {
            throw new Error("API 错误 " + res.status + "：" + t.slice(0, 300));
          });
        }
        if (!res.body || !res.body.getReader) throw new Error("当前环境不支持流式响应");
        return readSSE(res.body, onDelta);
      });
    };

    var tryJson = function () {
      return fetch(endpoint(), {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({ model: state.config.model, messages: messages, stream: false }),
        signal: ctrl.signal,
      }).then(function (res) {
        if (!res.ok) {
          return res.text().then(function (t) {
            throw new Error("API 错误 " + res.status + "：" + t.slice(0, 300));
          });
        }
        return res.json();
      }).then(function (json) {
        var content = json && json.choices && json.choices[0] && json.choices[0].message && json.choices[0].message.content;
        if (typeof content !== "string") throw new Error("接口响应缺少 choices[0].message.content");
        return content;
      });
    };

    try {
      return await tryStream();
    } catch (err) {
      if (ctrl.signal && ctrl.signal.aborted) throw err;
      // 流式不可用（SSE 解析失败 / 环境不支持）→ 降级普通 JSON 请求
      return tryJson();
    } finally {
      if (state.abortController === ctrl) state.abortController = null;
    }
  }

  function readSSE(body, onDelta) {
    return new Promise(function (resolve, reject) {
      var reader = body.getReader();
      var decoder = new TextDecoder("utf-8");
      var buffer = "";
      var full = "";

      function pump() {
        reader.read().then(function (result) {
          if (result.done) {
            processBuffer(true);
            if (!full) reject(new Error("流式响应为空"));
            else resolve(full);
            return;
          }
          buffer += decoder.decode(result.value, { stream: true });
          processBuffer(false);
          pump();
        }).catch(function (err) {
          reject(err);
        });
      }

      function processBuffer(isFinal) {
        var lines = buffer.split("\n");
        if (!isFinal) buffer = lines.pop();
        else buffer = "";
        lines.forEach(function (line) {
          var trimmed = line.trim();
          if (trimmed.startsWith("data:")) {
            var payload = trimmed.slice(5).trim();
            if (payload === "[DONE]") return;
            try {
              var json = JSON.parse(payload);
              var delta = json.choices && json.choices[0] && json.choices[0].delta && json.choices[0].delta.content;
              if (typeof delta === "string") {
                full += delta;
                if (onDelta) onDelta(delta);
              }
            } catch (e) {
              /* 忽略无法解析的块 */
            }
          }
        });
      }

      pump();
    });
  }

  function stopGenerating() {
    if (state.abortController) {
      try { state.abortController.abort(); } catch (e) { /* ignore */ }
    }
  }

  /* ---------- 生成流程 ---------- */

  function setGenerating(on) {
    state.generating = on;
    els.btnGenSpec.disabled = on;
    els.btnGenTestplan.disabled = on;
    els.btnContinue.disabled = on;
    els.btnStop.hidden = !on;
    if (on) {
      els.genStatus.textContent = "正在生成…（流式渲染中）";
      els.genStatus.classList.add("is-running");
    } else {
      els.genStatus.classList.remove("is-running");
    }
  }

  function requireConfig() {
    if (isConfigured()) return true;
    showToast("请先配置 API（右上角「API 设置」）", 3200);
    openSettings();
    return false;
  }

  async function generateSpec(extraContext) {
    if (!requireConfig()) return;
    var requirement = els.reqInput.value.trim();
    if (!requirement && !(state.activeId && state.activeDoc() && state.activeDoc().sourceRequirement)) {
      showToast("请先输入需求文本");
      return;
    }

    var source = requirement || (state.activeDoc() && state.activeDoc().sourceRequirement) || "";
    var userContent = "【需求文本】\n" + source;
    if (extraContext) userContent += "\n\n【补充确认】\n" + extraContext;

    setGenerating(true);
    var previewEl = els.preview;
    var rendered = "";

    try {
      var full = await callChat(
        [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: userContent }],
        function (delta) {
          rendered += delta;
          // 流式渲染预览（节流：每增量渲染，marked 对小片段足够快）
          previewEl.innerHTML = renderMarkdown(rendered);
          // 预渲染已完成部分，但保留待确认提取到收尾再做
        }
      );
      finalizeSpec(full, source, "generate");
    } catch (err) {
      if (err && err.name === "AbortError") {
        els.genStatus.textContent = "已停止生成。";
      } else {
        els.genStatus.textContent = "生成失败：" + (err && err.message ? err.message : String(err));
      }
      if (rendered) {
        previewEl.innerHTML = renderMarkdown(rendered);
      }
    } finally {
      setGenerating(false);
    }
  }

  async function continueImprove() {
    if (!requireConfig()) return;
    var doc = state.activeDoc();
    if (!doc) {
      showToast("请先生成或加载一份 Spec");
      return;
    }
    var answers = state.pendingQuestions
      .map(function (q, i) {
        var textarea = document.getElementById("answer-" + q.id);
        var val = textarea ? textarea.value.trim() : "";
        return (i + 1) + ". " + q.question + "\n   回答：" + (val || "（未明确，仍标 ⚠️待确认）");
      })
      .join("\n");

    setGenerating(true);
    var previewEl = els.preview;
    var rendered = "";

    try {
      var full = await callChat(
        [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: "【需求文本】\n" + doc.sourceRequirement + "\n\n【补充确认】\n" + answers },
        ],
        function (delta) {
          rendered += delta;
          previewEl.innerHTML = renderMarkdown(rendered);
        }
      );
      finalizeSpec(full, doc.sourceRequirement, "continue");
    } catch (err) {
      if (err && err.name === "AbortError") {
        els.genStatus.textContent = "已停止生成。";
      } else {
        els.genStatus.textContent = "继续完善失败：" + (err && err.message ? err.message : String(err));
      }
      if (rendered) previewEl.innerHTML = renderMarkdown(rendered);
    } finally {
      setGenerating(false);
    }
  }

  async function generateTestPlan() {
    if (!requireConfig()) return;
    var doc = state.activeDoc();
    if (!doc) {
      showToast("请先生成或加载一份 Spec");
      return;
    }
    setGenerating(true);
    var rendered = "";

    try {
      var full = await callChat(
        [
          { role: "system", content: TESTPLAN_SYSTEM_PROMPT },
          { role: "user", content: "基于以下 PRD-SPEC 生成测试计划：\n\n" + doc.markdown },
        ],
        function (delta) {
          rendered += delta;
          els.genStatus.textContent = "正在生成测试计划…（流式渲染中）";
        }
      );
      doc.testPlan = full;
      doc.updatedAt = Date.now();
      pushVersion(doc, "测试计划");
      persistDocs();
      renderDocList();
      showToast("测试计划已生成并保存");
    } catch (err) {
      if (err && err.name === "AbortError") {
        els.genStatus.textContent = "已停止生成。";
      } else {
        els.genStatus.textContent = "测试计划生成失败：" + (err && err.message ? err.message : String(err));
      }
    } finally {
      setGenerating(false);
      renderPreview();
    }
  }

  function finalizeSpec(markdown, sourceRequirement, action) {
    var doc = state.activeDoc();

    if (action === "generate") {
      // 生成新 Spec：若当前是空的新建文档则复用，否则创建新文档，避免覆盖旧文档
      if (!doc || doc.markdown.trim()) {
        var title = deriveTitle(sourceRequirement);
        doc = createDoc(sourceRequirement, title);
        state.docs.unshift(doc);
        state.activeId = doc.id;
        persistActiveId();
      }
    }
    // action === "continue"：更新当前文档

    doc.markdown = markdown;
    doc.sourceRequirement = sourceRequirement || doc.sourceRequirement;
    doc.updatedAt = Date.now();
    doc.status = doc.status === "final" ? "final" : "draft";
    pushVersion(doc, action === "continue" ? "继续完善" : "生成");
    persistDocs();

    // 提取待确认项
    var questions = extractPendingQuestions(markdown);
    state.pendingQuestions = questions;
    renderConfirmPanel(questions);
    renderDocList();
    renderActiveDoc();

    if (questions.length) {
      els.genStatus.textContent = "生成完成，发现 " + questions.length + " 个待确认项，请在上方回答后「继续完善」。";
    } else {
      els.genStatus.textContent = "生成完成，无待确认项。";
    }
  }

  function deriveTitle(requirement) {
    var first = String(requirement || "").split("\n").filter(function (l) { return l.trim(); })[0];
    if (first) return first.trim().slice(0, 40);
    return "未命名需求";
  }

  function createDoc(sourceRequirement, title) {
    var slug = slugify(title);
    return {
      id: uid(),
      slug: slug,
      title: title,
      markdown: "",
      sourceRequirement: sourceRequirement || "",
      status: "draft",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      versions: [],
      testPlan: "",
    };
  }

  function pushVersion(doc, label) {
    if (!doc) return;
    if (doc.markdown) {
      doc.versions.push({
        ts: Date.now(),
        label: label,
        title: doc.title,
        markdown: doc.markdown,
      });
    }
    if (doc.versions.length > MAX_HISTORY) {
      doc.versions = doc.versions.slice(doc.versions.length - MAX_HISTORY);
    }
  }

  /* ---------- 渲染 ---------- */

  function stateActiveDoc() {
    return state.docs.find(function (d) { return d.id === state.activeId; });
  }
  state.activeDoc = stateActiveDoc;

  function renderConnStatus() {
    if (isConfigured()) {
      els.connStatus.textContent = "API 已配置";
      els.connStatus.className = "conn-status is-configured";
    } else {
      els.connStatus.textContent = "API 未配置";
      els.connStatus.className = "conn-status is-missing";
    }
  }

  function renderDocList() {
    var keyword = (els.docSearch.value || "").trim().toLowerCase();
    var list = state.docs
      .filter(function (d) {
        if (!keyword) return true;
        return d.title.toLowerCase().indexOf(keyword) !== -1 || d.slug.indexOf(keyword) !== -1;
      })
      .sort(function (a, b) { return b.updatedAt - a.updatedAt; });

    els.docList.innerHTML = "";
    list.forEach(function (doc) {
      var li = document.createElement("li");
      li.className = "doc-item" + (doc.id === state.activeId ? " is-active" : "");
      li.dataset.id = doc.id;

      var title = document.createElement("h3");
      title.className = "doc-item__title";
      title.textContent = doc.title || "未命名";

      var meta = document.createElement("div");
      meta.className = "doc-item__meta";

      var status = document.createElement("span");
      status.className = "doc-item__status " + statusClass(doc.status);
      status.textContent = statusLabel(doc.status);

      var time = document.createElement("span");
      time.textContent = fmtTime(doc.updatedAt);

      meta.appendChild(status);
      meta.appendChild(time);
      li.appendChild(title);
      li.appendChild(meta);
      els.docList.appendChild(li);
    });

    els.docCount.textContent = state.docs.length + " 份文档";
  }

  function statusClass(s) {
    return s === "confirmed" ? "is-confirmed" : s === "final" ? "is-final" : "is-draft";
  }

  function statusLabel(s) {
    return s === "confirmed" ? "已确认" : s === "final" ? "已定版" : "草稿";
  }

  function renderActiveDoc() {
    var doc = state.activeDoc();
    if (!doc) {
      els.docTitle.value = "";
      els.docMeta.textContent = "";
      els.preview.innerHTML = "<p style='color:var(--text-muted)'>暂无文档。请在左侧输入需求，点击「生成 Spec」。</p>";
      els.editor.value = "";
      els.editor.hidden = true;
      els.preview.hidden = false;
      els.confirmPanel.hidden = true;
      els.historyPanel.hidden = true;
      els.btnModeEdit.textContent = "编辑";
      return;
    }

    els.docTitle.value = doc.title;
    els.docMeta.textContent =
      statusLabel(doc.status) + " · 更新于 " + fmtTime(doc.updatedAt) + " · 版本 x" + doc.versions.length;

    renderPreview();
    renderConfirmPanel(state.pendingQuestions);
  }

  function renderPreview() {
    var doc = state.activeDoc();
    if (!doc) return;
    var html = renderMarkdown(doc.markdown);
    if (doc.testPlan) {
      html += "<hr><h2>测试计划</h2>" + renderMarkdown(doc.testPlan);
    }
    els.preview.innerHTML = html;
  }

  function renderConfirmPanel(questions) {
    els.confirmList.innerHTML = "";
    if (!questions || !questions.length) {
      els.confirmPanel.hidden = true;
      return;
    }
    els.confirmPanel.hidden = false;
    questions.forEach(function (q) {
      var item = document.createElement("div");
      item.className = "confirm-item";

      var qEl = document.createElement("div");
      qEl.className = "confirm-item__q";
      qEl.textContent = q.question;

      var input = document.createElement("textarea");
      input.id = "answer-" + q.id;
      input.placeholder = "填写回答…（留空则保持 ⚠️待确认）";

      item.appendChild(qEl);
      item.appendChild(input);
      els.confirmList.appendChild(item);
    });
  }

  function renderHistory() {
    var doc = state.activeDoc();
    if (!doc) return;
    els.historyList.innerHTML = "";
    var versions = doc.versions.slice().reverse();
    versions.forEach(function (v, idx) {
      var li = document.createElement("li");
      li.className = "history-item";

      var meta = document.createElement("div");
      meta.className = "history-item__meta";
      var label = document.createElement("strong");
      label.textContent = (idx + 1) + ". " + (v.label || "版本");
      var time = document.createElement("div");
      time.textContent = fmtTime(v.ts);
      meta.appendChild(label);
      meta.appendChild(time);

      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn btn--sm btn--ghost";
      btn.textContent = "查看";
      btn.addEventListener("click", function () {
        showVersionSnapshot(v);
      });

      li.appendChild(meta);
      li.appendChild(btn);
      els.historyList.appendChild(li);
    });
    els.historyPanel.hidden = false;
  }

  function showVersionSnapshot(v) {
    var doc = state.activeDoc();
    if (!doc) return;
    // 历史查看强制切回预览模式
    if (state.mode !== "preview") setMode("preview");
    var html = renderMarkdown(v.markdown);
    if (v.testPlan) html += "<hr><h2>测试计划</h2>" + renderMarkdown(v.testPlan);
    // 临时显示快照，用 toast 提示可还原为当前编辑
    els.preview.innerHTML = html;
    state._snapshotMode = v;
    els.genStatus.textContent = "正在查看历史快照（" + fmtTime(v.ts) + "）。点击「导出」可下载该版本。";
    showToast("正在查看历史版本，可点击「导出」下载该版本");
  }

  /* ---------- 文档操作 ---------- */

  function newDoc() {
    var requirement = els.reqInput.value.trim();
    var title = requirement ? deriveTitle(requirement) : "未命名需求";
    var doc = createDoc(requirement, title);
    state.docs.unshift(doc);
    state.activeId = doc.id;
    state.pendingQuestions = [];
    persistDocs();
    persistActiveId();
    renderDocList();
    renderActiveDoc();
    showToast("已新建文档");
  }

  function saveCurrent() {
    var doc = state.activeDoc();
    if (!doc) return;
    doc.title = els.docTitle.value.trim() || doc.title;
    if (state.mode === "edit") {
      doc.markdown = els.editor.value;
    }
    doc.updatedAt = Date.now();
    persistDocs();
    renderDocList();
    renderActiveDoc();
    showToast("已保存");
  }

  function exportDoc() {
    var doc = state.activeDoc();
    if (!doc) return;
    var md = doc.markdown || "";

    // 若正在查看快照，导出快照
    if (state._snapshotMode) {
      md = state._snapshotMode.markdown;
    }

    var includeTest = doc.testPlan && !state._snapshotMode;
    var body = md;
    if (includeTest) body += "\n\n---\n\n# 测试计划\n\n" + doc.testPlan;

    var blob = new Blob([body], { type: "text/markdown;charset=utf-8" });
    var a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "PRD-SPEC-" + doc.slug + ".md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    showToast("已导出 PRD-SPEC-" + doc.slug + ".md");
  }

  function deleteActiveDoc() {
    var doc = state.activeDoc();
    if (!doc) return;
    if (!window.confirm("确认删除「" + doc.title + "」？此操作不可恢复。")) return;
    state.docs = state.docs.filter(function (d) { return d.id !== doc.id; });
    state.activeId = null;
    state.pendingQuestions = [];
    state._snapshotMode = null;
    persistDocs();
    persistActiveId();
    renderDocList();
    renderActiveDoc();
    showToast("已删除");
  }

  /* ---------- 设置 ---------- */

  function openSettings() {
    els.setBaseURL.value = state.config.baseURL;
    els.setModel.value = state.config.model;
    els.setApiKey.value = state.config.apiKey;
    els.settingsModal.hidden = false;
    els.testResult.textContent = "";
    els.setApiKey.focus();
  }

  function closeSettings() {
    els.settingsModal.hidden = true;
  }

  function saveSettings() {
    state.config.baseURL = (els.setBaseURL.value || "").trim() || DEFAULT_CONFIG.baseURL;
    state.config.model = (els.setModel.value || "").trim() || DEFAULT_CONFIG.model;
    state.config.apiKey = (els.setApiKey.value || "").trim();
    persistConfig();
    renderConnStatus();
    closeSettings();
    showToast("API 设置已保存");
  }

  async function testConnection() {
    els.testResult.textContent = "测试中…";
    var baseURL = (els.setBaseURL.value || "").trim();
    var model = (els.setModel.value || "").trim();
    var apiKey = (els.setApiKey.value || "").trim();
    if (!baseURL || !model || !apiKey) {
      els.testResult.textContent = "请完整填写 baseURL / model / apiKey";
      return;
    }
    try {
      var res = await fetch(String(baseURL).replace(/\/+$/, "") + "/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + apiKey,
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: "hi" }],
          max_tokens: 5,
          stream: false,
        }),
      });
      if (!res.ok) {
        var t = await res.text().catch(function () { return ""; });
        els.testResult.textContent = "连接失败（" + res.status + "）：" + t.slice(0, 160);
        return;
      }
      els.testResult.textContent = "连接成功 ✓";
    } catch (err) {
      els.testResult.textContent = "连接失败：" + (err && err.message ? err.message : String(err));
    }
  }

  /* ---------- 事件绑定 ---------- */

  function bindEvents() {
    els.btnSettings.addEventListener("click", openSettings);
    els.btnNewDoc.addEventListener("click", newDoc);

    els.docSearch.addEventListener("input", renderDocList);

    els.docList.addEventListener("click", function (e) {
      var item = e.target.closest(".doc-item");
      if (!item) return;
      if (state.mode === "edit") {
        var doc = state.activeDoc();
        if (doc && els.editor.value !== doc.markdown) {
          if (!window.confirm("当前编辑内容未保存，切换文档将丢失改动。继续？")) return;
        }
      }
      state.activeId = item.dataset.id;
      state.pendingQuestions = extractPendingQuestions(state.activeDoc() ? state.activeDoc().markdown : "");
      state._snapshotMode = null;
      persistActiveId();
      renderDocList();
      renderActiveDoc();
      renderConfirmPanel(state.pendingQuestions);
    });

    els.reqInput.addEventListener("input", function () {
      els.reqCount.textContent = els.reqInput.value.length + " 字";
    });

    els.btnGenSpec.addEventListener("click", function () { generateSpec(); });
    els.btnContinue.addEventListener("click", continueImprove);
    els.btnGenTestplan.addEventListener("click", generateTestPlan);
    els.btnStop.addEventListener("click", function () {
      stopGenerating();
      els.genStatus.textContent = "正在停止…";
    });

    // 预览 / 编辑切换
    document.querySelectorAll(".view-toggle__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var mode = btn.dataset.mode;
        document.querySelectorAll(".view-toggle__btn").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        setMode(mode);
      });
    });

    els.btnModeEdit.addEventListener("click", function () {
      setMode(state.mode === "edit" ? "preview" : "edit");
    });

    // 标题输入防抖保存
    var titleTimer = null;
    els.docTitle.addEventListener("input", function () {
      if (titleTimer) clearTimeout(titleTimer);
      titleTimer = setTimeout(function () {
        var doc = state.activeDoc();
        if (doc) {
          doc.title = els.docTitle.value.trim() || doc.title;
          doc.updatedAt = Date.now();
          persistDocs();
          renderDocList();
        }
      }, 500);
    });

    els.btnHistory.addEventListener("click", renderHistory);
    els.btnHistoryClose.addEventListener("click", function () {
      els.historyPanel.hidden = true;
      renderPreview();
      state._snapshotMode = null;
    });
    els.btnExport.addEventListener("click", exportDoc);
    els.btnDelete.addEventListener("click", deleteActiveDoc);

    // 编辑器修改即时反映预览（编辑模式）
    var editTimer = null;
    els.editor.addEventListener("input", function () {
      if (editTimer) clearTimeout(editTimer);
      editTimer = setTimeout(function () {
        var doc = state.activeDoc();
        if (doc && state.mode === "edit") {
          doc.markdown = els.editor.value;
          doc.updatedAt = Date.now();
          persistDocs();
          renderDocList();
        }
      }, 500);
    });

    // 设置弹窗
    document.querySelectorAll("[data-close-modal]").forEach(function (btn) {
      btn.addEventListener("click", closeSettings);
    });
    els.settingsModal.addEventListener("click", function (e) {
      if (e.target === els.settingsModal) closeSettings();
    });
    els.settingsForm.addEventListener("submit", function (e) {
      e.preventDefault();
      saveSettings();
    });
    els.btnTestConn.addEventListener("click", testConnection);

    // 键盘：Ctrl/Cmd+S 保存；Esc 关闭弹窗
    document.addEventListener("keydown", function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault();
        saveCurrent();
      }
      if (e.key === "Escape" && !els.settingsModal.hidden) {
        closeSettings();
      }
    });
  }

  function setMode(mode) {
    state.mode = mode;
    var doc = state.activeDoc();
    if (mode === "edit") {
      if (doc) els.editor.value = doc.markdown;
      els.preview.hidden = true;
      els.editor.hidden = false;
      els.btnModeEdit.textContent = "预览";
      els.editor.focus();
    } else {
      els.preview.hidden = false;
      els.editor.hidden = true;
      els.btnModeEdit.textContent = "编辑";
      renderPreview();
      state._snapshotMode = null;
    }
  }

  /* ---------- 初始化 ---------- */

  function init() {
    bindEvents();
    renderConnStatus();
    renderDocList();

    // 恢复上次激活文档
    var activeId = loadActiveId();
    if (activeId && state.docs.some(function (d) { return d.id === activeId; })) {
      state.activeId = activeId;
      var doc = state.activeDoc();
      if (doc) {
        state.pendingQuestions = extractPendingQuestions(doc.markdown);
        renderActiveDoc();
        renderConfirmPanel(state.pendingQuestions);
        return;
      }
    }

    // 无文档 → 显示空态
    renderActiveDoc();
  }

  init();
})();
