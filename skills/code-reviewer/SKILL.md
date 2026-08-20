---
name: code-reviewer
description: "对 Vue3 + TypeScript + Element Plus + ECharts 的 ai-kit 体系代码变更执行规范化审查并生成 Markdown 报告。基于 AICoding 自有资产（.cursor/rules/ 与 src/ai-kit/）逐条机械判定，输出 PASS / FAIL / CONDITIONAL 决策。当代码变更需要正式审查、PR/MR 提交前质量检查、或需要检查是否复用了 ai-kit 时使用。"
---

# Code Reviewer（代码审查 Skill）

对代码变更执行规范审查，产出 **Markdown 报告**。核心机制：输入 git diff → 规则库扫描 → PASS / FAIL / CONDITIONAL 决策 → 产出审查结论。

## 定位与边界

- **输入**：代码变更（git diff / 文件列表 / 整个目录）+ 设计文档引用（PRD-SPEC / HLD / LLD，可选）
- **输出**：Markdown 审查报告（变更范围 + 命中规则 + 缺陷列表 + 决策结论）
- **决策**：PASS（Error=0）/ FAIL（Error>0）/ CONDITIONAL（仅 Warning，Error=0 且 Warning>0）
- **不职责**：不修改代码（只审查）；不做编码过程即时反馈
- **技术栈**：Vue3 + TypeScript + Element Plus + ECharts + Pinia + Vite（ai-kit 体系）

## 资产结构

| 文件 | 作用 | 何时读取 |
|------|------|----------|
| spec/rule-library.md | TS/Vue 规则库：编号 + 触发条件 + 判定标准 | Step2-4 |
| spec/report-structure.md | Markdown 报告模板：变更范围 / 命中规则 / 缺陷列表 / 决策 | Step7 渲染 |

规则来源全部来自 AICoding 自有资产（`.cursor/rules/` 与 `src/ai-kit/`），不引入任何外部项目内部信息。

## 执行流程（8 步）

```
- [ ] Step1  加载输入：读取代码变更范围 + 设计文档路径（可选）
- [ ] Step2  加载规则库：读取 spec/rule-library.md
- [ ] Step3  路由代码类型：*.vue / *.ts / *.tsx → 对应规则集
- [ ] Step4  逐规则扫描：检查触发条件是否命中，命中则记录缺陷（规则ID/文件/行号/问题/建议）
- [ ] Step5  ai-kit 复用检查：扫描重复封装 ai-kit 已有能力
- [ ] Step6  聚合分类：按严重程度 Error/Warning/Info 分组
- [ ] Step7  渲染 Markdown 报告：按 report-structure.md 模板输出
- [ ] Step8  输出决策：PASS/FAIL/CONDITIONAL
```

### Step1 加载输入
- **动作**：识别所有涉及代码文件；若提供设计文档（PRD-SPEC/HLD/LLD），记录设计引用点
- **判据**：代码文件列表确定

### Step2 加载规则库
- **动作**：读取 spec/rule-library.md；按代码类型加载对应规则
- **判据**：规则库完整加载

### Step3 路由代码类型
- **动作**：按文件扩展名分类 — `*.vue` 触发 Vue 组件规则；`*.ts` 触发 TypeScript/Hook 规则；`*.tsx` 触发 TSX 规则
- **判据**：每个文件已路由到正确规则集

### Step4 逐规则扫描
- **动作**：对每条规则执行触发条件检查；命中则记录缺陷
- **判据**：所有规则已逐项检查

### Step5 ai-kit 复用检查
- **动作**：对照 `src/ai-kit/` 资产清单，检查是否出现 ai-kit 已覆盖能力的重复封装（详见 rule-library.md AK 系列规则）
- **判据**：复用检查已完成

### Step6 聚合分类
- **动作**：按严重程度分组；统计数量
- **判据**：分类完整

### Step7 渲染报告
- **动作**：按 spec/report-structure.md 模板输出 Markdown 报告
- **判据**：报告生成完成

### Step8 输出决策
- **动作**：Error=0 → PASS / Error>0 → FAIL / 仅 Warning → CONDITIONAL
- **输出**：决策 + 报告内容

## 触发条件

当以下任一条件满足时使用本 Skill：
1. 编码任务完成后需要正式代码审查
2. PR/MR 提交前的质量检查
3. 需要检查是否复用了 ai-kit
4. 用户明确要求对代码进行 review

## 使用方式

| 命令 | 范围 | 适用规则集 |
|------|------|----------|
| review 当前 diff | git diff | 全量规则 |
| review src/views/xxx/ | 指定目录 | 全量规则 |
| review *.ts 文件 | 指定文件 | TypeScript/Hook 规则 |
| review 弹窗相关 | 指定功能 | Dialog/Drawer/Form 规则 |

## 降级策略

- 设计文档不可用：跳过设计对齐，仅做规范检查
- 代码范围过大（>100 文件）：提示用户缩小范围或分批执行
- 规则文件不可读：降级为仅执行基础检查

## 关键原则

- **规则驱动**：所有判定基于明确规则，不做主观评价
- **复用优先**：凡 ai-kit 已有能力，重复封装一律记为 Error
- **可追溯**：每条缺陷标注规则来源，便于复核
- **机械判定**：每条规则有明确触发条件与判定标准，不臆断
