# 大数据渲染优化提示词

> 参考规则：`.cursor/rules/performance/render.mdc`、`.cursor/rules/performance/large-data.mdc`
> 本 Prompt 是诊断与改造指导，不绑定单一 ai-kit 实现。

---

## 场景一：大数据量表格虚拟滚动

```
参考：
  - .cursor/rules/performance/large-data.mdc
  - src/ai-kit/hooks/useTable.ts

优化「万行日志」表格渲染：
  症状：渲染 1 万行卡顿，滚动掉帧
  改造要求：
    - 优先用 useTable 相关虚拟滚动能力（如 el-table 虚拟滚动或虚拟列表分支）
    - 主线程计算分片执行，避免一次性渲染全部行
    - tableData 用 shallowRef，避免逐字段深层响应式追踪
    - 行内复杂模板抽成单元格组件，用 memo/纯函数避免重复计算
  验收：滚动 fps 提升可量化（前后对比），不再整页卡死
```

---

## 场景二：大列表分页 + 服务端过滤

```
参考：
  - src/ai-kit/hooks/useTable.ts
  - src/ai-kit/hooks/useSearch.ts

优化「订单中心」大列表：
  症状：一次性拉全量数据前端过滤，接口慢、页面卡
  改造要求：
    - 改为服务端分页 + 服务端搜索（useTable + useSearch 配套）
    - 传输层压缩与分页，避免前端解析大 JSON 阻塞主线程
    - 接口返回 { list, total }，前端只渲染当前页
    - 数据量特别大时流式或增量解析
  验收：首屏加载时间下降，接口 payload 明显减小
```

---

## 场景三：大数据量图表降采样

```
参考：
  - .cursor/rules/performance/large-data.mdc
  - src/ai-kit/charts/BaseChart.vue

优化「实时监控」图表（每秒上千点）：
  症状：图表卡死，渲染跟不上数据
  改造要求：
    - 数据降采样（LTTB / min-max 抽稀），只画特征点
    - 用 requestIdleCallback 分片计算，避免阻塞主线程
    - 增量更新（appendData）而非全量 setOption
    - 组件销毁时清理定时器与实例（dispose）
  验收：图表帧率稳定，数据特征保持完整
```

---

## 通用注意事项

- 主线程长时间计算必须分片（requestIdleCallback）或移 Worker，禁止阻塞 UI
- 避免大对象用 reactive（深层代理开销大），优先 shallowRef / 普通数组
- computed 缓存派生结果，避免模板内复杂计算
- 拆分组件渲染粒度，避免一次渲染整棵大组件树
- 必须给出 改造前/后 指标对比与回滚预案，否则不接受
