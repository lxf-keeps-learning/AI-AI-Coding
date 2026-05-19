# 内存性能

> 内存问题的核心特征:**用一段时间后变慢、刷新就好、Memory tab 堆持续增长**。

## 常见症状

- 用 30 分钟后越来越卡,刷新页面变流畅
- Memory tab 取快照,堆大小持续上升不回落
- "Detached DOM" 数量非 0 且增长
- 浏览器 tab 占用内存几百 MB 起步

## 诊断步骤

1. **采集多个堆快照**:操作前 → 操作中 → 操作完成后 → 切走再回来。重点看 Retained Size 增长项
2. **筛选 Detached HTMLDivElement / HTMLCanvasElement**:这些是离开 DOM 但仍被引用的节点,内存泄漏的标志性产物
3. **看 listeners 数量**:Performance Monitor 面板的 listeners 持续增长是事件未解绑
4. **看 timers 数量**:`setInterval` 未 clear
5. **检查代码中的全局/模块级缓存**:有没有不断 push 而不释放?

## 典型反模式与改法

### 反模式 1:onMounted 加监听,但 onUnmounted 未清理

```ts
// 反例
onMounted(() => {
  window.addEventListener('resize', onResize)
  document.addEventListener('keydown', onKeydown)
})

// 正例
onMounted(() => {
  window.addEventListener('resize', onResize)
  document.addEventListener('keydown', onKeydown)
})
onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  document.removeEventListener('keydown', onKeydown)
})
// 更好:用 useEventListener (vueuse) 或封装到 hook 里
```

### 反模式 2:`setInterval` / `setTimeout` 未清

```ts
// 反例
const timer = setInterval(fetchStatus, 5000)

// 正例
let timer: ReturnType<typeof setInterval> | null = null
onMounted(() => { timer = setInterval(fetchStatus, 5000) })
onUnmounted(() => { if (timer) clearInterval(timer) })
```

### 反模式 3:ECharts 实例未 dispose

```ts
// 反例
const chart = echarts.init(el)
// 离开页面没调 dispose

// 正例
const chart = echarts.init(el)
onUnmounted(() => { chart.dispose() })

// 最佳:本项目要求所有图表走 BaseChart / useChart
//   它已封装了 dispose / resize 生命周期,业务方不需要自管
```

本项目硬性要求:**禁止业务页面直接调 `echarts.init`**,统一走 `BaseChart` + `useChart`,这条规则就是为了根治图表泄漏。

### 反模式 4:第三方实例未销毁

地图、富文本编辑器、视频播放器、WebSocket、IntersectionObserver / ResizeObserver / MutationObserver,所有"有 init/destroy 概念"的对象,在 `onUnmounted` 都要释放。

### 反模式 5:模块级缓存无限增长

```ts
// 反例
const cache = new Map<string, BigData>()
export function getData(key: string) {
  if (!cache.has(key)) cache.set(key, computeBig(key))
  return cache.get(key)
}

// 正例:有上限的 LRU
const cache = new LRUCache<string, BigData>({ max: 100 })
```

或者:把缓存绑定到组件生命周期,而不是模块。

### 反模式 6:闭包持有大对象

```ts
// 反例
function makeHandler() {
  const hugeList = fetchHugeList()  // 大对象被闭包捕获
  return () => console.log(hugeList.length)
}
// 后面把这个 handler 绑到全局事件上,hugeList 永远不释放

// 正例:闭包里只持有你真正用到的
function makeHandler() {
  const length = fetchHugeList().length
  return () => console.log(length)
}
```

### 反模式 7:Pinia store 当垃圾桶

把页面级状态塞进全局 store 然后不清理,切换页面时旧数据仍在。原则:**只把跨页面共享的数据放 store**,页面级状态用本地 ref 或 hook。

## 与 ai-kit 的关联

- 图表泄漏 → 切回 `BaseChart` / `useChart`,这是根治方案
- 防抖/节流的 timer 也要清(`src/ai-kit/utils/debounce.ts` 内部已处理,业务自写的没处理)
- 表格数据更新走 `useTable`,避免业务方在 keep-alive 下累积旧数据

## 度量目标参考

| 场景 | 改造前可能 | 改造后目标 |
|------|------------|------------|
| Detached DOM 数 | 几百~几千 | 个位数 |
| 切走/回来后堆增长 | 持续增长 | 稳定在基线 ±10% |
| 长时间运行(2h)堆 | 翻倍 | 持平 |
| listeners 数 | 持续增长 | 稳定 |

## 报告里必须列的核对项

针对 memory 类问题,改造方案必须显式核对下面项目:

- [ ] 所有 `addEventListener` 都有配对的 `removeEventListener`
- [ ] 所有 timer / interval 在 `onUnmounted` 清理
- [ ] 所有第三方实例(echarts / map / observer / ws)有 dispose / destroy / disconnect / close
- [ ] 所有模块级缓存有大小上限或 TTL
- [ ] keep-alive 下需要清理的状态有 `onActivated` / `onDeactivated` 钩子
