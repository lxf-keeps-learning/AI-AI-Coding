/**
 * Prompt Lab — 提示词工作台
 * 模板插入、{{}} 替换、格式化、复制、localStorage 历史
 */

(function () {
  "use strict";

  var STORAGE_KEY = "prompt-lab-history-v1";
  var MAX_HISTORY = 50;

  var editor = document.getElementById("prompt-editor");
  var charCount = document.getElementById("char-count");
  var varListEl = document.getElementById("var-list");
  var templateListEl = document.getElementById("template-list");
  var historyListEl = document.getElementById("history-list");
  var toastEl = document.getElementById("toast");
  var btnApplyVars = document.getElementById("btn-apply-vars");

  var varPlaceholders = {}; // name -> last input value
  var toastTimer = null;

  var TEMPLATES = [
    {
      id: "role",
      title: "角色与任务",
      desc: "明确身份、目标与输出要求",
      body:
        "你是 {{角色}}，擅长 {{领域}}。\n\n任务：{{任务描述}}\n\n要求：\n1. {{要求1}}\n2. {{要求2}}\n\n输出格式：{{格式说明}}\n",
    },
    {
      id: "cot",
      title: "分步推理（CoT）",
      desc: "请逐步思考再给出结论",
      body:
        "在回答前，请按以下步骤思考（思考过程请用简洁条目列出）：\n1. 理解问题与约束\n2. 列出已知信息与假设\n3. 推导或比较方案\n4. 给出最终结论与依据\n\n问题：\n{{问题}}\n",
    },
    {
      id: "json",
      title: "严格 JSON 输出",
      desc: "仅输出可解析 JSON，无 Markdown",
      body:
        "请只输出一个合法的 JSON 对象，不要包含 Markdown 代码块或任何解释文字。\n\nJSON Schema 思路：\n{\n  \"字段1\": \"类型说明\",\n  \"字段2\": []\n}\n\n用户输入：\n{{用户输入}}\n",
    },
    {
      id: "fewshot",
      title: "少样本示例",
      desc: "示例 + 待分类/待生成内容",
      body:
        "根据以下示例完成同类任务。\n\n示例 1：\n输入：{{示例1输入}}\n输出：{{示例1输出}}\n\n示例 2：\n输入：{{示例2输入}}\n输出：{{示例2输出}}\n\n现在请处理：\n输入：{{待处理输入}}\n输出：\n",
    },
    {
      id: "code-review",
      title: "代码审查",
      desc: "语言、关注点、代码块",
      body:
        "你是资深 {{语言}} 开发者。请审查以下代码，从可读性、边界情况、性能、安全方面给出意见，并标出严重问题。\n\n```{{语言}}\n{{代码}}\n```\n",
    },
    {
      id: "summarize",
      title: "摘要与要点",
      desc: "长文压缩与条列",
      body:
        "请将下文总结为：\n- 3～5 条要点（条列）\n- 一段 2～3 句的简短摘要\n\n原文：\n{{长文}}\n",
    },
    {
      id: "translate",
      title: "翻译润色",
      desc: "目标语言与风格",
      body:
        "将以下内容翻译为 {{目标语言}}，风格：{{风格}}（如：正式 / 口语 / 技术文档）。保持术语一致，必要时在括号内保留原文专有名词。\n\n原文：\n{{原文}}\n",
    },
    {
      id: "constraint",
      title: "硬约束清单",
      desc: "禁止项与必须项",
      body:
        "必须遵守：\n- {{必须1}}\n- {{必须2}}\n\n禁止：\n- {{禁止1}}\n- {{禁止2}}\n\n在以上约束下完成任务：\n{{任务}}\n",
    },
  ];

  function showToast(message, duration) {
    duration = duration == null ? 2200 : duration;
    toastEl.textContent = message;
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.textContent = "";
      toastTimer = null;
    }, duration);
  }

  function updateCharCount() {
    var n = editor.value.length;
    charCount.textContent = n + " 字符";
  }

  function insertAtCursor(text) {
    var v = editor.value;
    var start = editor.selectionStart;
    var end = editor.selectionEnd;
    var focused = document.activeElement === editor;

    if (!focused || start == null || end == null) {
      editor.value = v + text;
      var len = editor.value.length;
      editor.selectionStart = editor.selectionEnd = len;
    } else {
      editor.value = v.slice(0, start) + text + v.slice(end);
      var pos = start + text.length;
      editor.selectionStart = editor.selectionEnd = pos;
    }
    editor.focus();
    updateCharCount();
  }

  /** 匹配 {{name}}，name 不含 } */
  var VAR_REGEX = /\{\{([^}]+)\}\}/g;

  function extractUniqueVarNames(text) {
    var seen = {};
    var names = [];
    var m;
    VAR_REGEX.lastIndex = 0;
    while ((m = VAR_REGEX.exec(text)) !== null) {
      var raw = m[1].trim();
      if (!raw || seen[raw]) continue;
      seen[raw] = true;
      names.push(raw);
    }
    return names;
  }

  function renderVarInputs(names) {
    varListEl.innerHTML = "";
    if (!names.length) {
      btnApplyVars.disabled = true;
      return;
    }
    names.forEach(function (name) {
      var row = document.createElement("div");
      row.className = "var-row";
      var inputId = "var-input-" + name.replace(/\W/g, "_");
      var label = document.createElement("label");
      label.setAttribute("for", inputId);
      label.textContent = "{{" + name + "}}";
      var input = document.createElement("input");
      input.type = "text";
      input.id = inputId;
      input.dataset.varName = name;
      input.placeholder = "替换值";
      input.value = varPlaceholders[name] || "";
      row.appendChild(label);
      row.appendChild(input);
      varListEl.appendChild(row);
    });
    btnApplyVars.disabled = false;
  }

  function scanVariables() {
    var names = extractUniqueVarNames(editor.value);
    renderVarInputs(names);
    if (!names.length) {
      showToast("未检测到 {{变量}}");
    } else {
      showToast("已发现 " + names.length + " 个变量");
    }
  }

  function collectVarValues() {
    var map = {};
    varListEl.querySelectorAll("input[data-var-name]").forEach(function (input) {
      var n = input.dataset.varName;
      map[n] = input.value;
      varPlaceholders[n] = input.value;
    });
    return map;
  }

  function applyVariableReplacement() {
    var text = editor.value;
    var map = collectVarValues();
    var names = extractUniqueVarNames(text);
    if (!names.length) {
      showToast("请先扫描或输入含 {{}} 的内容");
      return;
    }
    var replaced = text.replace(/\{\{([^}]+)\}\}/g, function (_, inner) {
      var key = inner.trim();
      if (Object.prototype.hasOwnProperty.call(map, key)) {
        return map[key];
      }
      return "{{" + key + "}}";
    });
    editor.value = replaced;
    updateCharCount();
    renderVarInputs(extractUniqueVarNames(replaced));
    showToast("已替换到编辑区");
  }

  function formatPrompt() {
    var s = editor.value;
    if (!s.trim()) {
      showToast("内容为空");
      return;
    }
    s = s.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    s = s
      .split("\n")
      .map(function (line) {
        return line.replace(/[ \t]+$/g, "");
      })
      .join("\n");
    s = s.replace(/\n{4,}/g, "\n\n\n");
    s = s.trim() + "\n";
    editor.value = s;
    updateCharCount();
    showToast("已格式化");
  }

  function clearEditor() {
    if (!editor.value.trim()) {
      showToast("已是空内容");
      return;
    }
    if (window.confirm("确定清空编辑区？")) {
      editor.value = "";
      varListEl.innerHTML = "";
      btnApplyVars.disabled = true;
      updateCharCount();
      showToast("已清空");
    }
  }

  function copyToClipboard() {
    var t = editor.value;
    if (!t) {
      showToast("没有可复制内容");
      return;
    }
    function ok() {
      showToast("已复制到剪贴板");
    }
    function fail() {
      showToast("复制失败，请手动复制");
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(ok).catch(fail);
    } else {
      try {
        editor.select();
        document.execCommand("copy");
        ok();
      } catch (e) {
        fail();
      }
    }
  }

  function loadHistory() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      var arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveHistory(items) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      showToast("存储失败（可能超出配额）");
    }
  }

  function formatTime(ts) {
    var d = new Date(ts);
    var pad = function (n) {
      return (n < 10 ? "0" : "") + n;
    };
    return (
      d.getFullYear() +
      "-" +
      pad(d.getMonth() + 1) +
      "-" +
      pad(d.getDate()) +
      " " +
      pad(d.getHours()) +
      ":" +
      pad(d.getMinutes())
    );
  }

  function previewText(text, max) {
    max = max || 72;
    var one = text.replace(/\s+/g, " ").trim();
    if (one.length <= max) return one || "（空）";
    return one.slice(0, max) + "…";
  }

  function renderHistory() {
    var items = loadHistory();
    historyListEl.innerHTML = "";
    items.forEach(function (item) {
      var li = document.createElement("li");
      li.className = "history-item";
      var meta = document.createElement("div");
      meta.className = "history-item__meta";
      var time = document.createElement("div");
      time.className = "history-item__time";
      time.textContent = formatTime(item.ts);
      var prev = document.createElement("p");
      prev.className = "history-item__preview";
      prev.textContent = previewText(item.content);
      meta.appendChild(time);
      meta.appendChild(prev);
      var actions = document.createElement("div");
      actions.className = "history-item__actions";
      var btnLoad = document.createElement("button");
      btnLoad.type = "button";
      btnLoad.className = "btn btn--sm btn--accent";
      btnLoad.textContent = "恢复";
      btnLoad.addEventListener("click", function () {
        editor.value = item.content;
        updateCharCount();
        scanVariables();
        showToast("已从历史恢复");
      });
      var btnDel = document.createElement("button");
      btnDel.type = "button";
      btnDel.className = "btn btn--sm btn--ghost";
      btnDel.textContent = "删除";
      btnDel.addEventListener("click", function () {
        var next = loadHistory().filter(function (x) {
          return x.id !== item.id;
        });
        saveHistory(next);
        renderHistory();
        showToast("已删除该条");
      });
      actions.appendChild(btnLoad);
      actions.appendChild(btnDel);
      li.appendChild(meta);
      li.appendChild(actions);
      historyListEl.appendChild(li);
    });
  }

  function saveSnapshot() {
    var content = editor.value;
    if (!content.trim()) {
      showToast("请先输入内容再保存");
      return;
    }
    var items = loadHistory();
    items.unshift({
      id: "h-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9),
      ts: Date.now(),
      content: content,
    });
    if (items.length > MAX_HISTORY) {
      items = items.slice(0, MAX_HISTORY);
    }
    saveHistory(items);
    renderHistory();
    showToast("快照已保存");
  }

  function clearAllHistory() {
    if (!loadHistory().length) {
      showToast("暂无历史");
      return;
    }
    if (window.confirm("确定删除全部本地历史？")) {
      localStorage.removeItem(STORAGE_KEY);
      renderHistory();
      showToast("历史已清空");
    }
  }

  function renderTemplates() {
    templateListEl.innerHTML = "";
    TEMPLATES.forEach(function (tpl) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "template-btn";
      var strong = document.createElement("strong");
      strong.textContent = tpl.title;
      var span = document.createElement("span");
      span.textContent = tpl.desc;
      btn.appendChild(strong);
      btn.appendChild(span);
      btn.addEventListener("click", function () {
        insertAtCursor(tpl.body);
        showToast("已插入模板：" + tpl.title);
      });
      templateListEl.appendChild(btn);
    });
  }

  /* Events */
  editor.addEventListener("input", updateCharCount);
  document.getElementById("btn-scan-vars").addEventListener("click", scanVariables);
  btnApplyVars.addEventListener("click", applyVariableReplacement);
  document.getElementById("btn-format").addEventListener("click", formatPrompt);
  document.getElementById("btn-clear").addEventListener("click", clearEditor);
  document.getElementById("btn-copy").addEventListener("click", copyToClipboard);
  document.getElementById("btn-save-history").addEventListener("click", saveSnapshot);
  document.getElementById("btn-clear-history").addEventListener("click", clearAllHistory);

  /* Init */
  updateCharCount();
  renderTemplates();
  renderHistory();
})();
