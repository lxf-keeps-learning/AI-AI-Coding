# Code Review 提示词

> 参考规则：`.cursor/rules/review/code-review.mdc`（完整规则库见 `skills/code-reviewer/spec/rule-library.md`）
> 本 Prompt 是规则工作流，没有运行时 ai-kit 依赖。

---

## 场景一：git diff 规范化审查

```
Review 当前代码变更（git diff / PR）：

检查维度：
  1. 规范符合：是否符合 .cursor/rules（组件、表单、搜索、表格、图表、Hook、性能）
  2. 重复代码：是否重复封装 ai-kit 已有能力（useRequest/useTable/useDialog/useSearch）
  3. 性能：是否存在不必要深层响应式、模板内复杂计算、未清理的定时器/事件
  4. 内存泄漏：组件卸载是否 dispose 图表、清理监听、取消请求
  5. TypeScript：是否出现 any / 隐式 any，类型是否完整
  6. 安全性：是否存在 XSS 风险（v-html 输入）、敏感信息硬编码

输出格式：
  - 变更范围
  - 命中规则（来源 + 文件:行号 + 严重级别 + 修复建议）
  - 缺陷列表（按 Error / Warning 分类）
  - 结论：PASS / FAIL / CONDITIONAL（有 Error 即 FAIL）
  不改代码，只出报告。
```

## 场景二：PR 提交前自检

```
请作为 Code Reviewer 对本次提交做提交前自检：
  - 是否有遗漏的删除确认、异常处理、空状态
  - 是否滥用 v-html / innerHTML
  - 是否引入未使用依赖或死代码
  - 是否破坏既有页面（列表刷新、表单重置）
  - 是否遵循 页面 <= 500 行 限制
  输出一份简短自检清单，标注需要修复的项。
```

## 场景三：针对某类问题的专项审查

```
只审查以下问题的代码变更：
  - 内存泄漏（定时器、事件监听、图表 dispose、请求取消）
  - ECharts 使用是否规范（禁止裸 el-chart / 裸 echarts.init，必须 BaseChart + useChart）
  - 表单校验与提交竞态
  对命中项给 文件:行号 + 具体修复动作 + 验收标准。
```

---

## 通用注意事项

- 只审查不改代码；修改需要用户确认
- 每条建议必须给 文件:行号 + 具体动作 + 验收标准，不写没有抓手的话
- 重复封装 ai-kit 能力一律记为 Error，不是建议
