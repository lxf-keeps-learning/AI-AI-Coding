# AICoding 项目完整度收口设计

> 状态：待确认  
> 日期：2026-08-20  
> 范围：在不扩张产品边界的前提下，使当前工作区形成可验证、可安装、可演示的稳定版本

## 1. 背景与目标

当前项目已经形成两条主链路：

1. `MRD/原始需求 → PRD-SPEC → HLD → LLD → TASKS` 的设计交付链；
2. `自然语言需求 → Prompt 检索 → Cursor Rules/ai-kit 参考 → 业务项目代码生成 → 验证` 的编码链。

当前主要问题不是能力缺失，而是工作区事实、Git 版本、文档口径、发布内容和验证结果尚未完全一致。此次收口不引入向量数据库、云端协作平台或成熟组件库等新方向，只解决影响项目可信度和跨项目使用的关键缺口。

目标是让项目满足以下条件：

- 当前有效资产进入可追踪版本，实验文件与正式能力边界明确；
- 一条命令可以完成仓库检查，且检查结果全绿；
- Codegen 与 PRD-SPEC 能力都可以安装到其他业务项目；
- Prompt 有最低质量契约，重复、缺少结构和目录漂移可被自动发现；
- CI 自动执行与本地一致的质量门控；
- `README.md`、`项目总结.md`、`面试大纲.md` 与当前实现一致。

## 2. 非目标

- 不把 `src/ai-kit/` 改造成独立发布的运行时 UI 组件库；
- 不实现向量检索、RAG、后端服务或多人协作；
- 不为 HLD、LLD、TASKS 分别新增复杂 Agent；
- 不增加未经真实业务验证的新公共组件；
- 不制造研发效率提升比例，未试点数据继续明确标注为未验证。

## 3. 当前事实基线

以 2026-08-20 当前工作区为准：

- `.cursor/rules/`：50 条 `.mdc` 规则；
- `prompts/`：23 个非 `readme.md` Prompt；
- `skills/`：6 个 Skill；
- `src/ai-kit/`：30 个 `.ts/.vue` 实现文件；
- `npm pack --dry-run`：当前发布清单 131 个文件；
- `npm run check:ai-kit-contracts`：通过；
- `npm run check`：因 Prompt 静态目录过期而中断；
- `npm run type-check`：当前环境缺少本地 `vue-tsc`；
- Node 测试：8/9，通过项包括 Prompt 检索，失败项是安装测试硬编码仓库目录名；
- 工作区存在多批未跟踪资产，当前工作区与 Git 已跟踪版本不一致。

这些数量用于本次验收基线，但最终文档尽量避免维护容易漂移的固定数字；需要展示数量时，从校验脚本输出获得。

## 4. 收口方案

### 4.1 工作区与正式资产边界

逐项判断未跟踪内容是否属于 AICoding 主产品：

- 正式纳入：新增图表 Prompt、`code-reviewer`、通用 ai-kit utils、Prompt viewer/workbench 中与 Prompt 管理直接相关的能力；
- 单独判断：百度搜索脚本、依赖文件和 Superpowers 过程文档；与 AICoding 主链路无关的实验内容不进入产品发布范围；
- 不删除用户内容；仅通过发布白名单、文档说明和后续提交清单明确边界。

发布范围仍由 `package.json#files` 作为唯一白名单，避免测试、实验文件和过程文档意外进入 npm 包。

### 4.2 验证链恢复

修复以下确定性问题：

1. 重新生成 `js/prompt-catalog.js`，使 Prompt Lab 与 `prompts/**/*.md` 一致；
2. 修复 `tests/install-integration.test.js` 对目录名 `AI-AI-Coding` 的硬编码，改为比较解析后的实际 `sourceRoot`；
3. 安装锁文件声明的开发依赖后执行完整检查；
4. 保持 `npm run check` 为本地和 CI 的统一入口；
5. 执行 `npm pack --dry-run` 验证发布边界。

验收标准：语法检查、Prompt 目录检查、ai-kit 契约、TypeScript、Node 测试、Vitest 全部通过。

### 4.3 Spec 跨项目安装

扩展现有 CLI，但保持默认行为兼容：

```bash
npx aicoding install --target .
npx aicoding install --target . --with-spec
```

默认命令继续只安装 Codegen；`--with-spec` 额外安装：

```text
.agents/skills/prd-spec-enhancer/
design/_templates/
```

安装后的 `prd-spec-enhancer` 不假设 AICoding 资产位于业务仓库。它首先读取 `.aicoding/config.json` 并解析 `sourceRoot`，再从知识库读取 `.cursor/rules/`、`src/ai-kit/` 和模板；业务项目自己的 `design/<slug>/` 仍作为需求文档落点。

安装器必须满足：

- 重复执行结果稳定；
- 不覆盖业务项目中非 AICoding 管理的文件；
- AICoding 管理文件允许同步升级；
- 缺少 Spec 源文件时给出明确错误；
- 安装结果在终端列出所有创建或同步的路径。

`package.json#files` 同步加入：

- `skills/prd-spec-enhancer/`；
- `design/_templates/`；
- `docs/ai-delivery-workflow.md`。

其他诊断类 Skill 暂不随 `--with-spec` 安装，避免一次扩大过多范围。

### 4.4 Prompt 最低质量契约

在现有 Prompt 目录检查基础上增加机械校验，不引入复杂格式迁移。每个非索引 Prompt 至少满足：

- 存在一级标题；
- 正文非空且达到合理的最低有效长度；
- 不与另一个 Prompt 全文完全重复；
- 涉及 ai-kit 资产时，引用路径必须存在；
- 被检索器返回的规则路径必须存在；
- 生成后的 `js/prompt-catalog.js` 与源文件一致。

对于当前过短或重复的 Prompt，优先补充适用场景、输入、约束、参考资产和验收条件；不为了长度堆砌无效内容。

Prompt 检索测试补充代表性场景：表单、Dialog、性能、图表和无匹配查询。测试关注排序、规则关联和引用有效性，不绑定不稳定的精确分数。

### 4.5 CI

增加最小 GitHub Actions 工作流，仅执行项目已有命令：

```text
checkout → setup-node → npm ci → npm run check → npm pack --dry-run
```

约束：

- Node 版本满足 `package.json#engines`，固定使用 Node 20 LTS；
- 不在 CI 中自动修改 Prompt 目录；目录过期直接失败；
- 不发布 npm 包；当前 `private: true` 保持不变；
- npm 打包使用临时产物，不提交 `.tgz`。

### 4.6 文档重写与口径统一

最终更新：

- `README.md`：快速开始、架构、Codegen/Spec 两种接入方式、验证命令；
- `docs/实际项目接入指南.md`：增加 `--with-spec` 和升级行为；
- `skills/README.md`：明确哪些 Skill 可安装、哪些仍是仓库内工作流；
- `项目总结.md`：按最终实现重写项目定位、架构、完整度、成果、限制和路线；
- `面试大纲.md`：按 30 秒、3 分钟、架构深挖、Spec/Prompt、工程验证、跨项目使用、限制与追问重写。

文档统一遵守：

- “当前已实现”“规划能力”“尚未验证”分开描述；
- 不再引用过时的固定测试数量；
- 数量确需展示时，以最终命令输出为准；
- Code Reviewer 输出统一描述为 Markdown，不再同时声明 HTML；
- 不把模板驱动的 HLD/LLD/TASKS 描述成已存在的独立自动化 Skill。

## 5. 文件影响范围

预计修改：

```text
package.json
scripts/install-integration.js
scripts/validate-ai-kit.js 或新增独立 Prompt 校验脚本
skills/prd-spec-enhancer/SKILL.md
tests/install-integration.test.js
tests/search-prompts.test.js
js/prompt-catalog.js
.github/workflows/check.yml
README.md
docs/实际项目接入指南.md
docs/ai-delivery-workflow.md
skills/README.md
项目总结.md
面试大纲.md
```

可能修改若干现有 Prompt，以消除重复和补齐最低结构。不会修改业务功能代码，除非验证暴露出与本次收口直接相关的确定性缺陷。

## 6. 测试策略

### 安装器

- 默认安装仍只生成 Codegen Skill、Cursor Rule 和配置；
- `--with-spec` 额外生成 PRD-SPEC Skill 和模板；
- 配置中的 `sourceRoot` 可正确还原为实际知识库路径；
- 重复安装成功；
- 无效 source 或缺失 Spec 资产时失败并给出明确错误。

### Prompt

- Prompt 目录与静态 catalog 一致；
- 重复正文、无标题、无效引用会使检查失败；
- 折线图、CRUD、树、表单、Dialog、性能请求命中合理结果；
- 无可靠匹配时保持现有降级行为。

### 全量验证

```bash
npm run check
npm pack --dry-run
```

两条命令必须成功，且发布清单包含 Codegen、PRD-SPEC Skill、设计模板、Prompt、Rules、ai-kit 和 CLI，不包含测试缓存、实验脚本或生成的压缩包。

## 7. 风险与控制

- **工作区已有大量用户改动**：逐文件修改，不使用重置、清理或批量覆盖命令；不删除未跟踪文件。
- **安装器覆盖业务文件**：只管理固定 AICoding 路径，并为现有非托管冲突增加检测或明确提示。
- **Prompt 质量规则过严**：先以当前有效 Prompt 能合理达标为准，不引入复杂 frontmatter 强制迁移。
- **Spec 与业务项目路径耦合**：统一通过 `.aicoding/config.json` 解析知识库位置，不扫描用户磁盘。
- **文档再次漂移**：关键命令和能力边界与测试绑定，数量描述尽量由命令输出支撑。

## 8. 完成定义

此次项目完整度收口完成必须同时满足：

1. `npm run check` 全绿；
2. `npm pack --dry-run` 成功且发布边界正确；
3. 默认安装行为向后兼容；
4. `--with-spec` 在临时业务项目安装测试通过；
5. Prompt 最低质量检查和代表性检索测试通过；
6. CI 配置与本地检查一致；
7. README、接入指南、项目总结和面试大纲与最终代码一致；
8. 未验证的业务收益和未自动化的流程被如实标注。
