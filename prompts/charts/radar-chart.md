# 雷达图提示词（Radar Chart）

> 所有图表必须基于：
> - 组件：`src/ai-kit/charts/BaseChart.vue`
> - 数据请求：`src/ai-kit/hooks/useRequest.ts`

---

## 场景一：单对象能力雷达图

```
参考：
  - src/ai-kit/charts/BaseChart.vue
  - src/ai-kit/hooks/useRequest.ts

生成「员工综合能力评估」雷达图 EmployeeRadarChart.vue：
  接口：getEmployeeAbility(empId)，返回 { name, scores: {dim: string, value: number, max: number}[] }
  维度：技术能力、沟通协作、执行力、创新思维、学习成长（每项 max 100）
  要求：
    - 单系列雷达图，填充色半透明（areaStyle opacity: 0.3）
    - 各维度顶点显示维度名称和当前分值
    - 图表中心显示员工姓名
    - props 传入 empId，切换员工时重新请求刷新图表
    - 使用 BaseChart + useRequest，watch empId 触发 run(empId)

ECharts option 结构参考：
{
  radar: {
    indicator: scores.map(s => ({ name: s.dim, max: s.max })),
    radius: '65%',
    axisName: { color: '#606266', fontSize: 12 },
    splitArea: { areaStyle: { color: ['rgba(64,158,255,0.04)', 'rgba(64,158,255,0.08)'] } }
  },
  series: [{
    type: 'radar',
    data: [{
      name: empName,
      value: scores.map(s => s.value),
      areaStyle: { opacity: 0.3 },
      lineStyle: { width: 2 },
      symbol: 'circle',
      symbolSize: 6
    }]
  }]
}
```

---

## 场景二：多对象对比雷达图

```
参考：
  - src/ai-kit/charts/BaseChart.vue
  - src/ai-kit/hooks/useRequest.ts

生成「竞品多维度对比」雷达图 CompetitorRadarChart.vue：
  接口：getCompetitorAnalysis()
  返回：{ indicators: {name,max}[], products: [{name, scores: number[]}] }
  维度：价格竞争力、质量、售后服务、市场占有率、品牌影响力
  要求：
    - 最多3个系列（超出取前3），颜色各异
    - 图例在底部，可点击高亮对应系列
    - 悬停 tooltip 显示维度名 + 各产品得分
    - 线型区分：第1个实线，第2个虚线（lineStyle.type: 'dashed'）
    - 使用 BaseChart + useRequest

ECharts option 结构参考：
{
  legend: { bottom: 8, data: products.map(p => p.name) },
  tooltip: { trigger: 'item' },
  radar: { indicator: indicators, radius: '60%' },
  series: [{
    type: 'radar',
    data: products.slice(0, 3).map((p, i) => ({
      name: p.name,
      value: p.scores,
      lineStyle: { type: i === 0 ? 'solid' : 'dashed' },
      areaStyle: { opacity: 0.15 }
    }))
  }]
}
```

---

## 通用注意事项

- 维度数量建议 **5-8 个**，过少失去雷达意义，过多导致重叠混乱
- 各维度 `max` 值统一时可简化，不统一时必须逐维度设置
- 多系列时 `areaStyle.opacity` 降到 0.1-0.2，避免遮挡
- 不要用雷达图展示有序序列数据（那是折线图的职责）
