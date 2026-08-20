# 柱状图提示词（Bar Chart）

> 所有图表必须基于：
> - 组件：`src/ai-kit/charts/BaseChart.vue`
> - Hook（需要实例控制）：`src/ai-kit/hooks/useChart.ts`
> - 数据请求：`src/ai-kit/hooks/useRequest.ts`

---

## 场景一：基础柱状图（纵向）

```
参考：
  - src/ai-kit/charts/BaseChart.vue
  - src/ai-kit/hooks/useRequest.ts

生成「各月销售额」柱状图组件 MonthlySalesChart.vue：
  接口：getMonthlySales(year)，返回 { months: string[], values: number[] }
  要求：
    - X 轴：月份（1月-12月），Y 轴：金额（万元，保留1位小数）
    - 柱子顶部显示具体数值标签（label position: 'top'）
    - 柱子颜色渐变（从主色 opacity 1 到 opacity 0.6 的纵向渐变）
    - 鼠标悬停高亮柱子，tooltip 显示月份 + 金额
    - 数据为空时显示空状态
    - 使用 BaseChart + useRequest（immediate: true）

ECharts option 结构参考：
{
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  grid: { left: 60, right: 20, top: 50, bottom: 40 },
  xAxis: { type: 'category', data: months },
  yAxis: { type: 'value', name: '金额(万元)', axisLabel: { formatter: '{value}万' } },
  series: [{
    type: 'bar',
    data: values,
    barMaxWidth: 50,
    label: { show: true, position: 'top', formatter: '{c}万' },
    itemStyle: {
      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: '#4e9cf5' },
        { offset: 1, color: '#4e9cf588' }
      ])
    }
  }]
}
```

---

## 场景二：横向排名柱状图

```
参考：
  - src/ai-kit/charts/BaseChart.vue
  - src/ai-kit/hooks/useRequest.ts

生成「各部门绩效排名」横向柱状图 DeptRankChart.vue：
  接口：getDeptRank()，返回 [{ deptName: string, score: number }]（按 score 降序）
  要求：
    - Y 轴：部门名称，X 轴：得分（0-100）
    - 按得分从高到低排列（ECharts 数组需反转，Y 轴 inverse: false）
    - 柱子颜色按分段：≥90 绿色，60-90 蓝色，<60 红色（itemStyle 条件着色）
    - 柱子右侧显示具体分值标签
    - 部门超过 10 个时固定图表高度并开启 dataZoom（type: 'slider', orient: 'vertical'）
    - 使用 BaseChart + useRequest

ECharts option 结构参考：
{
  grid: { left: 120, right: 80, top: 20, bottom: 20 },
  xAxis: { type: 'value', max: 100 },
  yAxis: { type: 'category', data: deptNames, axisLabel: { width: 100, overflow: 'truncate' } },
  series: [{
    type: 'bar',
    data: scores.map(s => ({
      value: s,
      itemStyle: { color: s >= 90 ? '#52c41a' : s >= 60 ? '#1677ff' : '#ff4d4f' }
    })),
    label: { show: true, position: 'right', formatter: '{c}分' },
    barMaxWidth: 30
  }]
}
```

---

## 场景三：分组 + 堆叠柱状图

```
参考：
  - src/ai-kit/charts/BaseChart.vue
  - src/ai-kit/hooks/useRequest.ts

生成「季度收入结构分析」分组堆叠图 QuarterRevenueChart.vue：
  接口：getQuarterRevenue()
  返回：{ quarters: string[], categories: [{ name, data }] }
  分组：Q1/Q2/Q3/Q4，每组堆叠：产品收入、服务收入、其他收入
  要求：
    - 同季度的三类收入堆叠显示
    - 顶部显示该季度总收入标注（markPoint 或 label）
    - 图例可点击切换显示/隐藏
    - tooltip 显示各类收入和小计
    - 使用 BaseChart + useRequest

ECharts option 结构参考：
{
  legend: { top: 8 },
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    formatter: (params) => {
      const total = params.reduce((s, p) => s + p.value, 0)
      const rows = params.map(p => `${p.marker}${p.seriesName}: ${p.value}万`)
      return [params[0].name, ...rows, `合计: ${total}万`].join('<br/>')
    }
  },
  series: categories.map(cat => ({
    name: cat.name,
    type: 'bar',
    stack: 'revenue',
    data: cat.data,
    emphasis: { focus: 'series' }
  }))
}
```

---

## 场景四：折线柱状组合图（双 Y 轴）

```
参考：
  - src/ai-kit/charts/BaseChart.vue
  - src/ai-kit/hooks/useRequest.ts

生成「销售额与增长率」组合图 SalesComboChart.vue：
  接口：getSalesCombo()
  返回：{ months, sales: number[], growthRate: number[] }
  要求：
    - 左 Y 轴：销售额（柱状，万元）
    - 右 Y 轴：增长率（折线，百分比，可为负值）
    - 增长率折线：正值绿色，负值红色（用 markPoint 或 itemStyle 条件着色）
    - 双 Y 轴刻度对齐（通过 min/max/interval 手动对齐或使用 splitNumber）
    - tooltip 合并两条系列
    - 使用 BaseChart + useRequest

ECharts option 结构参考：
{
  tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
  legend: { top: 8, data: ['销售额', '增长率'] },
  yAxis: [
    { type: 'value', name: '销售额(万)', position: 'left' },
    { type: 'value', name: '增长率(%)', position: 'right',
      axisLabel: { formatter: '{value}%' } }
  ],
  series: [
    { name: '销售额', type: 'bar', yAxisIndex: 0, data: sales, barMaxWidth: 50 },
    {
      name: '增长率', type: 'line', yAxisIndex: 1, data: growthRate,
      smooth: true, symbol: 'circle',
      itemStyle: {
        color: (params) => params.value >= 0 ? '#52c41a' : '#ff4d4f'
      }
    }
  ]
}
```

---

## 通用注意事项

- `barMaxWidth` 建议设为 `48` 或 `56`，避免数据少时柱子过宽
- 类目过多（>12）时改用横向柱状图或开启 `dataZoom`
- 堆叠柱状图必须设置相同的 `stack` 值，否则不堆叠
- 数值标签与柱子重叠时调低 `barCategoryGap` 或减小字号
- `tooltip.axisPointer.type: 'shadow'` 是柱状图的标准悬停效果
- 双 Y 轴场景 `tooltip` 设置 `axisPointer.type: 'cross'` 更直观
