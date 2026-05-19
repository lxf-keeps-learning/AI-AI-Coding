# 大数据性能

> 大数据问题的核心特征:**一次性渲染过多 DOM 或一次性计算过多对象**,主线程被阻塞。

## 何时进入本文件

参考 diagnosis-flow.md 中的"数据量级阈值",数据量越过下面任意一项就属于大数据场景:

- 表格 > 200 行(前端全量)
- 折线图 > 1000 数据点
- 树 > 500 节点
- 一次性 JSON 解析 > 1MB

## 优化思路矩阵

| 数据形态 | 首选方案 | 次选方案 |
|----------|----------|----------|
| 大表格 | 服务端分页(`useTable` 默认就是) | 虚拟滚动(参考 `.cursor/rules/table/virtual-table.mdc`) |
| 大列表(非表格) | 虚拟滚动 + 行高缓存 | 分页加载 + 滚动到底续加 |
| 大树 | 懒加载(`.cursor/rules/tree/lazy-tree.mdc`) | 节点过滤 / 折叠 |
| 折线/柱图大点数 | ECharts `series.sampling` + 数据聚合 | 按区间分桶预处理 |
| 大表单字段 | 折叠分组 / 步骤化 | 异步挂载非关键字段 |
| 大 JSON | 后端切片 + 分页 / 增量传输 | 前端 stream 解析 |
| 大计算 | Web Worker | `requestIdleCallback` 分片 |

## 典型反模式与改法

### 反模式 1:前端全量分页

```ts
// 反例
const all = await getAllUsers() // 一次拉 5000 条
const pageData = all.slice((page-1)*size, page*size)

// 正例
const { data } = useTable<User>({
  fetcher: (params) => getUserList(params)  // 服务端分页
})
```

为什么:即使后端能返,前端处理 5000 条 reactive 数据本身就有可观的内存与跟踪开销。本项目 base.mdc 明确**前端全量分页只在小数据量(< 100)场景使用**。

### 反模式 2:虚拟滚动 + reactive

```ts
// 反例
const list = ref<Row[]>([])  // ref 包大数组,且元素是普通对象

// 正例
const list = shallowRef<Row[]>([])
// 或:每个 row 用 markRaw 避免响应式追踪
```

为什么:虚拟滚动减少了 DOM,但数据本身仍是 reactive 时,Vue 仍会跟踪每个属性。

### 反模式 3:在主线程上同步算几百毫秒的东西

```ts
// 反例:CSV / 大数组同步处理
const result = bigArray.map(transform).filter(check).reduce(...)
// 50ms+ 长任务,卡帧

// 正例:Worker
const worker = new Worker(new URL('./transform.worker.ts', import.meta.url))
worker.postMessage(bigArray)
worker.onmessage = e => { result.value = e.data }

// 或者:requestIdleCallback 分片
function process(chunkStart: number) {
  const chunk = bigArray.slice(chunkStart, chunkStart + 500)
  // ... process chunk
  if (chunkStart + 500 < bigArray.length) {
    requestIdleCallback(() => process(chunkStart + 500))
  }
}
```

参考 `.cursor/rules/performance/large-data.mdc`:**主线程计算分片 requestIdleCallback 或 Worker;避免长时间阻塞**。

### 反模式 4:大图表全量数据点

```ts
// 反例
chart.setOption({ series: [{ type: 'line', data: tenThousandPoints }] })

// 正例 — 让 ECharts 自己采样
chart.setOption({
  series: [{
    type: 'line',
    sampling: 'lttb',           // 视觉保留型采样
    data: tenThousandPoints,
    progressive: 500,
    progressiveThreshold: 3000
  }]
})

// 更进一步:前端预聚合
const aggregated = aggregateByMinute(tenThousandPoints) // 按时间桶聚合
```

更多见 chart.md。

### 反模式 5:树一次性展开全量数据

```vue
<!-- 反例 -->
<el-tree :data="thousandNodes" default-expand-all />

<!-- 正例 — 懒加载 -->
<BaseTree lazy :load="loadChildren" />
```

见 `.cursor/rules/tree/lazy-tree.mdc`。

### 反模式 6:大文件 / 大 JSON 同步解析

```ts
// 反例
const data = JSON.parse(hugeString)  // 阻塞

// 正例
// - 后端切片返回
// - 前端用 fetch().body.getReader() 流式读取
// - 重型解析放 Worker
```

## 与 ai-kit 的关联

本项目处理大数据的"成品工具":

- 表格 → `useTable` + 服务端分页;超量场景用 `.cursor/rules/table/virtual-table.mdc` 中的虚拟表
- 图表 → `BaseChart` / `useChart`;采样、降采样、隐藏 tab 延迟初始化等约束都已有规则
- 防抖/节流 → `src/ai-kit/utils/`
- 请求 → `useRequest`,支持 cancel / 并发控制

**禁止业务侧自己写虚拟滚动 / 自己实现 LTTB / 自己造 Worker 池**,先用规则约定的方案;若必须扩展,先抽到 ai-kit(走 engineering skill)。

## 度量目标参考

| 场景 | 改造前 | 改造后目标 |
|------|--------|------------|
| 5000 行表格首屏 | 卡死 5-10s | < 500ms |
| 10000 点折线初始化 | 2-5s | < 800ms |
| 大 JSON 解析阻塞 | > 1s 长任务 | 分片后单片 < 50ms |
| 树展开 5000 节点 | 卡死 | < 200ms(懒加载) |
