# AI 注释模板

> 本项目的灵魂在于:**让 AI 在生成代码时能精准找到 ai-kit 里的能力**。AI 注释是这个机制的载体。新抽取的组件/Hook 如果没有合规 AI 注释,即使写进 ai-kit 也等于不存在——后续 Cursor 不会发现它,团队也不会用它。

注释规则与 `README.md` "增加公共组件时必须写 AI 注释" 一节、`global/base.mdc` 保持一致。

## Hook 注释模板

```ts
/**
 * useXxx —— 一句话说明功能(动宾结构,讲清楚做什么,不要重复名字)
 *
 * 功能:
 * - 条目 1(可观察、可验证)
 * - 条目 2
 * - 条目 3
 *
 * AI 规则:
 * 所有 <场景描述> 场景优先使用本 hook,禁止 <反模式>
 *
 * 用法示例:
 * ```ts
 * const { data, loading, run } = useXxx(api, { ... })
 * ```
 */
export function useXxx<T>(...): UseXxxReturn<T> {
  // ...
}
```

写法要点:

- 第一行 **必须** 是 `useXxx —— 动宾说明`,Cursor 用第一行做索引
- "AI 规则" 这一节是触发器的关键,要明写**何时用 / 何时不用**;不要含糊
- 用法示例必须可直接复制运行,不能放伪代码
- 返回值结构使用具名类型(`UseXxxReturn<T>`),不要用 inline 解构

## 组件注释模板

```vue
<!--
  BaseXxx —— 一句话说明组件用途

  使用场景:
  - 列出 2-4 个典型使用场景

  AI 规则:
  - 所有 <场景> 必须使用本组件,禁止裸用 <反模式>
  - 与 <相关组件 / Hook> 配套使用

  Props:
  - prop1: 类型 // 说明
  - prop2: 类型 // 说明

  Emits:
  - event1: (payload) => void // 说明

  Slots:
  - default: 默认插槽用途
  - footer: 自定义页脚

  用法示例:
  <BaseXxx :prop1="..." @event1="..." />
-->
<script setup lang="ts">
// ...
</script>
```

要点同 Hook。

## "AI 规则" 段的写作

这是注释中 AI 最关心的一段。好的 AI 规则段满足:

1. **正向场景明确**:用"所有……场景必须使用本组件"句式
2. **反模式明确**:用"禁止……"句式,精确到 API(`echarts.init` / `el-dialog` 标签等)
3. **关联组件提示**:如果常与某个 Hook/组件搭配,明写出来
4. **边界明确**:如果某些子场景不适用,显式排除

**反例**(请勿写成这样):

```
AI 规则:
- 推荐使用
- 提升性能
- 减少重复
```

**正例**:

```
AI 规则:
- 所有 ECharts 图表必须使用 BaseChart 或 useChart,禁止业务页面直接调用 echarts.init
- 数据为空时自动展示空态,业务方不需要自行处理 empty 渲染
- 与 useRequest 搭配使用,loading 状态由 useRequest 驱动
- 大屏场景请使用 .cursor/rules/charts/bigscreen-chart.mdc,与本组件配置项有差异
```

## 注释审查清单

发布前 checklist:

- [ ] 第一行是 `名称 —— 动宾说明` 格式
- [ ] 有"功能" / "AI 规则" / "用法示例" 三段
- [ ] "AI 规则"段同时包含正向场景和反模式
- [ ] 用法示例可直接运行
- [ ] Props/Emits/Slots(组件) 或 Returns(Hook) 已枚举,无 `any`
- [ ] 提到了配套组件/Hook/规则文件

## 同步项

新组件/Hook 在 ai-kit 落地后,需要同步更新:

1. **`src/ai-kit/readme.md`** — 目录结构 + 快速使用示例
2. **`.cursor/rules/global/base.mdc`** — "公共能力目录" 表追加一行
3. **`.cursor/rules/<category>/`** — 新建对应的 `.mdc` 规则
4. **`prompts/<category>/`** — 提供至少一个复制即用的 prompt 模板

报告里要把这 4 项作为"同步项"列出,任何一项缺失都视为沉淀未完成。
