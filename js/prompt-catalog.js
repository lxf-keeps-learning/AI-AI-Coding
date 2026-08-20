// 此文件由 scripts/build-prompt-catalog.js 自动生成，请勿手动修改。
window.PROMPT_CATALOG = [
  {
    "id": "charts-chart",
    "category": "charts",
    "path": "charts/chart.md",
    "title": "Chart 图表提示词",
    "preview": "Chart 图表提示词 折线图（趋势） 参考： - src/ai-kit/charts/BaseChart.vue - src/ai-kit/hooks/useRequest.ts 生成「访问趋势」折线图组件： - 调用 getVisitTrend({ startDate, en",
    "content": "# Chart 图表提示词\n\n## 折线图（趋势）\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n  - src/ai-kit/hooks/useRequest.ts\n\n生成「访问趋势」折线图组件：\n  - 调用 getVisitTrend({ startDate, endDate }) 接口\n  - 多条折线：PV、UV、IP\n  - X 轴：日期，Y 轴：数量\n  - 支持时间范围切换（近7天/近30天/自定义）\n  - 使用 BaseChart + useRequest，loading 状态\n```\n\n## 柱状图（对比）\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n  - src/ai-kit/hooks/useRequest.ts\n\n生成「各部门销售额」柱状图：\n  - 调用 getSalesByDept() 接口\n  - 横向柱状图（yAxis: category）\n  - 数据标签显示在柱子右侧\n  - 颜色渐变，响应式 resize\n  - 使用 BaseChart 组件\n```\n\n## 饼图（占比）\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n  - src/ai-kit/hooks/useRequest.ts\n\n生成「订单状态分布」饼图：\n  - 调用 getOrderStatusStat() 接口，返回 [{ name, value }]\n  - 环形饼图（内半径 60%），中心显示总数\n  - 图例在右侧，支持点击高亮\n  - 使用 BaseChart + useRequest\n```\n\n## 大屏图表（实时刷新）\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n  - src/ai-kit/hooks/useChart.ts\n\n生成「实时监控」大屏图表（折线，最新50条数据）：\n  - 每5秒调用 getRealtimeData() 刷新\n  - 用 useChart hook 手动控制（需要 appendData 增量更新）\n  - 组件销毁时清除定时器（onUnmounted）\n  - 坐标轴滚动，始终显示最新时间窗口\n```\n\n## 组合图表（折线 + 柱状）\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n\n生成「营收分析」组合图表：\n  - 柱状：各月营收金额\n  - 折线：环比增长率（双 Y 轴）\n  - tooltip 合并显示\n  - 使用 BaseChart 组件，:option 传入 computed\n```"
  },
  {
    "id": "charts-gauge-chart",
    "category": "charts",
    "path": "charts/gauge-chart.md",
    "title": "仪表盘提示词（Gauge Chart）",
    "preview": "仪表盘提示词（Gauge Chart） > 所有图表必须基于： > - 组件：`src/ai-kit/charts/BaseChart.vue` > - Hook（需要实例控制）：`src/ai-kit/hooks/useChart.ts` > - 数据请求：`src/ai-ki",
    "content": "# 仪表盘提示词（Gauge Chart）\n\n> 所有图表必须基于：\n> - 组件：`src/ai-kit/charts/BaseChart.vue`\n> - Hook（需要实例控制）：`src/ai-kit/hooks/useChart.ts`\n> - 数据请求：`src/ai-kit/hooks/useRequest.ts`\n\n---\n\n## 场景一：单指针仪表盘（KPI 完成率）\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n  - src/ai-kit/hooks/useRequest.ts\n\n生成「季度目标完成率」仪表盘组件 KpiGaugeChart.vue：\n  接口：getKpiProgress()，返回 { value: number, target: number }（value 当前值，target 目标）\n  要求：\n    - 仪表盘显示完成率（百分比），0-100 范围\n    - 分三段着色：0-60 红色，60-80 橙色，80-100 绿色（axisLine.lineStyle.color 分段）\n    - 指针颜色跟随当前段颜色\n    - 中心显示：大字完成率数值 + 小字「目标 {target}万」\n    - 刻度线只保留 0/20/40/60/80/100 关键刻度（splitNumber: 5）\n    - 使用 BaseChart + useRequest（immediate: true）\n\nECharts option 结构参考：\n{\n  series: [{\n    type: 'gauge',\n    startAngle: 200, endAngle: -20,  // 仪表盘开口角度\n    min: 0, max: 100,\n    splitNumber: 5,\n    axisLine: {\n      lineStyle: {\n        width: 20,\n        color: [[0.6, '#ff4d4f'], [0.8, '#faad14'], [1, '#52c41a']]\n      }\n    },\n    pointer: { itemStyle: { color: 'auto' } },\n    axisTick: { distance: -25, length: 6, lineStyle: { color: '#fff', width: 1 } },\n    splitLine: { distance: -30, length: 12, lineStyle: { color: '#fff', width: 2 } },\n    axisLabel: { color: 'auto', distance: 10, fontSize: 12 },\n    detail: {\n      valueAnimation: true,\n      formatter: '{value}%',\n      fontSize: 28, fontWeight: 'bold',\n      offsetCenter: [0, '20%']\n    },\n    data: [{ value: completionRate, name: `目标 ${target}万` }]\n  }]\n}\n```\n\n---\n\n## 场景二：多指针仪表盘（多指标对比）\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n  - src/ai-kit/hooks/useRequest.ts\n\n生成「服务器三项指标」多指针仪表盘 ServerMetricsChart.vue：\n  接口：getServerMetrics()，返回 { cpu: number, memory: number, disk: number }（均为0-100）\n  要求：\n    - 单个仪表盘，三根指针分别显示 CPU、内存、磁盘使用率\n    - 指针颜色各异（蓝/橙/绿），图例在底部说明对应关系\n    - 超过 90 时指针颜色变红（itemStyle: { color: val > 90 ? '#ff4d4f' : 默认色 }）\n    - 每5秒自动刷新（setInterval + refresh()）\n    - 使用 BaseChart + useRequest\n\nECharts option 结构参考：\n{\n  series: [{\n    type: 'gauge',\n    min: 0, max: 100,\n    axisLine: { lineStyle: { width: 15, color: [[1, '#e8e8e8']] } },\n    progress: { show: true, width: 15 },\n    data: [\n      { value: cpu, name: 'CPU', itemStyle: { color: cpu > 90 ? '#ff4d4f' : '#1677ff' } },\n      { value: memory, name: '内存', itemStyle: { color: memory > 90 ? '#ff4d4f' : '#fa8c16' } },\n      { value: disk, name: '磁盘', itemStyle: { color: disk > 90 ? '#ff4d4f' : '#52c41a' } }\n    ],\n    detail: { show: false },  // 多指针时关闭中心数值，用 title 显示\n    title: { fontSize: 11 }\n  }]\n}\n```\n\n---\n\n## 场景三：进度环仪表盘（现代风格）\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n  - src/ai-kit/hooks/useRequest.ts\n\n生成「项目进度」进度环仪表盘 ProjectProgressChart.vue：\n  接口：getProjectProgress(projectId)，返回 { percent: number, status: 'normal'|'warning'|'danger' }\n  要求：\n    - 圆形进度环（startAngle: 90, endAngle: -270，360度闭合圆）\n    - 轨道色浅灰，进度色：normal 蓝，warning 橙，danger 红\n    - 中心大字显示百分比，下方小字显示状态文字\n    - 无刻度线、无轴标签（纯视觉进度条）\n    - 变化时有动画（ECharts 仪表盘默认有 valueAnimation）\n    - 使用 BaseChart + useRequest，watch projectId\n\nECharts option 结构参考：\n{\n  series: [{\n    type: 'gauge',\n    startAngle: 90, endAngle: -270,\n    pointer: { show: false },\n    progress: { show: true, overlap: false, roundCap: true, clip: false,\n      itemStyle: { color: statusColorMap[status] } },\n    axisLine: { lineStyle: { width: 18, color: [[1, '#f0f0f0']] } },\n    splitLine: { show: false },\n    axisTick: { show: false },\n    axisLabel: { show: false },\n    data: [{ value: percent }],\n    detail: {\n      valueAnimation: true,\n      offsetCenter: [0, '0%'],\n      fontSize: 30, fontWeight: 'bold',\n      formatter: '{value}%',\n      color: statusColorMap[status]\n    }\n  }]\n}\n```\n\n---\n\n## 通用注意事项\n\n- 进度环（360度圆）设置 `startAngle: 90, endAngle: -270`\n- 标准仪表盘开口朝下建议 `startAngle: 225, endAngle: -45`\n- `valueAnimation: true` 开启数值跳动动画效果更好\n- 多指针场景各指针颜色必须明显区分，且配图例说明\n- 实时刷新场景用 `setInterval` + `onUnmounted` 清除，避免内存泄漏"
  },
  {
    "id": "charts-bigscreen-chart",
    "category": "charts",
    "path": "charts/bigscreen-chart.md",
    "title": "大屏图表提示词（Bigscreen Chart）",
    "preview": "大屏图表提示词（Bigscreen Chart） > 大屏图表必须基于： > - 组件：`src/ai-kit/charts/BaseChart.vue`（简单展示） > - Hook：`src/ai-kit/hooks/useChart.ts`（需要实例控制） > - 数据请求",
    "content": "# 大屏图表提示词（Bigscreen Chart）\n\n> 大屏图表必须基于：\n> - 组件：`src/ai-kit/charts/BaseChart.vue`（简单展示）\n> - Hook：`src/ai-kit/hooks/useChart.ts`（需要实例控制）\n> - 数据请求：`src/ai-kit/hooks/useRequest.ts` 或 WebSocket\n\n---\n\n## 场景一：大屏折线图（实时滚动 + 高对比）\n\n```\n参考：\n  - src/ai-kit/hooks/useChart.ts（需要实例级控制）\n\n生成「实时网络流量」大屏折线图 BigscreenLineChart.vue：\n  接口：轮询 getNetworkFlow()，每5秒更新，保留最近60个点\n  要求：\n    - 深色背景（背景 #0a1929，字体 #e8f4fd，网格线 rgba(255,255,255,0.08)）\n    - 折线为亮青色（#00d4ff），发光效果（shadowBlur: 10，shadowColor 同折线色）\n    - X 轴为时间，滑动窗口显示最近60秒\n    - Y 轴单位自动换算（Kbps/Mbps）\n    - 折线下方半透明渐变填充（蓝色渐变到透明）\n    - 每5秒轮询，onUnmounted 清除定时器\n    - 使用 useChart hook（需要手动 setOption 增量更新）\n\nECharts option 结构参考：\n{\n  backgroundColor: 'transparent',\n  textStyle: { color: '#e8f4fd' },\n  grid: { left: 55, right: 20, top: 30, bottom: 40 },\n  xAxis: {\n    type: 'category', data: times,\n    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },\n    axisLabel: { color: '#8eb8d8' }\n  },\n  yAxis: {\n    type: 'value',\n    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.08)' } },\n    axisLabel: { color: '#8eb8d8', formatter: (v) => v >= 1000 ? `${v/1000}M` : `${v}K` }\n  },\n  series: [{\n    type: 'line', data: values, smooth: true,\n    lineStyle: { color: '#00d4ff', width: 2, shadowBlur: 10, shadowColor: '#00d4ff' },\n    itemStyle: { color: '#00d4ff' },\n    symbol: 'none',\n    areaStyle: {\n      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [\n        { offset: 0, color: 'rgba(0, 212, 255, 0.3)' },\n        { offset: 1, color: 'rgba(0, 212, 255, 0.02)' }\n      ])\n    }\n  }]\n}\n```\n\n---\n\n## 场景二：大屏轮播柱状图（自动高亮）\n\n```\n参考：\n  - src/ai-kit/hooks/useChart.ts\n\n生成「各区域销售额排名」大屏自动轮播柱状图 BigscreenBarChart.vue：\n  接口：getRegionSales()，返回 [{ region, value }]（按值降序）\n  要求：\n    - 横向柱状图，数据条自下而上排列\n    - 深色风格：背景透明，柱子渐变蓝（左亮右暗）\n    - 每3秒自动轮播高亮 tooltip（dispatchAction: 'showTip'）\n    - 柱子右侧数值标签（单位：万元）\n    - 超过8条数据时开启垂直 dataZoom（不显示滑块，仅内部滚动）\n    - 使用 useChart hook\n\n轮播高亮实现：\n// 初始化后开启轮播\nlet currentIndex = 0\nconst timer = setInterval(() => {\n  chart.value?.dispatchAction({ type: 'hideTip' })\n  chart.value?.dispatchAction({\n    type: 'showTip', seriesIndex: 0, dataIndex: currentIndex\n  })\n  chart.value?.dispatchAction({\n    type: 'highlight', seriesIndex: 0, dataIndex: currentIndex\n  })\n  currentIndex = (currentIndex + 1) % data.length\n}, 3000)\nonUnmounted(() => clearInterval(timer))\n```\n\n---\n\n## 场景三：大屏地图热力图\n\n```\n参考：\n  - src/ai-kit/hooks/useChart.ts\n\n生成「全国销售热力地图」BigscreenMapChart.vue：\n  接口：getProvinceSales()，返回 [{ province: string, value: number }]\n  要求：\n    - 中国地图（需提前注册地图 JSON：echarts.registerMap('china', chinaJson)）\n    - 热力色阶：低值蓝色 → 中值绿色 → 高值红色\n    - 省份悬停显示 tooltip：省份名 + 销售额（万元）\n    - 点击省份触发 emit('province-click', provinceName) 联动列表\n    - 地图初始居中，viewControl 支持鼠标拖拽缩放（geo.roam: 'move'）\n    - 深色背景风格\n\nECharts option 结构参考：\n{\n  visualMap: {\n    min: 0, max: maxValue,\n    left: 20, bottom: 40,\n    text: ['高', '低'],\n    inRange: { color: ['#1a3a5c', '#2eb8b8', '#ff6b35'] },\n    textStyle: { color: '#8eb8d8' }\n  },\n  geo: {\n    map: 'china', roam: 'move',\n    itemStyle: { areaColor: '#0c2340', borderColor: '#1a6080', borderWidth: 1 },\n    emphasis: { itemStyle: { areaColor: '#0d6efd' } }\n  },\n  series: [{\n    type: 'map', map: 'china', geoIndex: 0,\n    data: salesData.map(d => ({ name: d.province, value: d.value }))\n  }]\n}\n```\n\n---\n\n## 场景四：大屏数字翻牌器 + 迷你趋势图\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue（迷你折线图）\n  - src/ai-kit/hooks/useRequest.ts\n\n生成「核心指标卡」组件 MetricCard.vue：\n  包含：大字指标值（带数字滚动动画）+ 同比增减标注 + 迷你7日趋势折线图\n  接口：getMetricData(metricKey)，返回 { value, trend: 'up'|'down', rate: number, sparkline: number[] }\n  要求：\n    - 数字用 CSS 或 countTo 动画效果滚动到目标值\n    - 同比：↑ 绿色 / ↓ 红色 + 百分比\n    - 迷你折线图高度 40px，无坐标轴，无 tooltip，纯视觉趋势（sparkline 效果）\n    - 深色卡片风格（背景 rgba(255,255,255,0.05)，边框 rgba(255,255,255,0.1)）\n\n迷你折线 ECharts option：\n{\n  grid: { top: 2, bottom: 2, left: 2, right: 2 },\n  xAxis: { type: 'category', show: false },\n  yAxis: { type: 'value', show: false },\n  series: [{\n    type: 'line', data: sparkline, smooth: true, symbol: 'none',\n    lineStyle: { color: trend === 'up' ? '#52c41a' : '#ff4d4f', width: 1.5 },\n    areaStyle: { opacity: 0.15 }\n  }]\n}\n```\n\n---\n\n## 大屏通用规范\n\n- 所有图表背景 `backgroundColor: 'transparent'`，背景色由容器控制\n- 字体颜色：主文字 `#e8f4fd`，次要文字 `#8eb8d8`\n- 网格线颜色：`rgba(255,255,255,0.08)`（低对比度，不抢主图）\n- 折线/高亮颜色推荐：青 `#00d4ff`、绿 `#00ff88`、橙 `#ff9f43`、红 `#ff6b6b`\n- 轮播 tooltip 必须在 `onUnmounted` 清除 `setInterval`\n- 数据刷新间隔建议：实时数据 3-5 秒，汇总数据 30-60 秒\n- 大屏缩放适配用 CSS `transform: scale()` + `transform-origin: left top`，不要在 ECharts 内处理\n- 所有 `echarts.init` 必须通过 `useChart` hook，禁止裸调"
  },
  {
    "id": "charts-scatter-chart",
    "category": "charts",
    "path": "charts/scatter-chart.md",
    "title": "散点图提示词（Scatter Chart）",
    "preview": "散点图提示词（Scatter Chart） > 所有图表必须基于： > - 组件：`src/ai-kit/charts/BaseChart.vue` > - 数据请求：`src/ai-kit/hooks/useRequest.ts` --- 场景一：基础散点图（两维度相关性） 参",
    "content": "# 散点图提示词（Scatter Chart）\n\n> 所有图表必须基于：\n> - 组件：`src/ai-kit/charts/BaseChart.vue`\n> - 数据请求：`src/ai-kit/hooks/useRequest.ts`\n\n---\n\n## 场景一：基础散点图（两维度相关性）\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n  - src/ai-kit/hooks/useRequest.ts\n\n生成「广告投入 vs 销售额相关性」散点图 AdSalesScatterChart.vue：\n  接口：getAdSalesData()，返回 [{ adCost: number, sales: number, label: string }]\n  要求：\n    - X 轴：广告投入（万元），Y 轴：销售额（万元）\n    - 每个点显示对应产品/地区名称（label position: 'right'，仅在悬停时显示）\n    - 显示趋势回归线（用 markLine 线性回归近似，或用 series type:'line' 覆盖拟合点）\n    - 点大小固定 symbolSize: 12，颜色统一\n    - tooltip 显示标签名 + X 值 + Y 值\n    - 使用 BaseChart + useRequest\n\nECharts option 结构参考：\n{\n  tooltip: {\n    trigger: 'item',\n    formatter: ({ data }) => `${data[2]}<br/>广告：${data[0]}万<br/>销售：${data[1]}万`\n  },\n  xAxis: { type: 'value', name: '广告投入(万)', nameLocation: 'end' },\n  yAxis: { type: 'value', name: '销售额(万)', nameLocation: 'end' },\n  series: [{\n    type: 'scatter',\n    data: data.map(d => [d.adCost, d.sales, d.label]),\n    symbolSize: 12,\n    emphasis: { label: { show: true, formatter: ({ data }) => data[2], position: 'right' } }\n  }]\n}\n```\n\n---\n\n## 场景二：气泡图（三维度：X/Y/气泡大小）\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n  - src/ai-kit/hooks/useRequest.ts\n\n生成「城市 GDP / 人口 / 面积」气泡图 CityBubbleChart.vue：\n  接口：getCityData()，返回 [{ city, gdp, population, area }]\n  要求：\n    - X 轴：GDP（亿元），Y 轴：人均 GDP，气泡大小：人口数量\n    - symbolSize 映射人口到 10-60 像素范围（需归一化）\n    - 气泡颜色按区域分组（华东/华南/华北等，图例区分）\n    - tooltip 详细展示：城市名、GDP、人口、面积\n    - 气泡过密时启用 tooltip.enterable 防止遮挡\n    - 使用 BaseChart + useRequest\n\nECharts option 结构参考：\n{\n  tooltip: {\n    formatter: ({ data }) =>\n      `城市：${data.city}<br/>GDP：${data.gdp}亿<br/>人口：${data.pop}万<br/>面积：${data.area}km²`\n  },\n  series: regions.map(region => ({\n    name: region.name,\n    type: 'scatter',\n    data: region.cities.map(c => ({\n      value: [c.gdp, c.perGdp, c.population],\n      city: c.city, gdp: c.gdp, pop: c.population, area: c.area\n    })),\n    symbolSize: (data) => {\n      // 归一化到 10-60\n      return 10 + (data[2] - minPop) / (maxPop - minPop) * 50\n    }\n  }))\n}\n```\n\n---\n\n## 通用注意事项\n\n- 数据点超过 **500** 时建议开启 `large: true` 和 `largeThreshold: 500`\n- 气泡大小归一化公式：`minSize + (val - min) / (max - min) * (maxSize - minSize)`\n- 散点图坐标轴设置合理的 `min/max` 留白，避免点贴近边缘\n- 多系列散点图用图例区分颜色，不要在单系列内用随机色"
  },
  {
    "id": "charts-bar-chart",
    "category": "charts",
    "path": "charts/bar-chart.md",
    "title": "柱状图提示词（Bar Chart）",
    "preview": "柱状图提示词（Bar Chart） > 所有图表必须基于： > - 组件：`src/ai-kit/charts/BaseChart.vue` > - Hook（需要实例控制）：`src/ai-kit/hooks/useChart.ts` > - 数据请求：`src/ai-kit/",
    "content": "# 柱状图提示词（Bar Chart）\n\n> 所有图表必须基于：\n> - 组件：`src/ai-kit/charts/BaseChart.vue`\n> - Hook（需要实例控制）：`src/ai-kit/hooks/useChart.ts`\n> - 数据请求：`src/ai-kit/hooks/useRequest.ts`\n\n---\n\n## 场景一：基础柱状图（纵向）\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n  - src/ai-kit/hooks/useRequest.ts\n\n生成「各月销售额」柱状图组件 MonthlySalesChart.vue：\n  接口：getMonthlySales(year)，返回 { months: string[], values: number[] }\n  要求：\n    - X 轴：月份（1月-12月），Y 轴：金额（万元，保留1位小数）\n    - 柱子顶部显示具体数值标签（label position: 'top'）\n    - 柱子颜色渐变（从主色 opacity 1 到 opacity 0.6 的纵向渐变）\n    - 鼠标悬停高亮柱子，tooltip 显示月份 + 金额\n    - 数据为空时显示空状态\n    - 使用 BaseChart + useRequest（immediate: true）\n\nECharts option 结构参考：\n{\n  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },\n  grid: { left: 60, right: 20, top: 50, bottom: 40 },\n  xAxis: { type: 'category', data: months },\n  yAxis: { type: 'value', name: '金额(万元)', axisLabel: { formatter: '{value}万' } },\n  series: [{\n    type: 'bar',\n    data: values,\n    barMaxWidth: 50,\n    label: { show: true, position: 'top', formatter: '{c}万' },\n    itemStyle: {\n      color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [\n        { offset: 0, color: '#4e9cf5' },\n        { offset: 1, color: '#4e9cf588' }\n      ])\n    }\n  }]\n}\n```\n\n---\n\n## 场景二：横向排名柱状图\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n  - src/ai-kit/hooks/useRequest.ts\n\n生成「各部门绩效排名」横向柱状图 DeptRankChart.vue：\n  接口：getDeptRank()，返回 [{ deptName: string, score: number }]（按 score 降序）\n  要求：\n    - Y 轴：部门名称，X 轴：得分（0-100）\n    - 按得分从高到低排列（ECharts 数组需反转，Y 轴 inverse: false）\n    - 柱子颜色按分段：≥90 绿色，60-90 蓝色，<60 红色（itemStyle 条件着色）\n    - 柱子右侧显示具体分值标签\n    - 部门超过 10 个时固定图表高度并开启 dataZoom（type: 'slider', orient: 'vertical'）\n    - 使用 BaseChart + useRequest\n\nECharts option 结构参考：\n{\n  grid: { left: 120, right: 80, top: 20, bottom: 20 },\n  xAxis: { type: 'value', max: 100 },\n  yAxis: { type: 'category', data: deptNames, axisLabel: { width: 100, overflow: 'truncate' } },\n  series: [{\n    type: 'bar',\n    data: scores.map(s => ({\n      value: s,\n      itemStyle: { color: s >= 90 ? '#52c41a' : s >= 60 ? '#1677ff' : '#ff4d4f' }\n    })),\n    label: { show: true, position: 'right', formatter: '{c}分' },\n    barMaxWidth: 30\n  }]\n}\n```\n\n---\n\n## 场景三：分组 + 堆叠柱状图\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n  - src/ai-kit/hooks/useRequest.ts\n\n生成「季度收入结构分析」分组堆叠图 QuarterRevenueChart.vue：\n  接口：getQuarterRevenue()\n  返回：{ quarters: string[], categories: [{ name, data }] }\n  分组：Q1/Q2/Q3/Q4，每组堆叠：产品收入、服务收入、其他收入\n  要求：\n    - 同季度的三类收入堆叠显示\n    - 顶部显示该季度总收入标注（markPoint 或 label）\n    - 图例可点击切换显示/隐藏\n    - tooltip 显示各类收入和小计\n    - 使用 BaseChart + useRequest\n\nECharts option 结构参考：\n{\n  legend: { top: 8 },\n  tooltip: {\n    trigger: 'axis',\n    axisPointer: { type: 'shadow' },\n    formatter: (params) => {\n      const total = params.reduce((s, p) => s + p.value, 0)\n      const rows = params.map(p => `${p.marker}${p.seriesName}: ${p.value}万`)\n      return [params[0].name, ...rows, `合计: ${total}万`].join('<br/>')\n    }\n  },\n  series: categories.map(cat => ({\n    name: cat.name,\n    type: 'bar',\n    stack: 'revenue',\n    data: cat.data,\n    emphasis: { focus: 'series' }\n  }))\n}\n```\n\n---\n\n## 场景四：折线柱状组合图（双 Y 轴）\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n  - src/ai-kit/hooks/useRequest.ts\n\n生成「销售额与增长率」组合图 SalesComboChart.vue：\n  接口：getSalesCombo()\n  返回：{ months, sales: number[], growthRate: number[] }\n  要求：\n    - 左 Y 轴：销售额（柱状，万元）\n    - 右 Y 轴：增长率（折线，百分比，可为负值）\n    - 增长率折线：正值绿色，负值红色（用 markPoint 或 itemStyle 条件着色）\n    - 双 Y 轴刻度对齐（通过 min/max/interval 手动对齐或使用 splitNumber）\n    - tooltip 合并两条系列\n    - 使用 BaseChart + useRequest\n\nECharts option 结构参考：\n{\n  tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },\n  legend: { top: 8, data: ['销售额', '增长率'] },\n  yAxis: [\n    { type: 'value', name: '销售额(万)', position: 'left' },\n    { type: 'value', name: '增长率(%)', position: 'right',\n      axisLabel: { formatter: '{value}%' } }\n  ],\n  series: [\n    { name: '销售额', type: 'bar', yAxisIndex: 0, data: sales, barMaxWidth: 50 },\n    {\n      name: '增长率', type: 'line', yAxisIndex: 1, data: growthRate,\n      smooth: true, symbol: 'circle',\n      itemStyle: {\n        color: (params) => params.value >= 0 ? '#52c41a' : '#ff4d4f'\n      }\n    }\n  ]\n}\n```\n\n---\n\n## 通用注意事项\n\n- `barMaxWidth` 建议设为 `48` 或 `56`，避免数据少时柱子过宽\n- 类目过多（>12）时改用横向柱状图或开启 `dataZoom`\n- 堆叠柱状图必须设置相同的 `stack` 值，否则不堆叠\n- 数值标签与柱子重叠时调低 `barCategoryGap` 或减小字号\n- `tooltip.axisPointer.type: 'shadow'` 是柱状图的标准悬停效果\n- 双 Y 轴场景 `tooltip` 设置 `axisPointer.type: 'cross'` 更直观"
  },
  {
    "id": "charts-line-chart",
    "category": "charts",
    "path": "charts/line-chart.md",
    "title": "生成 ECharts 折线图组件：",
    "preview": "生成 ECharts 折线图组件： 要求： - 支持 resize - 自动销毁 - dark mode - loading - 空状态 - data update - tooltip 优化 - 防止内存泄漏 - hooks 化 性能要求： - 避免重复 setOption - ",
    "content": "生成 ECharts 折线图组件：\n\n要求：\n- 支持 resize\n- 自动销毁\n- dark mode\n- loading\n- 空状态\n- data update\n- tooltip 优化\n- 防止内存泄漏\n- hooks 化\n\n性能要求：\n- 避免重复 setOption\n- 大数据节流\n- 支持增量更新"
  },
  {
    "id": "charts-radar-chart",
    "category": "charts",
    "path": "charts/radar-chart.md",
    "title": "雷达图提示词（Radar Chart）",
    "preview": "雷达图提示词（Radar Chart） > 所有图表必须基于： > - 组件：`src/ai-kit/charts/BaseChart.vue` > - 数据请求：`src/ai-kit/hooks/useRequest.ts` --- 场景一：单对象能力雷达图 参考： - sr",
    "content": "# 雷达图提示词（Radar Chart）\n\n> 所有图表必须基于：\n> - 组件：`src/ai-kit/charts/BaseChart.vue`\n> - 数据请求：`src/ai-kit/hooks/useRequest.ts`\n\n---\n\n## 场景一：单对象能力雷达图\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n  - src/ai-kit/hooks/useRequest.ts\n\n生成「员工综合能力评估」雷达图 EmployeeRadarChart.vue：\n  接口：getEmployeeAbility(empId)，返回 { name, scores: {dim: string, value: number, max: number}[] }\n  维度：技术能力、沟通协作、执行力、创新思维、学习成长（每项 max 100）\n  要求：\n    - 单系列雷达图，填充色半透明（areaStyle opacity: 0.3）\n    - 各维度顶点显示维度名称和当前分值\n    - 图表中心显示员工姓名\n    - props 传入 empId，切换员工时重新请求刷新图表\n    - 使用 BaseChart + useRequest，watch empId 触发 run(empId)\n\nECharts option 结构参考：\n{\n  radar: {\n    indicator: scores.map(s => ({ name: s.dim, max: s.max })),\n    radius: '65%',\n    axisName: { color: '#606266', fontSize: 12 },\n    splitArea: { areaStyle: { color: ['rgba(64,158,255,0.04)', 'rgba(64,158,255,0.08)'] } }\n  },\n  series: [{\n    type: 'radar',\n    data: [{\n      name: empName,\n      value: scores.map(s => s.value),\n      areaStyle: { opacity: 0.3 },\n      lineStyle: { width: 2 },\n      symbol: 'circle',\n      symbolSize: 6\n    }]\n  }]\n}\n```\n\n---\n\n## 场景二：多对象对比雷达图\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n  - src/ai-kit/hooks/useRequest.ts\n\n生成「竞品多维度对比」雷达图 CompetitorRadarChart.vue：\n  接口：getCompetitorAnalysis()\n  返回：{ indicators: {name,max}[], products: [{name, scores: number[]}] }\n  维度：价格竞争力、质量、售后服务、市场占有率、品牌影响力\n  要求：\n    - 最多3个系列（超出取前3），颜色各异\n    - 图例在底部，可点击高亮对应系列\n    - 悬停 tooltip 显示维度名 + 各产品得分\n    - 线型区分：第1个实线，第2个虚线（lineStyle.type: 'dashed'）\n    - 使用 BaseChart + useRequest\n\nECharts option 结构参考：\n{\n  legend: { bottom: 8, data: products.map(p => p.name) },\n  tooltip: { trigger: 'item' },\n  radar: { indicator: indicators, radius: '60%' },\n  series: [{\n    type: 'radar',\n    data: products.slice(0, 3).map((p, i) => ({\n      name: p.name,\n      value: p.scores,\n      lineStyle: { type: i === 0 ? 'solid' : 'dashed' },\n      areaStyle: { opacity: 0.15 }\n    }))\n  }]\n}\n```\n\n---\n\n## 通用注意事项\n\n- 维度数量建议 **5-8 个**，过少失去雷达意义，过多导致重叠混乱\n- 各维度 `max` 值统一时可简化，不统一时必须逐维度设置\n- 多系列时 `areaStyle.opacity` 降到 0.1-0.2，避免遮挡\n- 不要用雷达图展示有序序列数据（那是折线图的职责）"
  },
  {
    "id": "charts-pie-chart",
    "category": "charts",
    "path": "charts/pie-chart.md",
    "title": "饼图提示词（Pie Chart）",
    "preview": "饼图提示词（Pie Chart） > 所有图表必须基于： > - 组件：`src/ai-kit/charts/BaseChart.vue` > - Hook（需要实例控制）：`src/ai-kit/hooks/useChart.ts` > - 数据请求：`src/ai-kit/h",
    "content": "# 饼图提示词（Pie Chart）\n\n> 所有图表必须基于：\n> - 组件：`src/ai-kit/charts/BaseChart.vue`\n> - Hook（需要实例控制）：`src/ai-kit/hooks/useChart.ts`\n> - 数据请求：`src/ai-kit/hooks/useRequest.ts`\n\n---\n\n## 场景一：基础环形饼图（推荐替代实心饼图）\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n  - src/ai-kit/hooks/useRequest.ts\n\n生成「订单状态分布」环形饼图组件 OrderStatusChart.vue：\n  接口：getOrderStatusStat()，返回 [{ name: string, value: number }]\n  要求：\n    - 环形饼图（radius: ['45%', '70%']），中心显示总数和\"总订单\"文字\n    - 图例在右侧竖排，显示名称 + 数量 + 占比\n    - 鼠标悬停扇区放大（selectedMode: 'single' 或 emphasis scale）\n    - tooltip 显示名称、数量、占比（保留2位小数）\n    - 小于 2% 的扇区合并为「其他」，合并阈值可配置\n    - 数据为空时显示空状态（BaseChart 内置）\n    - 使用 BaseChart + useRequest\n\nECharts option 结构参考：\n{\n  tooltip: {\n    trigger: 'item',\n    formatter: ({ name, value, percent }) =>\n      `${name}<br/>数量：${value}<br/>占比：${percent}%`\n  },\n  legend: {\n    orient: 'vertical', right: 20, top: 'center',\n    formatter: (name) => {\n      const item = data.find(d => d.name === name)\n      const pct = ((item.value / total) * 100).toFixed(1)\n      return `${name}  ${item.value}  ${pct}%`\n    }\n  },\n  series: [{\n    type: 'pie',\n    radius: ['45%', '70%'],\n    center: ['40%', '50%'],\n    data: mergedData,   // 合并小扇区后的数据\n    emphasis: { scale: true, scaleSize: 6 },\n    label: { show: false },\n    labelLine: { show: false }\n  }],\n  graphic: [{   // 中心文字\n    type: 'text', left: '38%', top: '44%',\n    style: { text: total.toString(), fontSize: 24, fontWeight: 'bold', fill: '#303133' }\n  }, {\n    type: 'text', left: '37%', top: '54%',\n    style: { text: '总订单', fontSize: 13, fill: '#909399' }\n  }]\n}\n```\n\n---\n\n## 场景二：实心饼图 + 引导线标签\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n  - src/ai-kit/hooks/useRequest.ts\n\n生成「用户来源分布」饼图 UserSourceChart.vue：\n  接口：getUserSourceStat()，返回 [{ name, value }]\n  数据：直接访问、搜索引擎、社交媒体、广告投放、其他\n  要求：\n    - 实心饼图，不同扇区明显色差\n    - 标签通过引导线显示在外侧：名称 + 百分比（如「搜索引擎 34.5%」）\n    - 扇区 < 5% 时隐藏标签，只在 tooltip 显示\n    - 图例在底部横排\n    - 点击扇区高亮，再次点击取消\n    - 使用 BaseChart + useRequest\n\nECharts option 结构参考：\n{\n  legend: { bottom: 8, orient: 'horizontal' },\n  series: [{\n    type: 'pie',\n    radius: '65%',\n    center: ['50%', '46%'],\n    data,\n    label: {\n      show: true,\n      formatter: ({ name, percent }) =>\n        percent < 5 ? '' : `${name}\\n${percent}%`,\n      lineHeight: 18\n    },\n    labelLine: { show: true, length: 15, length2: 10 },\n    emphasis: { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0,0,0,0.3)' } }\n  }]\n}\n```\n\n---\n\n## 场景三：南丁格尔玫瑰图（面积体现大小）\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n  - src/ai-kit/hooks/useRequest.ts\n\n生成「各产品线贡献度」玫瑰图 ProductRoseChart.vue：\n  接口：getProductContrib()，返回 [{ name, value }]（5-8 个类目）\n  要求：\n    - 使用 roseType: 'area'（面积模式，等角度不等半径）\n    - 标签显示在扇区内，名称换行后显示数值\n    - 图例在左侧，鼠标悬停图例高亮对应扇区\n    - 支持 dark mode（颜色跟随主题）\n    - 使用 BaseChart + useRequest\n\nECharts option 结构参考：\n{\n  legend: { orient: 'vertical', left: 20, top: 'center' },\n  series: [{\n    type: 'pie',\n    roseType: 'area',\n    radius: ['20%', '70%'],\n    center: ['60%', '50%'],\n    data: data.sort((a, b) => a.value - b.value),  // 从小到大排列更美观\n    label: {\n      show: true,\n      formatter: ({ name, value, percent }) => `{a|${name}}\\n{b|${value} (${percent}%)}`,\n      rich: { a: { fontSize: 12 }, b: { fontSize: 11, color: '#909399' } }\n    },\n    itemStyle: { borderRadius: 4, borderWidth: 2, borderColor: '#fff' }\n  }]\n}\n```\n\n---\n\n## 场景四：嵌套双环图（内外层对比）\n\n```\n参考：\n  - src/ai-kit/charts/BaseChart.vue\n  - src/ai-kit/hooks/useRequest.ts\n\n生成「本期 vs 上期 销售结构」嵌套双环图 CompareRingChart.vue：\n  接口：getSalesCompare()，返回 { current: [{name,value}], last: [{name,value}] }\n  要求：\n    - 外环：本期数据（radius: ['55%','70%']）\n    - 内环：上期数据（radius: ['35%','50%']）\n    - 两环颜色系列相同（通过 color 统一配置），透明度内深外浅\n    - 图例区分本期/上期标签，点击可同时控制内外环\n    - tooltip 展示内外环同名扇区的对比数据\n    - 使用 BaseChart + useRequest\n\nECharts option 结构参考：\n{\n  legend: { data: ['本期-A', '本期-B', '上期-A', '上期-B'], top: 8 },\n  series: [\n    {\n      name: '本期', type: 'pie',\n      radius: ['55%', '70%'],\n      data: current.map(d => ({ ...d, name: `本期-${d.name}` })),\n      label: { position: 'outer', formatter: '{b}: {d}%' }\n    },\n    {\n      name: '上期', type: 'pie',\n      radius: ['35%', '50%'],\n      data: last.map(d => ({ ...d, name: `上期-${d.name}` })),\n      label: { show: false }\n    }\n  ]\n}\n```\n\n---\n\n## 通用注意事项\n\n- **超过 8 个类目**时，饼图可读性差，改用横向柱状排名图\n- 小扇区（< 3%）合并为「其他」，避免引导线交叉混乱\n- 不要使用 3D 饼图，视觉会造成比例误导\n- `tooltip.confine: true` 防止弹出层超出容器\n- 颜色方案与项目主题色保持一致，不硬编码颜色数组\n- 环形图中心文字用 `graphic` 组件实现，不要用 `title`（定位不准）"
  },
  {
    "id": "components-drawer",
    "category": "components",
    "path": "components/drawer.md",
    "title": "Drawer 抽屉组件提示词",
    "preview": "Drawer 抽屉组件提示词 快速生成 参考： - src/ai-kit/components/BaseDrawer.vue - src/ai-kit/forms/BaseForm.vue - src/ai-kit/hooks/useDialog.ts 生成「用户详情编辑」抽屉组",
    "content": "# Drawer 抽屉组件提示词\n\n## 快速生成\n\n```\n参考：\n  - src/ai-kit/components/BaseDrawer.vue\n  - src/ai-kit/forms/BaseForm.vue\n  - src/ai-kit/hooks/useDialog.ts\n\n生成「用户详情编辑」抽屉组件，字段：name(姓名)、phone(手机号)、deptId(部门)、roles(角色，多选)\n要求：表单校验、loading 状态、离开拦截（表单修改后提示）\n```\n\n## 带左侧树 + 右侧抽屉的联动场景\n\n```\n参考：\n  - src/ai-kit/tree/BaseTree.vue\n  - src/ai-kit/components/BaseDrawer.vue\n  - src/ai-kit/hooks/useTree.ts\n  - src/ai-kit/hooks/useDialog.ts\n\n生成「组织架构管理」页面：\n  - 左侧：部门树（BaseTree + useTree），点击部门节点\n  - 右侧：用户列表（useTable）\n  - 操作：点击\"编辑\"打开 BaseDrawer，字段：name、phone、status\n```\n\n## 步骤表单抽屉\n\n```\n参考：\n  - src/ai-kit/components/BaseDrawer.vue\n  - src/ai-kit/hooks/useDialog.ts\n\n生成「申请流程」步骤抽屉，共 3 步：\n  步骤1：基本信息（name、type、description）\n  步骤2：配置项（配置表格，可动态增删行）\n  步骤3：确认预览\n要求：步骤间校验、上一步/下一步、最终提交\n```"
  },
  {
    "id": "components-dialog",
    "category": "components",
    "path": "components/dialog.md",
    "title": "生成 Dialog 组件：",
    "preview": "生成 Dialog 组件： 要求： - Vue3 + TS - loading - form 校验 - emits/types 完整 - 支持 dark mode",
    "content": "生成 Dialog 组件：\n\n要求：\n- Vue3 + TS\n- loading\n- form 校验\n- emits/types 完整\n- 支持 dark mode"
  },
  {
    "id": "forms-form",
    "category": "forms",
    "path": "forms/form.md",
    "title": "Form 表单提示词",
    "preview": "Form 表单提示词 基础表单（嵌入 Dialog） 参考： - src/ai-kit/forms/BaseForm.vue - src/ai-kit/components/BaseDialog.vue - src/ai-kit/hooks/useDialog.ts 生成「用户新",
    "content": "# Form 表单提示词\n\n## 基础表单（嵌入 Dialog）\n\n```\n参考：\n  - src/ai-kit/forms/BaseForm.vue\n  - src/ai-kit/components/BaseDialog.vue\n  - src/ai-kit/hooks/useDialog.ts\n\n生成「用户新增/编辑」功能：\n  表单字段：\n    - name(姓名, required)\n    - phone(手机号, required, 格式校验)\n    - email(邮箱, 格式校验)\n    - deptId(部门, el-select, required)\n    - status(状态, el-radio-group: 启用/禁用)\n  要求：\n    - 表单组件 UserForm.vue 单独拆出\n    - 通过 defineExpose({ validate, reset }) 暴露给父组件\n    - 嵌入 BaseDialog，confirm 回调中校验 → 提交 → 刷新列表\n```\n\n## 动态表单（字段动态增减）\n\n```\n参考：\n  - src/ai-kit/forms/BaseForm.vue\n  - src/ai-kit/hooks/useDialog.ts\n\n生成「参数配置」动态表单：\n  - 支持动态添加/删除行（key-value 键值对）\n  - 每行校验：key 必填且唯一，value 必填\n  - 最多 20 行限制，超出禁用添加\n  - 支持拖拽排序（可选）\n```\n\n## 搜索表单（配合 useSearch）\n\n```\n参考：\n  - src/ai-kit/search/BaseSearch.vue\n  - src/ai-kit/hooks/useSearch.ts\n  - src/ai-kit/hooks/useTable.ts\n\n生成「订单列表」搜索表单：\n  字段：orderNo(订单号)、status(状态，多选)、dateRange(日期范围)、userName(用户名)\n  要求：\n    - 使用 BaseSearch 组件包裹\n    - useSearch 管理参数，搜索防抖 300ms\n    - 重置还原所有字段并刷新列表\n    - 日期范围用 el-date-picker type=\"daterange\"\n```\n\n## 步骤表单\n\n```\n参考：\n  - src/ai-kit/forms/BaseForm.vue\n  - src/ai-kit/components/BaseDrawer.vue\n\n生成「项目申请」步骤表单，共 3 步：\n  步骤1 - 基本信息：name、type、priority、description\n  步骤2 - 成员配置：负责人（单选）、参与人（多选）、预计工期\n  步骤3 - 确认提交：汇总展示，可回到上一步修改\n  要求：\n    - 每步独立校验，通过后才能下一步\n    - 用 el-steps 显示进度\n    - 在 BaseDrawer 内展示\n```"
  },
  {
    "id": "forms-dynamic-form",
    "category": "forms",
    "path": "forms/dynamic-form.md",
    "title": "生成动态表单：",
    "preview": "生成动态表单： 要求： - schema 驱动 - 支持动态字段 - 表单校验 - resetFields - hooks 化",
    "content": "生成动态表单：\n\n要求：\n- schema 驱动\n- 支持动态字段\n- 表单校验\n- resetFields\n- hooks 化"
  },
  {
    "id": "git-commit",
    "category": "git",
    "path": "git/commit.md",
    "title": "根据当前 diff：",
    "preview": "根据当前 diff： 生成： - commit message - 修改说明 - 风险说明",
    "content": "根据当前 diff：\n\n生成：\n- commit message\n- 修改说明\n- 风险说明"
  },
  {
    "id": "hooks-use-request",
    "category": "hooks",
    "path": "hooks/use-request.md",
    "title": "生成请求 hooks：",
    "preview": "生成请求 hooks： 要求： - loading - error - cancel - retry - TS 类型完整",
    "content": "生成请求 hooks：\n\n要求：\n- loading\n- error\n- cancel\n- retry\n- TS 类型完整"
  },
  {
    "id": "pages-list-page",
    "category": "pages",
    "path": "pages/list-page.md",
    "title": "生成列表页面：",
    "preview": "生成列表页面： 要求： - Vue3 + TypeScript - 使用 BaseSearch - 使用 useTable - loading/error - 分页 - hooks 化 - api 放 services - 不允许 any",
    "content": "生成列表页面：\n\n要求：\n- Vue3 + TypeScript\n- 使用 BaseSearch\n- 使用 useTable\n- loading/error\n- 分页\n- hooks 化\n- api 放 services\n- 不允许 any"
  },
  {
    "id": "performance-large-data",
    "category": "performance",
    "path": "performance/large-data.md",
    "title": "优化大数据渲染：",
    "preview": "优化大数据渲染： 重点： - 虚拟滚动 - WebWorker - 防抖节流 - computed 缓存 - 避免深层 watch",
    "content": "优化大数据渲染：\n\n重点：\n- 虚拟滚动\n- WebWorker\n- 防抖节流\n- computed 缓存\n- 避免深层 watch"
  },
  {
    "id": "refactor-component",
    "category": "refactor",
    "path": "refactor/component.md",
    "title": "重构当前组件：",
    "preview": "重构当前组件： 要求： - 不改变业务逻辑 - 提升复用性 - 提取 composables - 减少重复代码 - 提升类型安全 - 优化性能 - 降低耦合",
    "content": "重构当前组件：\n\n要求：\n- 不改变业务逻辑\n- 提升复用性\n- 提取 composables\n- 减少重复代码\n- 提升类型安全\n- 优化性能\n- 降低耦合"
  },
  {
    "id": "review-review",
    "category": "review",
    "path": "review/review.md",
    "title": "Review 当前代码：",
    "preview": "Review 当前代码： 检查： - 是否符合规范 - 是否重复代码 - 是否存在性能问题 - 是否存在内存泄漏 - 是否符合 TS 规范",
    "content": "Review 当前代码：\n\n检查：\n- 是否符合规范\n- 是否重复代码\n- 是否存在性能问题\n- 是否存在内存泄漏\n- 是否符合 TS 规范"
  },
  {
    "id": "search-base-search",
    "category": "search",
    "path": "search/base-search.md",
    "title": "生成搜索区域：",
    "preview": "生成搜索区域： 要求： - 支持展开收起 - reset/search - 响应式布局 - 与 table 联动 - 支持 slot",
    "content": "生成搜索区域：\n\n要求：\n- 支持展开收起\n- reset/search\n- 响应式布局\n- 与 table 联动\n- 支持 slot"
  },
  {
    "id": "table-crud-table",
    "category": "table",
    "path": "table/crud-table.md",
    "title": "生成 CRUD 表格：",
    "preview": "生成 CRUD 表格： 要求： - 使用 useTable - loading - pagination - selection - column config",
    "content": "生成 CRUD 表格：\n\n要求：\n- 使用 useTable\n- loading\n- pagination\n- selection\n- column config"
  },
  {
    "id": "tree-tree",
    "category": "tree",
    "path": "tree/tree.md",
    "title": "Tree 树组件提示词",
    "preview": "Tree 树组件提示词 基础树 参考： - src/ai-kit/tree/BaseTree.vue - src/ai-kit/hooks/useTree.ts 生成「部门树」组件： - 调用 getDeptTree() 接口获取数据 - 支持关键词搜索过滤 - 支持 check",
    "content": "# Tree 树组件提示词\n\n## 基础树\n\n```\n参考：\n  - src/ai-kit/tree/BaseTree.vue\n  - src/ai-kit/hooks/useTree.ts\n\n生成「部门树」组件：\n  - 调用 getDeptTree() 接口获取数据\n  - 支持关键词搜索过滤\n  - 支持 checkbox 多选\n  - 点击节点 emit node-click 事件\n  - 数据用 useTree 管理，loading 骨架\n```\n\n## 左树右表联动\n\n```\n参考：\n  - src/ai-kit/tree/BaseTree.vue\n  - src/ai-kit/hooks/useTree.ts\n  - src/ai-kit/components/list-page-template.vue\n  - src/ai-kit/hooks/useTable.ts\n\n生成「权限管理」页面：\n  - 左侧：菜单树（BaseTree，单选，节点 id=menuId）\n  - 右侧：角色列表（useTable，搜索参数含 menuId）\n  - 点击菜单节点 → 右侧列表刷新\n  - 比例：左 240px / 右 flex:1\n```\n\n## 懒加载树（大数据量）\n\n```\n参考：\n  - src/ai-kit/tree/BaseTree.vue\n  - src/ai-kit/hooks/useTree.ts\n\n生成「文件目录」懒加载树：\n  - lazy=true，load 回调调用 getChildNodes(node.id)\n  - 叶子节点图标区分文件/文件夹\n  - 右键菜单：重命名、删除、新建子节点\n  - 拖拽排序（el-tree draggable）\n```"
  },
  {
    "id": "tree-lazy-tree",
    "category": "tree",
    "path": "tree/lazy-tree.md",
    "title": "生成懒加载树组件：",
    "preview": "生成懒加载树组件： 要求： - lazy load - checkbox - 搜索过滤 - 展开收起 - hooks 化",
    "content": "生成懒加载树组件：\n\n要求：\n- lazy load\n- checkbox\n- 搜索过滤\n- 展开收起\n- hooks 化"
  }
];
