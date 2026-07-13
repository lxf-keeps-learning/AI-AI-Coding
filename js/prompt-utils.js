/** Prompt Lab 可复用纯函数（浏览器与 Node 测试共用）。 */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.PromptUtils = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function extractUniqueVarNames(text) {
    var seen = Object.create(null);
    var names = [];
    var regex = /\{\{([^}]+)\}\}/g;
    var match;
    while ((match = regex.exec(text)) !== null) {
      var name = match[1].trim();
      if (!name || seen[name]) continue;
      seen[name] = true;
      names.push(name);
    }
    return names;
  }

  function replaceVariables(text, values) {
    return text.replace(/\{\{([^}]+)\}\}/g, function (_, inner) {
      var key = inner.trim();
      return Object.prototype.hasOwnProperty.call(values, key) ? values[key] : "{{" + key + "}}";
    });
  }

  function formatPrompt(text) {
    var normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
    normalized = normalized
      .split("\n")
      .map(function (line) {
        return line.replace(/[ \t]+$/g, "");
      })
      .join("\n");
    return normalized.replace(/\n{4,}/g, "\n\n\n").trim() + "\n";
  }

  function sanitizeHistory(value) {
    if (!Array.isArray(value)) return [];
    return value.filter(function (item) {
      return (
        item &&
        typeof item.id === "string" &&
        typeof item.ts === "number" &&
        Number.isFinite(item.ts) &&
        typeof item.content === "string"
      );
    });
  }

  return {
    extractUniqueVarNames: extractUniqueVarNames,
    replaceVariables: replaceVariables,
    formatPrompt: formatPrompt,
    sanitizeHistory: sanitizeHistory,
  };
});
