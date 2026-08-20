/**
 * Prompts 可视化：按 manifest 加载 ../prompts/*.md 同目录下文件
 * 需通过静态服务打开（如仓库根目录 npx serve . 后访问 /prompts/viewer.html）
 */
(function () {
  "use strict";

  var manifest = [
    {
      group: "索引与说明",
      items: [
        { path: "readme.md", title: "Prompts 总索引", desc: "目录结构、快速索引、组件快查" },
      ],
    },
    {
      group: "列表 / 表格",
      items: [
        { path: "table/readme.md", title: "表格说明", desc: "" },
        { path: "table/crud-table.md", title: "CRUD 列表页", desc: "增删改查列表（最常用）" },
      ],
    },
    {
      group: "组件",
      items: [
        { path: "components/readme.md", title: "组件说明", desc: "" },
        { path: "components/dialog.md", title: "弹窗 Dialog", desc: "新增 / 编辑" },
        { path: "components/drawer.md", title: "抽屉 Drawer", desc: "详情、步骤流程" },
      ],
    },
    {
      group: "表单",
      items: [
        { path: "forms/readme.md", title: "表单说明", desc: "" },
        { path: "forms/form.md", title: "基础 / 动态 / 步骤表单", desc: "" },
        { path: "forms/dynamic-form.md", title: "动态表单", desc: "" },
      ],
    },
    {
      group: "树",
      items: [
        { path: "tree/readme.md", title: "树说明", desc: "" },
        { path: "tree/tree.md", title: "基础树", desc: "左树右表等" },
        { path: "tree/lazy-tree.md", title: "懒加载树", desc: "大数据量" },
      ],
    },
    {
      group: "搜索",
      items: [
        { path: "search/readme.md", title: "搜索说明", desc: "" },
        { path: "search/base-search.md", title: "基础搜索", desc: "" },
      ],
    },
    {
      group: "图表",
      items: [
        { path: "charts/readme.md", title: "图表说明", desc: "" },
        { path: "charts/chart.md", title: "通用图表", desc: "折线 / 柱 / 饼 / 组合" },
        { path: "charts/line-chart.md", title: "折线图", desc: "" },
        { path: "charts/bar-chart.md", title: "柱状图", desc: "" },
        { path: "charts/pie-chart.md", title: "饼图", desc: "" },
        { path: "charts/scatter-chart.md", title: "散点图", desc: "" },
        { path: "charts/radar-chart.md", title: "雷达图", desc: "" },
        { path: "charts/gauge-chart.md", title: "仪表盘", desc: "" },
        { path: "charts/bigscreen-chart.md", title: "大屏图表", desc: "" },
      ],
    },
    {
      group: "Hooks",
      items: [
        { path: "hooks/readme.md", title: "Hooks 说明", desc: "" },
        { path: "hooks/use-request.md", title: "useRequest", desc: "请求封装" },
      ],
    },
    {
      group: "页面",
      items: [{ path: "pages/readme.md", title: "页面说明", desc: "" }, { path: "pages/list-page.md", title: "列表页", desc: "" }],
    },
    {
      group: "Review",
      items: [
        { path: "review/readme.md", title: "Review 说明", desc: "" },
        { path: "review/review.md", title: "Code Review", desc: "" },
      ],
    },
    {
      group: "性能",
      items: [
        { path: "performance/readme.md", title: "性能说明", desc: "" },
        { path: "performance/large-data.md", title: "大数据优化", desc: "" },
      ],
    },
    {
      group: "Git",
      items: [
        { path: "git/readme.md", title: "Git 说明", desc: "" },
        { path: "git/commit.md", title: "提交信息", desc: "" },
      ],
    },
    {
      group: "重构",
      items: [
        { path: "refactor/readme.md", title: "重构说明", desc: "" },
        { path: "refactor/component.md", title: "组件重构", desc: "" },
      ],
    },
    {
      group: "文档",
      items: [{ path: "docs/line-chart.md", title: "折线图文档", desc: "" }],
    },
  ];

  var navEl = document.getElementById("nav");
  var pathEl = document.getElementById("current-path");
  var mdEl = document.getElementById("md-body");
  var errEl = document.getElementById("error");
  var btnCopy = document.getElementById("btn-copy");
  var rawText = "";

  var activeBtn = null;

  function resolveUrl(path) {
    var base = document.querySelector("base");
    var href = base && base.href ? base.href : window.location.href;
    try {
      return new URL(path, href).toString();
    } catch (e) {
      return path;
    }
  }

  function renderNav() {
    manifest.forEach(function (g) {
      var wrap = document.createElement("div");
      wrap.className = "nav-group";
      var t = document.createElement("div");
      t.className = "nav-group__title";
      t.textContent = g.group;
      wrap.appendChild(t);
      g.items.forEach(function (item) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "nav-item";
        btn.dataset.path = item.path;
        var label = document.createElement("span");
        label.textContent = item.title;
        btn.appendChild(label);
        if (item.desc) {
          var sm = document.createElement("small");
          sm.textContent = item.desc;
          btn.appendChild(sm);
        }
        btn.addEventListener("click", function () {
          if (activeBtn) activeBtn.classList.remove("is-active");
          btn.classList.add("is-active");
          activeBtn = btn;
          loadFile(item.path);
        });
        wrap.appendChild(btn);
      });
      navEl.appendChild(wrap);
    });
  }

  function showError(msg, detail) {
    errEl.classList.remove("hidden");
    mdEl.innerHTML = "";
    errEl.innerHTML = "<strong>" + msg + "</strong>";
    if (detail) {
      var c = document.createElement("code");
      c.textContent = detail;
      errEl.appendChild(c);
    }
  }

  function hideError() {
    errEl.classList.add("hidden");
    errEl.innerHTML = "";
  }

  function loadFile(path) {
    pathEl.textContent = "prompts/" + path;
    hideError();
    mdEl.innerHTML = '<p style="color:#8b949e">加载中…</p>';
    var url = resolveUrl(path);
    fetch(url, { cache: "no-store" })
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.text();
      })
      .then(function (text) {
        rawText = text;
        if (typeof marked !== "undefined" && marked.parse) {
          mdEl.innerHTML = marked.parse(text, { mangle: false, headerIds: false });
        } else {
          mdEl.innerHTML = "<pre>" + escapeHtml(text) + "</pre>";
        }
      })
      .catch(function (e) {
        rawText = "";
        showError(
          "无法加载该文件。若直接双击打开 HTML，浏览器会拦截本地文件请求。",
          "请在仓库根目录执行: npx serve .  然后打开 /prompts/viewer.html\n原因: " + (e && e.message ? e.message : String(e))
        );
      });
  }

  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  btnCopy.addEventListener("click", function () {
    if (!rawText) return;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(rawText).then(function () {
        btnCopy.textContent = "已复制";
        setTimeout(function () {
          btnCopy.textContent = "复制 Markdown";
        }, 1600);
      });
    } else {
      var ta = document.createElement("textarea");
      ta.value = rawText;
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand("copy");
        btnCopy.textContent = "已复制";
        setTimeout(function () {
          btnCopy.textContent = "复制 Markdown";
        }, 1600);
      } catch (err) {}
      document.body.removeChild(ta);
    }
  });

  renderNav();
  var first = manifest[0] && manifest[0].items && manifest[0].items[0];
  if (first) {
    var firstBtn = navEl.querySelector('.nav-item[data-path="' + first.path + '"]');
    if (firstBtn) {
      firstBtn.classList.add("is-active");
      activeBtn = firstBtn;
    }
    loadFile(first.path);
  }
})();
