# HLD-cascade-filter-概要设计

> 状态：已定版 ｜ 版本：v1.0 ｜ 需求 slug：cascade-filter
> 负责人：@lxf    上游：design/cascade-filter/PRD-SPEC-cascade-filter.md
> 变更记录：v1.0 2026-08-20 初始创建（基于澄清结论） ｜ v1.1 2026-08-20 LLD 已出，评审通过

## 1. 设计目标
- 一句话：交付一个**通用三级级联筛选组件 `CascadeFilter`**——任何"三级父子依赖"的筛选场景（省市区 / 组织架构 / 商品类目…）只需注入一个选项加载函数即可接入；逐级懒加载、级联面板交互、支持回显与"不限"动态配置。

## 2. 架构与模块划分
- 路由：**无新增路由**（组件级需求，嵌入现有列表/报表页）
- 模块清单：

| 模块 | 文件 | 职责 |
|------|------|------|
| 组件模块 | `src/ai-kit/cascade-filter/CascadeFilter.vue` | 对外主组件：级联面板 UI、键盘/清空交互、对外 emit |
| Hook 模块 | `src/ai-kit/cascade-filter/useCascadeOptions.ts` | 各级选项加载 / loading / error / 清空下级 / 回显补齐 |
| 类型模块 | `src/ai-kit/cascade-filter/types.ts` | `CascadeOption`、`CascadeFilterProps`、`Level` |
| 业务接入 | 业务页 | 传入 `fetcher` + `v-model` 绑定筛选值 |

## 3. 接口契约（★ 跨端唯一真相，供 LLD/TASKS 引用）

**通用选项接口**（组件只依赖此契约，具体业务后端实现；或业务侧写适配 fetcher）：

| 接口 | 方法 | 入参 | 出参 | 错误码 | 使用方 |
|------|------|------|------|--------|--------|
| /api/cascade/options | GET | level: 1\|2\|3，parentId?: string | `{ options: CascadeOption[] }` | 400 参数错误 / 404 上级不存在 / 5xx | CascadeFilter |

- `level=1` 不传 parentId；`level=2` 传一级 id；`level=3` 传二级 id
- `CascadeOption = { id: string; name: string; hasChildren?: boolean; disabled?: boolean }`
- 懒加载模式：**不返回 children**，展开该级时才请求下一级

## 4. 状态管理设计
- **不进 Pinia**：筛选值是页面局部状态；若多页面共享同一筛选条件，由调用方自行提升到全局 Store（组件保持无状态依赖）
- 本地状态（`useCascadeOptions` 内）：
  - `optionsByLevel: Map<Level, CascadeOption[]>` — 各级已加载选项（含缓存）
  - `loadingByLevel / errorByLevel` — 每级独立的 loading 与错误态
  - `selected: [id1?, id2?, id3?]` — 受控，对外 `v-model`
  - `hydrating` — 回显补齐链路中，禁止用户操作

## 5. 关键交互与数据流
时序（主流程）：
```
挂载 → 加载一级（若带回显值 → 逐级补齐选项链）
用户选一级 → 清空二、三级选项与值 → 请求二级(parentId=一级)
选二级 → 清空三级 → 请求三级(parentId=二级)
任一级变更 → emit('update:modelValue') + emit('change') → 调用方触发列表查询
```
- 配置 `allowEmpty` 时：每级头部出现"不限"项，选中后跳过该级（如只选到二级 → 按二级范围查询）
- 清空：提供一键清空 → 全部置空 → 调用方按全量查询

异常分支：
- **加载中**：该级骨架屏 / 下级禁用
- **空数据**：空态文案（"暂无选项"），不白屏
- **接口失败**：该级错误态 + 重试按钮，不打断其他级已选状态
- **回显值失效**（数据已变更、值不在选项中）：该级置空 + 轻提示，不阻塞页面

## 6. 公共资产复用（★ 必须复用 ai-kit）

| 能力 | 复用 ai-kit 哪个 | 位置 |
|------|----------------|------|
| 级联面板 / 懒加载树 | ai-kit 树（遵循 lazy-tree 规则：异步子节点、失败重试不打断、skeleton 与空态区分） | src/ai-kit/tree |
| 请求封装 | ai-kit/hooks/useRequest | src/ai-kit/hooks/useRequest.ts |
| 筛选联动 | ai-kit/hooks/useSearch（查询触发/条件组装） | src/ai-kit/hooks/useSearch.ts |
| 基础 UI（按钮/空态/错误态） | ai-kit 基础组件 | src/ai-kit/form、src/ai-kit/components |

## 7. 关键技术决策（ADR）

**ADR-1：UI 用级联面板（Cascader）而非三个独立下拉**
- 理由：三级联动视觉连贯、支持键盘导航与面板内搜索、纵向空间占用小；独立下拉需三处"已选项"展示，且跨级联动不直观
- 备选：三个独立下拉 → 放弃（联动感弱、占空间）

**ADR-2：逐级请求（懒加载）而非全量返回**
- 理由：业务数据量不确定（组织/类目可能上万），全量拉取首屏慢、流量大；懒加载每级响应 <300ms 可达成
- 备选：全量返回前端过滤 → 放弃（数据量大时首屏与内存均超标）

**ADR-3：选项数据通过 `fetcher` 函数注入，而非组件内置 URL**
- 理由：组件与业务完全解耦，任何后端（不同接口命名/鉴权）只需写一个适配 fetcher；组件保持通用
- 备选：props 传 url + 参数模板 → 放弃（约束过强，各业务鉴权/路径不一致）

**ADR-4：`allowEmpty` 动态配置（可支持也可不支持）**
- 理由：澄清结论是"动态配置"，用 props 控制每级是否显示"不限"，默认关闭，业务按需开启
- 备选：写死支持/不支持 → 放弃（无法满足多业务差异）

## 8. 风险与依赖
- **依赖**：
  - 后端需按契约提供选项接口（或业务侧写适配 fetcher）
  - ai-kit 树组件若暂无级联面板形态 → 基于 el-cascader 二次封装，行为遵循 lazy-tree 规则
- **风险**：
  - 回显时选项链可能因数据变更失效 → 已设计置空 + 提示兜底
  - 单级超大数据（>1000 项）→ 面板需虚拟滚动（复用虚拟表格经验，列为 P2 增强）
  - 权限：选项是否按角色过滤 → 由业务 fetcher 内部处理，组件不感知
