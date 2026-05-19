# 图表性能(ECharts)

> 本项目的所有 ECharts 都必须通过 `BaseChart` 或 `useChart` 使用,这是性能与内存治理的基础。如果发现业务侧直接调 `echarts.init`,优先级是 P0:**改回 BaseChart**,这比任何 ECharts 优化项都更重要。

## 常见症状

- 图表初始化卡(数据点多 / 动画重)
- resize 时浏览器假死(resize 监听没节流)
- tooltip 拖动卡
- 隐藏 tab 上的图表也参与 resize / 渲染
- 离开页面后内存涨(实例没 dispose)

## 优化思路矩阵

| 现象 | 配置/代码层面 |
|------|----------------|
| 数据点多 | `sampling: 'lttb'` / `progressive` / `progressiveThreshold` |
| 动画重 | `animation: false` 或 `animationDuration < 300` |
| resize 卡 | `useChart` 已封装节流;若业务自管,加 `throttle` |
| 隐藏 tab 仍渲染 | 隐藏时延迟初始化或调 `chart.clear()`,visible 后再 setOption |
| 内存涨 | 强制 `dispose`;Vue 卸载时 `useChart` 已经处理 |
| 大屏多图同时渲染 | `requestAnimationFrame` 串行 setOption,避免主线程同步堆叠 |
| Map 图卡 | 简化 geoJSON / 用 visualMap 离散化 / 关闭 hover 高亮动画 |

## 典型反模式与改法

### 反模式 1:业务直接 echarts.init

```ts
// 反例
const chart = echarts.init(el.value)
chart.setOption(option)
window.addEventListener('resize', () => chart.resize())

// 正例:用 BaseChart
<BaseChart :option="option" />

// 或用 useChart(需要更细控制时)
const { chart, setOption } = useChart(el)
setOption(option)
```

### 反模式 2:option 用 inline 对象 / 每次渲染都新对象

```vue
<!-- 反例 -->
<BaseChart :option="{ tooltip: {}, series: list }" />

<!-- 正例 -->
<script setup lang="ts">
const option = computed<EChartsOption>(() => ({ tooltip: {}, series: list.value }))
</script>
<BaseChart :option="option" />
```

为什么:inline 对象每次渲染 `===` 不等,触发 watch / setOption 重跑。

### 反模式 3:tooltip 拖动卡(海量点)

```ts
// 加 sampling
{ type: 'line', sampling: 'lttb', data: bigData }

// 关键路径不需要 tooltip 时直接关掉
{ tooltip: { show: false } }

// 或限制 trigger
{ tooltip: { trigger: 'axis', axisPointer: { type: 'line' } } }
```

### 反模式 4:动画拖累首屏

```ts
{
  animation: false,                 // 完全关
  // 或仅关闭部分
  animationDuration: 200,
  animationDurationUpdate: 0
}
```

大屏场景默认必须**关动画**,见 `.cursor/rules/charts/bigscreen-chart.mdc`。

### 反模式 5:隐藏 tab 上的图表也初始化

```ts
// 反例:tab 一进来就 setOption,即使该 tab 不可见
onMounted(() => setOption(option))

// 正例:延迟到可见再 init
watch(visible, (v) => v && setOption(option))
```

`BaseChart` 应支持(或被扩展支持)`lazy` prop,如果还没有 → 这是 engineering skill 的候选(抽到 BaseChart 里)。

### 反模式 6:大屏多个图表同时 resize

```ts
// 反例:每个图表自管 resize 监听
// 多个图表同时 resize → 主线程长任务

// 正例:全局 ResizeObserver + RAF 串行
const observer = new ResizeObserver(throttle(() => {
  charts.forEach(c => requestAnimationFrame(() => c.resize()))
}, 100))
```

如果项目里多次出现这个模式,**这就是 engineering 候选**:抽到 `useChartGroupResize`。

### 反模式 7:实例未 dispose(典型内存泄漏)

```ts
// 反例
const chart = echarts.init(el)
// 离开页面没调 dispose

// 正例
onUnmounted(() => { chart.dispose() })

// 最佳:用 BaseChart / useChart,生命周期已封装
```

参考 memory.md 同名反模式。

## 与 ai-kit / 现有规则的关联

- 组件:`BaseChart` (`src/ai-kit/charts/BaseChart.vue`)
- Hook:`useChart` (`src/ai-kit/hooks/useChart.ts`)
- 规则:
  - `.cursor/rules/charts/chart.mdc`(通用)
  - `.cursor/rules/charts/bar-chart.mdc` / `line-chart.mdc` / `pie-chart.mdc` / `map-chart.mdc`
  - `.cursor/rules/charts/bigscreen-chart.mdc`(大屏专用,默认关动画、关 tooltip、降采样)
  - `.cursor/rules/performance/chart-performance.mdc`

## 度量目标参考

| 场景 | 改造前 | 改造后目标 |
|------|--------|------------|
| 1000 点折线初始化 | 500-1500ms | < 300ms |
| 10000 点折线初始化 | 卡顿 | < 800ms(开 sampling) |
| 大屏 6 图并发 resize | 浏览器假死 | < 200ms 完成 |
| tooltip hover 延迟 | 200ms+ | < 50ms |

## 报告里要列的核对项

- [ ] 是否用了 BaseChart / useChart(否则 P0 改回)
- [ ] 数据量 > 1000 是否开 sampling
- [ ] 是否需要 / 是否已关动画
- [ ] resize 是否节流 / 隐藏时是否延迟
- [ ] 离开页面 dispose 是否生效
