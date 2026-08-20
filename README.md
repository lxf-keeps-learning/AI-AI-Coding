# AICoding

> **开发期 AI 工程基础设施**：面向 Vue 3 + TypeScript 团队，让 Codex、Cursor 等编码助手基于团队规范、可复用资产和真实业务项目生成代码。
>
> 核心原则：**不让 AI 从 0 随机生成，让 AI 基于规范、Prompt、公共资产和业务事实生成。**

AICoding 不是业务运行时系统，也不是成熟的 UI 组件库。它是一套开发期资产与工作流：开发者在真实业务仓库提出需求，AICoding 负责检索合适的 Prompt 和 Cursor Rules、提供 ai-kit 参考实现，AI 再结合业务仓库中的依赖、接口、类型和现有代码完成实现与验证。

---

## 两条主链路

```text
① 需求链路（仓库内工作流，模板 + Skill 驱动）
   MRD/需求 → PRD-SPEC → HLD → LLD → TASKS

② 编码链路（可安装到业务项目）
   需求 → Prompt 检索 → Cursor Rules/ai-kit → 业务项目代码生成 → 验证
```

- **需求链路**：由 `skills/prd-spec-enhancer/` 与 `design/_templates/` 驱动，产出 `design/<slug>/` 下的 PRD-SPEC / HLD / LLD / TASKS 文档链。
- **编码链路**：由安装器、检索器与 `skills/aicoding-codegen/` 驱动，在真实业务仓库完成代码生成并运行项目已有检查。

## 快速开始

### 1. 作为开发期知识库使用

```bash
git clone https://github.com/xs-lxf/AI-AI-Coding.git
```

浏览器直接打开 `index.html` 可使用本地 Prompt Lab（无需安装依赖，数据存于浏览器 localStorage）。Cursor 打开项目后 `.cursor/rules/` 自动生效。

### 2. 接入真实业务项目

```bash
cd /你的/业务项目
npm install --save-dev /AICoding所在路径/AI-AI-Coding
npx aicoding install --target .
```

重新打开业务项目 Codex / Cursor 会话后，直接输入“生成一个折线图”即可。完整说明见 [docs/实际项目接入指南.md](./docs/实际项目接入指南.md)。

## 常用命令

```bash
npm run check              # 全量验证：语法、Prompt、ai-kit 契约、TypeScript、Node 测试、Vitest
npm run build:prompts      # 新增/修改 prompts/**/*.md 后重新生成静态目录
npx aicoding install --target .     # 把 Codegen Skill / Rule / 配置安装到业务项目
npx aicoding search "折线图"        # 调试 Prompt 检索
```

## 为什么有效

- `.cursor/rules/`（50 条 `.mdc`）是生成约束，Cursor 自动加载，把规范前移到生成阶段；
- `src/ai-kit/`（30 个 `.ts/.vue` 参考实现）让 AI 知道“具体怎么写”，并优先复用而非重复造轮子；
- `prompts/`（22 个非索引 Prompt）是可版本化的任务模板，检索器按自然语言命中并自动关联 Rules 与 ai-kit 引用；
- 契约与测试（`validate-ai-kit.js`、`vue-tsc`、Node 测试、Vitest）守住规则与实现的真实性，防止文档漂移。

## 项目结构

```
AICoding/
├── .cursor/rules/          ← AI 生成约束（50 条 .mdc：global/components/forms/search/table/tree/charts/hooks/pages/performance/review/refactor）
├── prompts/                ← 可版本化任务模板 + Prompt viewer（22 个非索引 Prompt）
├── src/ai-kit/             ← Vue3 + TS 参考实现（组件/表单/搜索/树/图表/Hook/utils/级联筛选）
├── skills/                 ← 可执行工作流（6 个 Skill，见 skills/README.md）
├── design/                 ← 需求链路模板与真实样例（design/_templates/、design/cascade-filter/）
├── scripts/                ← CLI、检索器、安装器、目录生成、契约检查
├── js/ + css/ + index.html ← 本地 Prompt Lab
├── tests/                  ← Node 测试（*.test.js）与 Vitest（tests/ai-kit/*.test.ts）
└── docs/                   ← 接入指南、AI 交付流水线、工程报告等
```

## 一键生成示例

```text
参考：
  - src/ai-kit/components/list-page-template.vue
  - src/ai-kit/hooks/useTable.ts
  - src/ai-kit/hooks/useSearch.ts
  - src/ai-kit/hooks/useDialog.ts

生成「设备管理」列表页：
  接口：getDeviceList / deleteDevice / createDevice / updateDevice
  字段：name(设备名)、sn(序列号)、status(状态)、location(位置)、createTime
  搜索：name、status
```

## 核心规范（高优先级约束）

- 禁止裸用 `el-dialog` / `el-drawer` → 用 `BaseDialog` / `BaseDrawer`
- 禁止裸调 `echarts.init` → 用 `BaseChart` / `useChart`
- 禁止页面内裸声明 tableData / loading / pagination → 用 `useTable`
- 禁止重复封装 request / debounce / throttle → 用 `useRequest` / `src/ai-kit/utils/`
- 页面文件禁止超过 500 行
- 禁止 TypeScript `any`

## 验证体系

```bash
npm run check
```

当前检查输出（以命令实际结果为准）：
- 50 条 Cursor 规则契约检查通过；
- 30 个 ai-kit 实现文件通过严格类型检查；
- Node 测试 10 项通过；
- Vitest 3 个测试文件、10 项通过；
- Prompt 静态目录与源文件一致；
- `npm pack --dry-run` 发布预检通过（发布清单约 130 个文件，由 `package.json#files` 白名单控制）。

## 项目文档

- [项目总结](./项目总结.md)：定位、架构、核心能力、可验证结果、边界与路线
- [面试大纲](./面试大纲.md)：项目讲解结构、重点问题、参考回答与追问方向
- [实际项目接入指南](./docs/实际项目接入指南.md)：业务项目接入步骤与边界
- [AI 交付流水线工作流](./docs/ai-delivery-workflow.md)：需求→上线全链路各环节操作手册
