# Chart 图表提示词

## 折线图（趋势）

```
参考：
  - src/ai-kit/charts/BaseChart.vue
  - src/ai-kit/hooks/useRequest.ts

生成「访问趋势」折线图组件：
  - 调用 getVisitTrend({ startDate, endDate }) 接口
  - 多条折线：PV、UV、IP
  - X 轴：日期，Y 轴：数量
  - 支持时间范围切换（近7天/近30天/自定义）
  - 使用 BaseChart + useRequest，loading 状态
```

## 柱状图（对比）

```
参考：
  - src/ai-kit/charts/BaseChart.vue
  - src/ai-kit/hooks/useRequest.ts

生成「各部门销售额」柱状图：
  - 调用 getSalesByDept() 接口
  - 横向柱状图（yAxis: category）
  - 数据标签显示在柱子右侧
  - 颜色渐变，响应式 resize
  - 使用 BaseChart 组件
```

## 饼图（占比）

```
参考：
  - src/ai-kit/charts/BaseChart.vue
  - src/ai-kit/hooks/useRequest.ts

生成「订单状态分布」饼图：
  - 调用 getOrderStatusStat() 接口，返回 [{ name, value }]
  - 环形饼图（内半径 60%），中心显示总数
  - 图例在右侧，支持点击高亮
  - 使用 BaseChart + useRequest
```

## 大屏图表（实时刷新）

```
参考：
  - src/ai-kit/charts/BaseChart.vue
  - src/ai-kit/hooks/useChart.ts

生成「实时监控」大屏图表（折线，最新50条数据）：
  - 每5秒调用 getRealtimeData() 刷新
  - 用 useChart hook 手动控制（需要 appendData 增量更新）
  - 组件销毁时清除定时器（onUnmounted）
  - 坐标轴滚动，始终显示最新时间窗口
```

## 组合图表（折线 + 柱状）

```
参考：
  - src/ai-kit/charts/BaseChart.vue

生成「营收分析」组合图表：
  - 柱状：各月营收金额
  - 折线：环比增长率（双 Y 轴）
  - tooltip 合并显示
  - 使用 BaseChart 组件，:option 传入 computed
```
