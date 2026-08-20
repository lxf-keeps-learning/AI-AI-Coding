# 工程化改造报告 — Cursor 规则与 ai-kit

> 生成日期：2026-07-14  
> ai-kit 版本对照：2026-07-14 工作区  
> 分析者：Codex / engineering skill

---

## 1. 范围与方法

**扫描范围**：

- `.cursor/rules/`
- `src/ai-kit/`
- `scripts/search-prompts.js`
- `scripts/install-integration.js`
- `skills/aicoding-codegen/`

**对照基线**：`src/ai-kit/readme.md` + `.cursor/rules/global/base.mdc` + 代码实际行为。

**分析方法**：逐文件读取、规则与实现交叉核对、严格 TypeScript 检查、Hook 并发测试、组件交互测试、安装器与 Prompt 检索测试、npm 安全审计。

---

## 2. 违反复用规范的清单（必须改，P0）

本次扫描的是公共能力本身，不是业务页面。发现的 P0 均已修复。

### 2.1 图表 Hook 暴露失效实例且丢失挂载前状态

- **文件**：`src/ai-kit/hooks/useChart.ts:37`
- **原现象**：返回值中的 chart 长期为 null；组件挂载前传入的 option/loading 无法可靠应用；规则声称的更新延迟参数与实际签名不一致。
- **改法**：改为实时 `shallowRef`，缓存 option/loading，加入 ResizeObserver、主题切换重建、定时器清理，并统一为 `setOption(option, delayMs)`。
- **预期收益**：生成代码可以读取真实实例，首屏状态与高频更新契约可验证。
- **工作量**：已完成。
- **风险**：中；ECharts 生命周期变化已通过类型检查与 Hook 测试。
- **验收**：`npm run type-check` 与 `npm run test:ai-kit` 通过。

### 2.2 请求、表格和树 Hook 缺少错误与并发保护

- **文件**：`src/ai-kit/hooks/useRequest.ts:40`、`src/ai-kit/hooks/useTable.ts:54`、`src/ai-kit/hooks/useTree.ts`
- **原现象**：旧请求可能覆盖新请求；表格和树没有稳定 error 状态；有参数的 immediate 请求可在缺参时执行。
- **改法**：增加请求序号，只允许最后一次请求写入状态；补 error、refresh/cancel/reset；规定 API 响应在 services 层适配；有参数 immediate 必须给 `defaultParams`。
- **预期收益**：快速查询、翻页和筛选时不会出现过期结果覆盖，失败可重试。
- **工作量**：已完成。
- **风险**：低；保持组合式 API 返回风格，新增字段向后兼容。
- **验收**：并发、失败与重试测试通过。

### 2.3 Dialog 重复打开留下悬空 Promise，关闭状态不完整

- **文件**：`src/ai-kit/hooks/useDialog.ts`、`src/ai-kit/components/BaseDialog.vue:42`、`src/ai-kit/components/BaseDrawer.vue`
- **原现象**：连续 open 时上一次 Promise 不结束；提交 loading 时仍可能关闭；异步关闭拦截异常可能形成未处理拒绝。
- **改法**：重复打开先以 false 结束上一次调用；loading 锁定关闭入口；统一 `beforeClose`；异常通过 `close-error` 上报。
- **预期收益**：新增/编辑流程的调用方一定得到结束结果，提交中不会误销毁表单。
- **工作量**：已完成。
- **风险**：低。
- **验收**：重复打开、loading 禁止关闭和 close-error 测试通过。

### 2.4 规则声明与实际组件能力不一致

- **文件**：`.cursor/rules/global/base.mdc`、`.cursor/rules/charts/chart.mdc`、`.cursor/rules/readme.md`
- **原现象**：BaseSearch 声称折叠但未实现；Drawer 声称移动端全宽但尺寸固定；部分规则把尚未实现的上传、虚拟表格等写成已有公共资产；全局规则缺少 Cursor frontmatter。
- **改法**：实现搜索折叠和响应式抽屉；明确“已实现资产”和“生成指导”边界；补齐规则 frontmatter；新增规则引用自动校验。
- **预期收益**：AI 不再因为错误声明生成不存在的 import 或错误 API。
- **工作量**：已完成。
- **风险**：低。
- **验收**：50 条 `.mdc` 均通过 `npm run check:ai-kit-contracts`。

### 2.5 Prompt 检索未把 Cursor 规则交给 AI

- **文件**：`scripts/search-prompts.js:58`、`scripts/install-integration.js`、`skills/aicoding-codegen/SKILL.md`
- **原现象**：输入“生成折线图”只能命中 Prompt，不能稳定加载全局、图表和折线图规则。
- **改法**：检索结果新增 `rules` 字段，自动关联全局规则、领域规则和同名规则；Cursor 接入规则与 Codex Skill 明确读取它们。
- **预期收益**：Prompt、规则和 ai-kit 参考形成同一条生成链路。
- **工作量**：已完成。
- **风险**：低。
- **验收**：折线图检索自动返回 4 条对应规则，安装器测试通过。

---

## 3. 建议新抽取到 ai-kit 的清单

无。本次目标是让已有公共能力契约可信，不在没有业务重复证据时继续扩张组件数量。

---

## 4. 观察项（出现 1 次，继续跟踪）

| # | 文件 | 候选名称 | 说明 |
|---|------|----------|------|
| 1 | `.cursor/rules/search/advanced-search.mdc` | AdvancedSearch | 目前只有生成指导；有至少两个稳定业务实现后再评估抽取。 |
| 2 | `.cursor/rules/table/virtual-table.mdc` | VirtualTable | 强依赖目标项目表格方案与数据规模，不宜预先抽象。 |
| 3 | `.cursor/rules/components/upload.mdc` | BaseUpload | 上传鉴权、分片和存储协议依赖业务，需先确认重复契约。 |

---

## 5. 改造清单与优先级

| 优先级 | 项目 | 类型 | 状态 | 风险 | 负责人 |
|--------|------|------|------|------|--------|
| P0 | 修复 6 个 Hook 的状态与并发契约 | 可靠性 | 已完成 | 中 | |
| P0 | 修复 Dialog/Drawer/Search/Form/Chart/Tree 行为 | 组件 | 已完成 | 中 | |
| P0 | Prompt 自动关联 Cursor 规则 | 集成 | 已完成 | 低 | |
| P1 | Vue 类型检查与组件/Hook 自动测试 | 验证 | 已完成 | 低 | |
| P1 | ECharts 升级至 6.1.0，清除已知 XSS 审计项 | 安全 | 已完成 | 中 | |
| P2 | 同步 ai-kit、规则和 engineering catalog 文档 | 文档 | 已完成 | 低 | |

**总工作量估计**：本次均已实现；后续只需在真实业务仓库做一次接入验收，建议 0.5 人日。

---

## 6. 附录：扫描时未进入清单的判断记录

| 文件 | 候选 | 不抽原因 |
|------|------|----------|
| `.cursor/rules/components/preview.mdc` | BasePreview | 文件预览格式、鉴权和下载策略尚无稳定公共契约。 |
| `.cursor/rules/table/editable-table.mdc` | EditableTable | 单元格校验、保存粒度和撤销语义通常依赖业务。 |
| `.cursor/rules/charts/map-chart.mdc` | BaseMapChart | 地图数据源、坐标系和授权依赖目标项目。 |

## 7. 验证结果

- `npm run check`：通过。
- Cursor 规则契约：50 条通过。
- ai-kit 类型检查：15 个实现文件通过。
- Node 测试：9 项通过。
- Vitest：3 个测试文件、10 项测试通过。
- `npm audit`：0 个漏洞；ECharts 已升级到 6.1.0。
- `npm pack --dry-run`：通过；发布清单包含 50 条 Cursor 规则、Prompt、ai-kit、CLI 和 codegen Skill，共 107 个文件。

## 8. 实际使用结论

AICoding 应作为开发期知识库接入业务仓库，而不是业务运行时绝对路径依赖。业务项目执行安装器后，开发者只需对 Codex/Cursor 描述需求，例如“生成一个折线图”；AI 会检索 Prompt，读取匹配的 Cursor 规则和 ai-kit 参考，再依据目标项目真实依赖、API、类型和现有组件生成代码并运行该项目的验证命令。
