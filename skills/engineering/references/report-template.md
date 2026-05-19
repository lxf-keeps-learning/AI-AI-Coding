# 工程化改造报告模板

> 输出文件名建议:`engineering-report-<日期>-<范围简写>.md`,例如 `engineering-report-20260519-device-pages.md`。

下面是完整模板。每一节都必须存在,即使内容为空也保留小标题并标注"无"。

---

````markdown
# 工程化改造报告 — <范围简写>

> 生成日期:YYYY-MM-DD
> ai-kit 版本对照:<git commit 或日期>
> 分析者:Claude / engineering skill

---

## 1. 范围与方法

**扫描范围**:
- src/views/xxx/
- src/views/yyy/
- (其它涉及目录)

**对照基线**:`src/ai-kit/readme.md` + `.cursor/rules/global/base.mdc`

**分析方法**:
- 逐文件读取
- 与 ai-kit 已有能力比对
- 重复度 + 稳定度双维度评分

---

## 2. 违反复用规范的清单(必须改,P0)

每条按下面格式:

### 2.1 <一句话标题>

- **文件**:`src/views/foo/index.vue:120-180`
- **现象**:`<el-dialog>` 直接出现在业务页面,visible 由本地 ref 管理
- **应当复用**:`BaseDialog` + `useDialog`(`src/ai-kit/hooks/useDialog.ts`)
- **改法**:替换 `<el-dialog>` 为 `<BaseDialog>`,visible / payload 改由 `useDialog()` 提供
- **预期收益**:消除重复模板 ≈ 30 行,与全局 dialog 行为对齐(esc 关闭、loading 锁定等)
- **工作量**:0.5 人日
- **风险**:低,API 兼容
- **验收**:页面内不再出现 `el-dialog` 标签

---

## 3. 建议新抽取到 ai-kit 的清单

> 仅列入满足"重复度 ≥ 2 + 稳定 + 可写非 any 契约"的候选。

### 3.1 <候选名称>,如 useFormDraft

- **路径**:`src/ai-kit/hooks/useFormDraft.ts`
- **覆盖场景**:表单脏检查 + 离开拦截 + 草稿暂存
- **当前业务出现位置**:
  - `src/views/device/edit-drawer.vue:40-95`
  - `src/views/user/edit-drawer.vue:60-120`
  - `src/views/order/form-dialog.vue:35-80`
- **契约草稿**:
  ```ts
  interface UseFormDraftOptions<T> {
    initial: T
    onLeaveConfirm?: () => Promise<boolean>
    storageKey?: string
  }
  interface UseFormDraftReturn<T> {
    formData: Ref<T>
    isDirty: ComputedRef<boolean>
    saveDraft: () => void
    clearDraft: () => void
    confirmLeave: () => Promise<boolean>
  }
  ```
- **AI 注释草稿**:见 references/annotation-template.md,遵循 `useXxx —— ...` 格式
- **同步项**:
  - `src/ai-kit/readme.md` 追加一行
  - `.cursor/rules/global/base.mdc` 公共能力表追加一行
  - 新建 `.cursor/rules/hooks/use-form-draft.mdc`
  - 新建 `prompts/forms/form-draft.md`
- **工作量**:1 人日(含改造 3 处业务方)
- **风险**:低,新增能力,不破坏现有 API

---

## 4. 观察项(出现 1 次,继续跟踪)

> 不抽,只记录。下次再出现 1 次时再评估。

| # | 文件:行号 | 候选名称 | 说明 |
|---|-----------|----------|------|
| 1 | `src/views/xxx.vue:200-250` | useColumnConfig | 表格列动态配置 + 本地存储,仅 1 处出现 |
| 2 | ... | ... | ... |

---

## 5. 改造清单与优先级

| 优先级 | 项目 | 类型 | 工作量 | 风险 | 负责人(留空) |
|--------|------|------|--------|------|---------------|
| P0 | 2.1 替换裸 el-dialog | 复用 | 0.5d | 低 | |
| P0 | 2.2 替换裸 echarts.init | 复用 | 0.5d | 低 | |
| P1 | 3.1 抽 useFormDraft | 抽取 | 1d | 低 | |
| P1 | 3.2 抽 BaseStatusTag | 抽取 | 0.5d | 低 | |
| P2 | 同步 ai-kit/readme + base.mdc 表格 | 同步 | 0.25d | 无 | |

**优先级定义**:

- **P0**:违反 base.mdc 硬性规范的复用项,必须本次解决
- **P1**:满足抽取条件的候选项,本迭代或下迭代完成
- **P2**:文档/规则同步项,与 P0/P1 一起完成,不能拖

**总工作量估计**:<合计>

---

## 6. 附录:扫描时未进入清单的判断记录

> 让其它工程师能验证"为什么这个没抽"。

| 文件:行号 | 候选 | 不抽原因 |
|-----------|------|----------|
| `src/views/...` | 类似 BaseXxx | 仅 1 处,标观察项 |
| `src/views/...` | useXxx | 参数语义在两处差异大,先用约定统一 |
````

---

## 写报告时的注意事项

- **不夸大**:不写"显著提升性能""极大降低复杂度",写具体数字或场景
- **不省略**:即使"无",也写"无",不要删除小标题
- **可执行**:每条都给出文件:行号、改法、验收标准
- **可回溯**:附录里记录"为什么不抽",防止下次又被翻出来重新讨论

## 报告产出位置

报告默认写到项目根的 `docs/engineering-reports/`(若目录不存在则在报告里提示需要创建)。文件命名 `engineering-report-YYYYMMDD-<scope>.md`。
