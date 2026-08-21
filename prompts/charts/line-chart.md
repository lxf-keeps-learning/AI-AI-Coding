# 折线图提示词（Line Chart）

> 所有图表必须基于：
> - 组件：`src/ai-kit/charts/BaseChart.vue`
> - Hook（需要实例控制）：`src/ai-kit/hooks/useChart.ts`
> - 数据请求：`src/ai-kit/hooks/useRequest.ts`

---

## 场景一：基础趋势折线图

```
参考：
  - src/ai-kit/charts/BaseChart.vue
  - src/ai-kit/hooks/useRequest.ts

生成「访问趋势」折线图组件 VisitTrendChart.vue：
  接口：getVisitTrend({ startDate, endDate }) → { dates: string[], pv: number[], uv: number[] }
  要求：
    - X 轴：日期，Y 轴：数量
    - 两条折线：PV、UV，区分颜色，图例可切换
    - 支持时间范围切换（近7天/近30天/自定义），切换后重新请求
    - loading / 空状态
    - 数据更新时平滑过渡，避免重复 setOption
    - 使用 BaseChart + useRequest（immediate: true）

ECharts option 结构参考：
{
  tooltip: { trigger: 'axis' },
  legend: { top: 8, data: ['PV', 'UV'] },
  grid: { left: 60, right: 20, top: 50, bottom: 40 },
  xAxis: { type: 'category', data: dates, boundaryGap: false },
  yAxis: { type: 'value' },
  series: [
    { name: 'PV', type: 'line', data: pv, smooth: true, symbol: 'circle' },
    { name: 'UV', type: 'line', data: uv, smooth: true, symbol: 'circle' }
  ]
}
```

---

## 场景二：多系列 + 大数据量折线图

```
参考：
  - src/ai-kit/charts/BaseChart.vue
  - src/ai-kit/hooks/useChart.ts
  - src/ai-kit/hooks/useRequest.ts

生成「设备指标监控」多系列折线图 DeviceMetricChart.vue：
  接口：getDeviceMetrics({ deviceId, range }) → { timestamps: string[], metrics: [{ name, data }] }
  要求：
    - 3+ 条指标折线，series 由 metrics 数组动态生成
    - 数据量大时：
      - 开启采样（sampling: 'lttb'）
      - 增量更新用 appendData 而非全量 setOption
      - 用 useChart 手动控制实例
    - X 轴时间刻度按需格式化，避免标签重叠
    - 组件销毁时 dispose 实例、清理定时器，防止内存泄漏
    - 使用 BaseChart + useChart + useRequest

ECharts option 结构参考：
{
  tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
  grid: { left: 60, right: 20, top: 50, bottom: 60 },
  xAxis: { type: 'time', axisLabel: { hideOverlap: true } },
  yAxis: { type: 'value' },
  series: metrics.map(m => ({
    name: m.name,
    type: 'line',
    data: m.data,
    sampling: 'lttb',
    connectNulls: true
  }))
}
```

---

## 场景三：实时刷新折线图（滚动窗口）

```
参考：
  - src/ai-kit/charts/BaseChart.vue
  - src/ai-kit/hooks/useChart.ts

生成「实时吞吐」折线图 RealtimeThroughputChart.vue：
  接口：getRealtimeData()，返回 { time: string, value: number }
  要求：
    - 每 5 秒轮询一次，保留最新 50 条数据窗口
    - 用 useChart 手动控制，appendData 增量更新
    - 坐标轴滚动，始终显示最新时间窗口（xAxis min/max 跟随窗口）
    - onUnmounted 清除定时器并 dispose 实例
    - 页面不可见时（document.hidden）暂停轮询，恢复后继续
    - loading 仅在首帧显示，刷新过程不闪 loading
```

---

## 通用注意事项

- 数据更新时间范围变化时重置 X 轴窗口，避免旧窗口残留
- 大数据量必须开 sampling 或降采样，禁止裸渲全量点
- 双 Y 轴等组合场景参照 `prompts/charts/bar-chart.md` 组合图写法
- `boundaryGap: false` 是折线图贴边标配（柱状图才是 true）
- 有定时器/轮询的图表，组件卸载必须清理，避免内存泄漏
