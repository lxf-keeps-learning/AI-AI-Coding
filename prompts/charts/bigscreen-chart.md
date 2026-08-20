# 大屏图表提示词（Bigscreen Chart）

> 大屏图表必须基于：
> - 组件：`src/ai-kit/charts/BaseChart.vue`（简单展示）
> - Hook：`src/ai-kit/hooks/useChart.ts`（需要实例控制）
> - 数据请求：`src/ai-kit/hooks/useRequest.ts` 或 WebSocket

---

## 场景一：大屏折线图（实时滚动 + 高对比）

```
参考：
  - src/ai-kit/hooks/useChart.ts（需要实例级控制）

生成「实时网络流量」大屏折线图 BigscreenLineChart.vue：
  接口：轮询 getNetworkFlow()，每5秒更新，保留最近60个点
  要求：
    - 深色背景（背景 #0a1929，字体 #e8f4fd，网格线 rgba(255,255,255,0.08)）
    - 折线为亮青色（#00d4ff），发光效果（shadowBlur: 10，shadowColor 同折线色）
    - X 轴为时间，滑动窗口显示最近60秒
    - Y 轴单位自动换算（Kbps/Mbps）
    - 折线下方半透明渐变填充（蓝色渐变到透明）
    - 每5秒轮询，onUnmounted 清除定时器
    - 使用 useChart hook（需要手动 setOption 增量更新）

ECharts option 结构参考：
{
  backgroundColor: 'transparent',
  textStyle: { color: '#e8f4fd' },
  grid: { left: 55, right: 20, top: 30, bottom: 40 },
  xAxis: {
    type: 'category', data: times,
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
    axisLabel: { color: '#8eb8d8' }
  },
  yAxis: {
    type: 'value',
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },
    axisLabel: { color: '#8eb8d8', formatter: (v) => v >= 1000 ? `${v/1000}M` : `${v}K` }
  },
  series: [{
    type: 'line', data: values, smooth: true,
    lineStyle: { color: '#00d4ff', width: 2, shadowBlur: 10, shadowColor: '#00d4ff' },
    itemStyle: { color: '#00d4ff' },
    symbol: 'none',
    areaStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: 'rgba(0, 212, 255, 0.3)' },
        { offset: 1, color: 'rgba(0, 212, 255, 0.02)' }
      ])
    }
  }]
}
```

---

## 场景二：大屏轮播柱状图（自动高亮）

```
参考：
  - src/ai-kit/hooks/useChart.ts

生成「各区域销售额排名」大屏自动轮播柱状图 BigscreenBarChart.vue：
  接口：getRegionSales()，返回 [{ region, value }]（按值降序）
  要求：
    - 横向柱状图，数据条自下而上排列
    - 深色风格：背景透明，柱子渐变蓝（左亮右暗）
    - 每3秒自动轮播高亮 tooltip（dispatchAction: 'showTip'）
    - 柱子右侧数值标签（单位：万元）
    - 超过8条数据时开启垂直 dataZoom（不显示滑块，仅内部滚动）
    - 使用 useChart hook

轮播高亮实现：
// 初始化后开启轮播
let currentIndex = 0
const timer = setInterval(() => {
  chart.value?.dispatchAction({ type: 'hideTip' })
  chart.value?.dispatchAction({
    type: 'showTip', seriesIndex: 0, dataIndex: currentIndex
  })
  chart.value?.dispatchAction({
    type: 'highlight', seriesIndex: 0, dataIndex: currentIndex
  })
  currentIndex = (currentIndex + 1) % data.length
}, 3000)
onUnmounted(() => clearInterval(timer))
```

---

## 场景三：大屏地图热力图

```
参考：
  - src/ai-kit/hooks/useChart.ts

生成「全国销售热力地图」BigscreenMapChart.vue：
  接口：getProvinceSales()，返回 [{ province: string, value: number }]
  要求：
    - 中国地图（需提前注册地图 JSON：echarts.registerMap('china', chinaJson)）
    - 热力色阶：低值蓝色 → 中值绿色 → 高值红色
    - 省份悬停显示 tooltip：省份名 + 销售额（万元）
    - 点击省份触发 emit('province-click', provinceName) 联动列表
    - 地图初始居中，viewControl 支持鼠标拖拽缩放（geo.roam: 'move'）
    - 深色背景风格

ECharts option 结构参考：
{
  visualMap: {
    min: 0, max: maxValue,
    left: 20, bottom: 40,
    text: ['高', '低'],
    inRange: { color: ['#1a3a5c', '#2eb8b8', '#ff6b35'] },
    textStyle: { color: '#8eb8d8' }
  },
  geo: {
    map: 'china', roam: 'move',
    itemStyle: { areaColor: '#0c2340', borderColor: '#1a6080', borderWidth: 1 },
    emphasis: { itemStyle: { areaColor: '#0d6efd' } }
  },
  series: [{
    type: 'map', map: 'china', geoIndex: 0,
    data: salesData.map(d => ({ name: d.province, value: d.value }))
  }]
}
```

---

## 场景四：大屏数字翻牌器 + 迷你趋势图

```
参考：
  - src/ai-kit/charts/BaseChart.vue（迷你折线图）
  - src/ai-kit/hooks/useRequest.ts

生成「核心指标卡」组件 MetricCard.vue：
  包含：大字指标值（带数字滚动动画）+ 同比增减标注 + 迷你7日趋势折线图
  接口：getMetricData(metricKey)，返回 { value, trend: 'up'|'down', rate: number, sparkline: number[] }
  要求：
    - 数字用 CSS 或 countTo 动画效果滚动到目标值
    - 同比：↑ 绿色 / ↓ 红色 + 百分比
    - 迷你折线图高度 40px，无坐标轴，无 tooltip，纯视觉趋势（sparkline 效果）
    - 深色卡片风格（背景 rgba(255,255,255,0.05)，边框 rgba(255,255,255,0.1)）

迷你折线 ECharts option：
{
  grid: { top: 2, bottom: 2, left: 2, right: 2 },
  xAxis: { type: 'category', show: false },
  yAxis: { type: 'value', show: false },
  series: [{
    type: 'line', data: sparkline, smooth: true, symbol: 'none',
    lineStyle: { color: trend === 'up' ? '#52c41a' : '#ff4d4f', width: 1.5 },
    areaStyle: { opacity: 0.15 }
  }]
}
```

---

## 大屏通用规范

- 所有图表背景 `backgroundColor: 'transparent'`，背景色由容器控制
- 字体颜色：主文字 `#e8f4fd`，次要文字 `#8eb8d8`
- 网格线颜色：`rgba(255,255,255,0.08)`（低对比度，不抢主图）
- 折线/高亮颜色推荐：青 `#00d4ff`、绿 `#00ff88`、橙 `#ff9f43`、红 `#ff6b6b`
- 轮播 tooltip 必须在 `onUnmounted` 清除 `setInterval`
- 数据刷新间隔建议：实时数据 3-5 秒，汇总数据 30-60 秒
- 大屏缩放适配用 CSS `transform: scale()` + `transform-origin: left top`，不要在 ECharts 内处理
- 所有 `echarts.init` 必须通过 `useChart` hook，禁止裸调
