# CR 报告结构定义（Markdown）

> 审查报告使用 **Markdown** 输出，不使用 HTML。报告严格按以下六段结构渲染，覆盖：变更范围、命中规则、缺陷列表（文件 + 行号 + 问题 + 建议）、决策结论。

## 整体结构（六段）

| 段 | 名称 | 内容 |
|----|------|------|
| L1 | 决策结论 | 最终决策（PASS / FAIL / CONDITIONAL）+ 摘要 |
| L2 | 变更范围 | 本次审查覆盖的文件列表、改动规模 |
| L3 | 统计概览 | Error / Warning / Info 数量，扫描文件数，应用规则数 |
| L4 | 命中规则 | 命中的规则明细（按严重程度分组） |
| L5 | 缺陷列表 | 每条缺陷：文件 + 行号 + 问题 + 建议 |
| L6 | 审查追踪 | 元信息（时间 / 分支 / 提交 / 审查者 / 规则来源） |

---

## 模板

```markdown
# Code Review 报告

## 1. 决策结论

> **{{ decision }}** — {{ decision_reason }}

| 指标 | 值 |
|------|-----|
| Error | {{ error_count }} |
| Warning | {{ warning_count }} |
| Info | {{ info_count }} |
| 扫描文件 | {{ files_scanned }} |
| 应用规则 | {{ rules_applied }} |

## 2. 变更范围

| 文件 | 类型 | 变更行数 | 涉及规则集 |
|------|------|---------|-----------|
| {{ file_path }} | {{ .vue / .ts / .tsx }} | {{ +n / -m }} | {{ 分组 }} |

> 未变更 / 关联文件的消费方（如有）在此列出。

## 3. 统计概览

- Error：{{ error_count }} 项
- Warning：{{ warning_count }} 项
- Info：{{ info_count }} 项

## 4. 命中规则

### Error（{{ error_count }} 项）

| 规则 | 文件 | 行号 | 说明 |
|------|------|------|------|
| {{ rule_id }} | {{ file }} | {{ line }} | {{ description }} |

### Warning（{{ warning_count }} 项）

| 规则 | 文件 | 行号 | 说明 |
|------|------|------|------|
| {{ rule_id }} | {{ file }} | {{ line }} | {{ description }} |

### Info（{{ info_count }} 项）

| 规则 | 文件 | 行号 | 说明 |
|------|------|------|------|
| {{ rule_id }} | {{ file }} | {{ line }} | {{ description }} |

## 5. 缺陷列表

### {{ severity }} {{ rule_id }}：{{ title }}

- **位置**：`{{ file_path }}:{{ line }}`
- **问题**：{{ problem }}
- **建议**：{{ suggestion }}
- **优先级**：{{ High / Medium / Low }}

```ts
// 问题代码
{{ code_before }}
```

```ts
// 建议代码
{{ code_after }}
```

（按缺陷逐条重复以上小节）

## 6. 审查追踪

| 属性 | 值 |
|------|-----|
| 审查时间 | {{ ISO 8601 }} |
| 分支 | {{ branch }} |
| 提交 | {{ commit }} |
| 审查者 | code-reviewer (AI Skill) |
| 规则来源 | AICoding 资产（.cursor/rules/、src/ai-kit/） |
```

---

## 渲染规则

1. **决策结论**：PASS / FAIL / CONDITIONAL 必须大写在 L1 首行。
   - `PASS`：Error=0 且 Warning=0
   - `CONDITIONAL`：Error=0 且 Warning>0
   - `FAIL`：Error>0
2. **变更范围**：逐一列出审查文件；有设计文档引用时附加"设计对齐说明"小节。
3. **缺陷列表**：每条缺陷必须包含 文件 + 行号 + 问题 + 建议 四项；缺一行号时用"全局"标注。
4. **代码片段**：问题代码 / 建议代码用 Markdown 代码块（```），标注语言（ts/vue）。
5. **优先级**：Error 规则关联 High，Warning 规则关联 Medium，Info 规则关联 Low。
6. **路径写法**：项目相对路径（`src/views/xxx.vue`），不用绝对路径。
7. **规则来源**：每条缺陷标注规则 ID（如 AK-01 / TS-01），可在报告中引用规则库定位。

---

## 决策判定表

| 条件 | 决策 |
|------|------|
| Error = 0, Warning = 0 | **PASS** |
| Error = 0, Warning > 0 | **CONDITIONAL** |
| Error > 0 | **FAIL** |

> 决策由 Step8 依据统计结果机械判定，不加入主观因素。
