# 散点图提示词（Scatter Chart）

> 所有图表必须基于：
> - 组件：`src/ai-kit/charts/BaseChart.vue`
> - 数据请求：`src/ai-kit/hooks/useRequest.ts`

---

## 场景一：基础散点图（两维度相关性）

```
参考：
  - src/ai-kit/charts/BaseChart.vue
  - src/ai-kit/hooks/useRequest.ts

生成「广告投入 vs 销售额相关性」散点图 AdSalesScatterChart.vue：
  接口：getAdSalesData()，返回 [{ adCost: number, sales: number, label: string }]
  要求：
    - X 轴：广告投入（万元），Y 轴：销售额（万元）
    - 每个点显示对应产品/地区名称（label position: 'right'，仅在悬停时显示）
    - 显示趋势回归线（用 markLine 线性回归近似，或用 series type:'line' 覆盖拟合点）
    - 点大小固定 symbolSize: 12，颜色统一
    - tooltip 显示标签名 + X 值 + Y 值
    - 使用 BaseChart + useRequest

ECharts option 结构参考：
{
  tooltip: {
    trigger: 'item',
    formatter: ({ data }) => `${data[2]}<br/>广告：${data[0]}万<br/>销售：${data[1]}万`
  },
  xAxis: { type: 'value', name: '广告投入(万)', nameLocation: 'end' },
  yAxis: { type: 'value', name: '销售额(万)', nameLocation: 'end' },
  series: [{
    type: 'scatter',
    data: data.map(d => [d.adCost, d.sales, d.label]),
    symbolSize: 12,
    emphasis: { label: { show: true, formatter: ({ data }) => data[2], position: 'right' } }
  }]
}
```

---

## 场景二：气泡图（三维度：X/Y/气泡大小）

```
参考：
  - src/ai-kit/charts/BaseChart.vue
  - src/ai-kit/hooks/useRequest.ts

生成「城市 GDP / 人口 / 面积」气泡图 CityBubbleChart.vue：
  接口：getCityData()，返回 [{ city, gdp, population, area }]
  要求：
    - X 轴：GDP（亿元），Y 轴：人均 GDP，气泡大小：人口数量
    - symbolSize 映射人口到 10-60 像素范围（需归一化）
    - 气泡颜色按区域分组（华东/华南/华北等，图例区分）
    - tooltip 详细展示：城市名、GDP、人口、面积
    - 气泡过密时启用 tooltip.enterable 防止遮挡
    - 使用 BaseChart + useRequest

ECharts option 结构参考：
{
  tooltip: {
    formatter: ({ data }) =>
      `城市：${data.city}<br/>GDP：${data.gdp}亿<br/>人口：${data.pop}万<br/>面积：${data.area}km²`
  },
  series: regions.map(region => ({
    name: region.name,
    type: 'scatter',
    data: region.cities.map(c => ({
      value: [c.gdp, c.perGdp, c.population],
      city: c.city, gdp: c.gdp, pop: c.population, area: c.area
    })),
    symbolSize: (data) => {
      // 归一化到 10-60
      return 10 + (data[2] - minPop) / (maxPop - minPop) * 50
    }
  }))
}
```

---

## 通用注意事项

- 数据点超过 **500** 时建议开启 `large: true` 和 `largeThreshold: 500`
- 气泡大小归一化公式：`minSize + (val - min) / (max - min) * (maxSize - minSize)`
- 散点图坐标轴设置合理的 `min/max` 留白，避免点贴近边缘
- 多系列散点图用图例区分颜色，不要在单系列内用随机色
