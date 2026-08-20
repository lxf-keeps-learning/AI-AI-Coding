# 仪表盘提示词（Gauge Chart）

> 所有图表必须基于：
> - 组件：`src/ai-kit/charts/BaseChart.vue`
> - Hook（需要实例控制）：`src/ai-kit/hooks/useChart.ts`
> - 数据请求：`src/ai-kit/hooks/useRequest.ts`

---

## 场景一：单指针仪表盘（KPI 完成率）

```
参考：
  - src/ai-kit/charts/BaseChart.vue
  - src/ai-kit/hooks/useRequest.ts

生成「季度目标完成率」仪表盘组件 KpiGaugeChart.vue：
  接口：getKpiProgress()，返回 { value: number, target: number }（value 当前值，target 目标）
  要求：
    - 仪表盘显示完成率（百分比），0-100 范围
    - 分三段着色：0-60 红色，60-80 橙色，80-100 绿色（axisLine.lineStyle.color 分段）
    - 指针颜色跟随当前段颜色
    - 中心显示：大字完成率数值 + 小字「目标 {target}万」
    - 刻度线只保留 0/20/40/60/80/100 关键刻度（splitNumber: 5）
    - 使用 BaseChart + useRequest（immediate: true）

ECharts option 结构参考：
{
  series: [{
    type: 'gauge',
    startAngle: 200, endAngle: -20,  // 仪表盘开口角度
    min: 0, max: 100,
    splitNumber: 5,
    axisLine: {
      lineStyle: {
        width: 20,
        color: [[0.6, '#ff4d4f'], [0.8, '#faad14'], [1, '#52c41a']]
      }
    },
    pointer: { itemStyle: { color: 'auto' } },
    axisTick: { distance: -25, length: 6, lineStyle: { color: '#fff', width: 1 } },
    splitLine: { distance: -30, length: 12, lineStyle: { color: '#fff', width: 2 } },
    axisLabel: { color: 'auto', distance: 10, fontSize: 12 },
    detail: {
      valueAnimation: true,
      formatter: '{value}%',
      fontSize: 28, fontWeight: 'bold',
      offsetCenter: [0, '20%']
    },
    data: [{ value: completionRate, name: `目标 ${target}万` }]
  }]
}
```

---

## 场景二：多指针仪表盘（多指标对比）

```
参考：
  - src/ai-kit/charts/BaseChart.vue
  - src/ai-kit/hooks/useRequest.ts

生成「服务器三项指标」多指针仪表盘 ServerMetricsChart.vue：
  接口：getServerMetrics()，返回 { cpu: number, memory: number, disk: number }（均为0-100）
  要求：
    - 单个仪表盘，三根指针分别显示 CPU、内存、磁盘使用率
    - 指针颜色各异（蓝/橙/绿），图例在底部说明对应关系
    - 超过 90 时指针颜色变红（itemStyle: { color: val > 90 ? '#ff4d4f' : 默认色 }）
    - 每5秒自动刷新（setInterval + refresh()）
    - 使用 BaseChart + useRequest

ECharts option 结构参考：
{
  series: [{
    type: 'gauge',
    min: 0, max: 100,
    axisLine: { lineStyle: { width: 15, color: [[1, '#e8e8e8']] } },
    progress: { show: true, width: 15 },
    data: [
      { value: cpu, name: 'CPU', itemStyle: { color: cpu > 90 ? '#ff4d4f' : '#1677ff' } },
      { value: memory, name: '内存', itemStyle: { color: memory > 90 ? '#ff4d4f' : '#fa8c16' } },
      { value: disk, name: '磁盘', itemStyle: { color: disk > 90 ? '#ff4d4f' : '#52c41a' } }
    ],
    detail: { show: false },  // 多指针时关闭中心数值，用 title 显示
    title: { fontSize: 11 }
  }]
}
```

---

## 场景三：进度环仪表盘（现代风格）

```
参考：
  - src/ai-kit/charts/BaseChart.vue
  - src/ai-kit/hooks/useRequest.ts

生成「项目进度」进度环仪表盘 ProjectProgressChart.vue：
  接口：getProjectProgress(projectId)，返回 { percent: number, status: 'normal'|'warning'|'danger' }
  要求：
    - 圆形进度环（startAngle: 90, endAngle: -270，360度闭合圆）
    - 轨道色浅灰，进度色：normal 蓝，warning 橙，danger 红
    - 中心大字显示百分比，下方小字显示状态文字
    - 无刻度线、无轴标签（纯视觉进度条）
    - 变化时有动画（ECharts 仪表盘默认有 valueAnimation）
    - 使用 BaseChart + useRequest，watch projectId

ECharts option 结构参考：
{
  series: [{
    type: 'gauge',
    startAngle: 90, endAngle: -270,
    pointer: { show: false },
    progress: { show: true, overlap: false, roundCap: true, clip: false,
      itemStyle: { color: statusColorMap[status] } },
    axisLine: { lineStyle: { width: 18, color: [[1, '#f0f0f0']] } },
    splitLine: { show: false },
    axisTick: { show: false },
    axisLabel: { show: false },
    data: [{ value: percent }],
    detail: {
      valueAnimation: true,
      offsetCenter: [0, '0%'],
      fontSize: 30, fontWeight: 'bold',
      formatter: '{value}%',
      color: statusColorMap[status]
    }
  }]
}
```

---

## 通用注意事项

- 进度环（360度圆）设置 `startAngle: 90, endAngle: -270`
- 标准仪表盘开口朝下建议 `startAngle: 225, endAngle: -45`
- `valueAnimation: true` 开启数值跳动动画效果更好
- 多指针场景各指针颜色必须明显区分，且配图例说明
- 实时刷新场景用 `setInterval` + `onUnmounted` 清除，避免内存泄漏
