# 饼图提示词（Pie Chart）

> 所有图表必须基于：
> - 组件：`src/ai-kit/charts/BaseChart.vue`
> - Hook（需要实例控制）：`src/ai-kit/hooks/useChart.ts`
> - 数据请求：`src/ai-kit/hooks/useRequest.ts`

---

## 场景一：基础环形饼图（推荐替代实心饼图）

```
参考：
  - src/ai-kit/charts/BaseChart.vue
  - src/ai-kit/hooks/useRequest.ts

生成「订单状态分布」环形饼图组件 OrderStatusChart.vue：
  接口：getOrderStatusStat()，返回 [{ name: string, value: number }]
  要求：
    - 环形饼图（radius: ['45%', '70%']），中心显示总数和"总订单"文字
    - 图例在右侧竖排，显示名称 + 数量 + 占比
    - 鼠标悬停扇区放大（selectedMode: 'single' 或 emphasis scale）
    - tooltip 显示名称、数量、占比（保留2位小数）
    - 小于 2% 的扇区合并为「其他」，合并阈值可配置
    - 数据为空时显示空状态（BaseChart 内置）
    - 使用 BaseChart + useRequest

ECharts option 结构参考：
{
  tooltip: {
    trigger: 'item',
    formatter: ({ name, value, percent }) =>
      `${name}<br/>数量：${value}<br/>占比：${percent}%`
  },
  legend: {
    orient: 'vertical', right: 20, top: 'center',
    formatter: (name) => {
      const item = data.find(d => d.name === name)
      const pct = ((item.value / total) * 100).toFixed(1)
      return `${name}  ${item.value}  ${pct}%`
    }
  },
  series: [{
    type: 'pie',
    radius: ['45%', '70%'],
    center: ['40%', '50%'],
    data: mergedData,   // 合并小扇区后的数据
    emphasis: { scale: true, scaleSize: 6 },
    label: { show: false },
    labelLine: { show: false }
  }],
  graphic: [{   // 中心文字
    type: 'text', left: '38%', top: '44%',
    style: { text: total.toString(), fontSize: 24, fontWeight: 'bold', fill: '#303133' }
  }, {
    type: 'text', left: '37%', top: '54%',
    style: { text: '总订单', fontSize: 13, fill: '#909399' }
  }]
}
```

---

## 场景二：实心饼图 + 引导线标签

```
参考：
  - src/ai-kit/charts/BaseChart.vue
  - src/ai-kit/hooks/useRequest.ts

生成「用户来源分布」饼图 UserSourceChart.vue：
  接口：getUserSourceStat()，返回 [{ name, value }]
  数据：直接访问、搜索引擎、社交媒体、广告投放、其他
  要求：
    - 实心饼图，不同扇区明显色差
    - 标签通过引导线显示在外侧：名称 + 百分比（如「搜索引擎 34.5%」）
    - 扇区 < 5% 时隐藏标签，只在 tooltip 显示
    - 图例在底部横排
    - 点击扇区高亮，再次点击取消
    - 使用 BaseChart + useRequest

ECharts option 结构参考：
{
  legend: { bottom: 8, orient: 'horizontal' },
  series: [{
    type: 'pie',
    radius: '65%',
    center: ['50%', '46%'],
    data,
    label: {
      show: true,
      formatter: ({ name, percent }) =>
        percent < 5 ? '' : `${name}\n${percent}%`,
      lineHeight: 18
    },
    labelLine: { show: true, length: 15, length2: 10 },
    emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.3)' } }
  }]
}
```

---

## 场景三：南丁格尔玫瑰图（面积体现大小）

```
参考：
  - src/ai-kit/charts/BaseChart.vue
  - src/ai-kit/hooks/useRequest.ts

生成「各产品线贡献度」玫瑰图 ProductRoseChart.vue：
  接口：getProductContrib()，返回 [{ name, value }]（5-8 个类目）
  要求：
    - 使用 roseType: 'area'（面积模式，等角度不等半径）
    - 标签显示在扇区内，名称换行后显示数值
    - 图例在左侧，鼠标悬停图例高亮对应扇区
    - 支持 dark mode（颜色跟随主题）
    - 使用 BaseChart + useRequest

ECharts option 结构参考：
{
  legend: { orient: 'vertical', left: 20, top: 'center' },
  series: [{
    type: 'pie',
    roseType: 'area',
    radius: ['20%', '70%'],
    center: ['60%', '50%'],
    data: data.sort((a, b) => a.value - b.value),  // 从小到大排列更美观
    label: {
      show: true,
      formatter: ({ name, value, percent }) => `{a|${name}}\n{b|${value} (${percent}%)}`,
      rich: { a: { fontSize: 12 }, b: { fontSize: 11, color: '#909399' } }
    },
    itemStyle: { borderRadius: 4, borderWidth: 2, borderColor: '#fff' }
  }]
}
```

---

## 场景四：嵌套双环图（内外层对比）

```
参考：
  - src/ai-kit/charts/BaseChart.vue
  - src/ai-kit/hooks/useRequest.ts

生成「本期 vs 上期 销售结构」嵌套双环图 CompareRingChart.vue：
  接口：getSalesCompare()，返回 { current: [{name,value}], last: [{name,value}] }
  要求：
    - 外环：本期数据（radius: ['55%','70%']）
    - 内环：上期数据（radius: ['35%','50%']）
    - 两环颜色系列相同（通过 color 统一配置），透明度内深外浅
    - 图例区分本期/上期标签，点击可同时控制内外环
    - tooltip 展示内外环同名扇区的对比数据
    - 使用 BaseChart + useRequest

ECharts option 结构参考：
{
  legend: { data: ['本期-A', '本期-B', '上期-A', '上期-B'], top: 8 },
  series: [
    {
      name: '本期', type: 'pie',
      radius: ['55%', '70%'],
      data: current.map(d => ({ ...d, name: `本期-${d.name}` })),
      label: { position: 'outer', formatter: '{b}: {d}%' }
    },
    {
      name: '上期', type: 'pie',
      radius: ['35%', '50%'],
      data: last.map(d => ({ ...d, name: `上期-${d.name}` })),
      label: { show: false }
    }
  ]
}
```

---

## 通用注意事项

- **超过 8 个类目**时，饼图可读性差，改用横向柱状排名图
- 小扇区（< 3%）合并为「其他」，避免引导线交叉混乱
- 不要使用 3D 饼图，视觉会造成比例误导
- `tooltip.confine: true` 防止弹出层超出容器
- 颜色方案与项目主题色保持一致，不硬编码颜色数组
- 环形图中心文字用 `graphic` 组件实现，不要用 `title`（定位不准）
