---
name: performance
description: "在本项目(Vue3 + TS + Element Plus + ECharts 的 ai-kit 体系)里做前端性能诊断和优化建议时使用。先采集症状、再分类瓶颈(渲染 / 内存 / 大数据 / 网络 / 计算 / 图表)、再针对性给出改造方案。任何涉及'页面卡顿''列表渲染慢''图表卡死''首屏慢''内存占用高''性能 review''帮我看下为什么慢'的请求都应当触发本 skill,即使用户没有明确说'性能'两个字。输出形态固定为 Markdown 优化报告 + 改造清单,包含问题、影响面、改造步骤、优先级和度量指标,不直接改业务代码。"
---

# Performance — 前端性能诊断与改造

## 你在做什么

你正在为 **AI-AI-Coding** 项目做前端性能问题的诊断和改造建议。这个项目的技术栈是 Vue3 + TypeScript + Element Plus + ECharts,所有公共能力都沉淀在 `src/ai-kit/` 中,优化建议必须**优先利用 ai-kit 中已经存在的能力**(例如表格虚拟滚动走 `useTable` 的相关分支、图表降采样走 `useChart` / `BaseChart` 的配置项)。

你的工作流是固定的三段式:**采集症状 → 分类瓶颈 → 输出报告**。**不要在没采集症状的情况下就开始推荐方案**,这是本项目最容易踩的坑——同样的"卡顿"可能是渲染问题、可能是 watch 问题、也可能是请求阻塞,瞎猜方案会浪费工程时间。

**你不主动修改业务文件**,你的产出是一份带优先级的改造报告,由人决定是否执行,执行后再回到本 skill 复测。

## 触发场景与典型 prompt

无论用户的措辞是什么,只要本质是下面这些诉求,都属于本 skill 的范围:

- "这个页面卡顿,帮我看看哪里慢"
- "列表渲染慢"
- "图表卡死了浏览器"
- "首屏白屏好几秒"
- "我们项目内存越用越大"
- "review 一下这段代码的性能"
- "切 tab 后图表/表格反应很慢"
- "下拉滚动的时候掉帧"

## 工作流概览

```
┌────────────────────────┐    ┌─────────────────────────┐    ┌────────────────────────┐
│ 1. 采集症状            │ →  │ 2. 分类瓶颈             │ →  │ 3. 输出改造报告        │
│ (现象 / 复现 / 度量)   │    │ (路由到对应 reference) │    │ (问题 / 改造 / 指标)   │
└────────────────────────┘    └─────────────────────────┘    └────────────────────────┘
                                     │
                                     ├──→ render(渲染)
                                     ├──→ memory(内存)
                                     ├──→ large-data(大数据)
                                     ├──→ network(网络/请求)
                                     ├──→ chart(图表)
                                     └──→ compute(计算)
```

## 第一步:采集症状(必须做,不能跳过)

读取 [references/diagnosis-flow.md](references/diagnosis-flow.md),按其中的"症状采集清单"逐项问。如果用户只给了代码,从代码里**推断**症状归属;如果用户给了模糊描述("就是慢"),**不要直接推方案**,先反问下面这几个关键问题:

1. 哪个页面 / 哪个交互卡?(进入页面? 滚动? 切换 tab? 提交表单?)
2. 是首次出现还是用一段时间后才慢?(后者高度怀疑内存泄漏)
3. 是开发环境还是生产?数据量级多少?
4. 是否在某个浏览器或低配机器上才出现?
5. 是否有控制台报错或大量 warning?
6. 是否有 Performance / Memory 截图、Lighthouse 报告、网络面板可参考?

收齐再进入第二步。如果还没收齐就被催着出方案,**先在报告里写"症状未完整采集,以下结论为假设性的"并明确标注**——这是对用户负责。

## 第二步:分类瓶颈,路由到对应 reference

根据症状,选择**一类或多类**瓶颈;每类对应一份 reference,只在该类成立时才读对应文件:

| 瓶颈类型 | 何时怀疑 | 对应 reference |
|----------|----------|-----------------|
| 渲染 | 滚动/切换/输入时掉帧;Performance 火焰图里 render/commit 长 | [references/render.md](references/render.md) |
| 内存 | 用一段时间后变慢、tab 一直开着内存增长、刷新就好 | [references/memory.md](references/memory.md) |
| 大数据 | 一次性渲染数百/数千条记录、表格列多、图表点多 | [references/large-data.md](references/large-data.md) |
| 网络 | 首屏白屏、瀑布图等待长、N+1 请求、payload 巨大 | [references/network.md](references/network.md) |
| 图表 | ECharts 初始化卡、resize 卡、tooltip 拖动卡 | [references/chart.md](references/chart.md) |
| 计算 | 同步循环阻塞、复杂深度 watch、computed 重算频繁 | [references/compute.md](references/compute.md) |

**只读你需要的 reference**,不要全读。一个症状可能同时归两类(例如"图表 + 大数据"),那就两类都读,改造建议合并写。

## 第三步:输出改造报告

最终交付物是一份 **Markdown 报告**(不是直接改代码)。结构模板见 [references/report-template.md](references/report-template.md)。报告必须包含 6 节:

1. **症状采集摘要** — 现场观察、复现路径、度量值(LCP / TTI / FPS / 堆内存 等)
2. **瓶颈分类与定位** — 命中了哪几类瓶颈,具体定位到文件:行号 / 组件 / hook 调用
3. **优化方案** — 每个瓶颈对应方案,优先用 ai-kit 已有能力实现;方案要给出代码示例和替代写法对比
4. **改造清单与优先级** — P0/P1/P2 表格,含影响面、工作量、风险
5. **度量指标(必须有)** — 改造前 baseline 与改造后目标指标。**没有指标的优化报告不接受**,因为没法验证收益
6. **回滚预案** — 如何关掉这个改造(特性开关、配置项)

报告语言:中文为主,代码片段、文件路径、组件名、ECharts 配置项保留英文。

## 项目特有的优化资源

本项目有一些"现成的优化手段",AI 必须先想到这些,再去想通用的优化思路:

- **表格性能** → `useTable` 已封装分页;大数据量场景使用虚拟表格,见 `.cursor/rules/table/virtual-table.mdc`
- **图表性能** → `BaseChart` / `useChart` 提供 init/dispose 生命周期;采样、降采样、隐藏 tab 延迟初始化等约束见 `.cursor/rules/performance/chart-performance.mdc` 和 `.cursor/rules/charts/bigscreen-chart.mdc`
- **防抖节流** → `src/ai-kit/utils/debounce.ts` / `throttle.ts`;**禁止业务自写**
- **请求** → `useRequest` 已提供 loading/error/data 统一管理;批量请求/取消请进入该 hook 而非业务页
- **大数据分片** → `.cursor/rules/performance/large-data.mdc` 已约定使用 Worker / requestIdleCallback,优化方案沿用约定
- **现有规则** → `.cursor/rules/performance/` 下 render / memory / large-data / chart-performance / table-performance 已有简要约束,可在报告里直接引用规则文件名

如果方案里"绕过"了上述 ai-kit 能力,自己造一个等价物——是反模式,必须改回。

## 一个反模式提醒

**不要写"建议优化"这种没有抓手的话**。每条建议必须能落到:

- 文件:行号 / 组件 / 调用栈(从 Performance / Heap 截图里能验证)
- 改造的具体动作(`shallowRef` 替换 `ref`、用 `markRaw` 包大对象、用 `BaseChart` 的 sampling 配置等)
- 改造前后的度量目标(LCP 2.5s → 1.5s、内存 200MB → 80MB、列表 FPS 25 → 55 等)

如果你写不出度量目标,说明这条优化的"收益"是想象的——退回去重新评估,或者把它降级为"待度量观察项"。

## 参考文件索引

| 文件 | 何时读 |
|------|--------|
| [references/diagnosis-flow.md](references/diagnosis-flow.md) | 每次任务开始,采集症状时 |
| [references/render.md](references/render.md) | 怀疑渲染瓶颈时 |
| [references/memory.md](references/memory.md) | 怀疑内存泄漏时 |
| [references/large-data.md](references/large-data.md) | 怀疑大数据渲染/计算时 |
| [references/network.md](references/network.md) | 怀疑请求/payload 问题时 |
| [references/chart.md](references/chart.md) | 怀疑 ECharts 性能时 |
| [references/compute.md](references/compute.md) | 怀疑计算/响应式追踪问题时 |
| [references/report-template.md](references/report-template.md) | 撰写最终报告时 |
