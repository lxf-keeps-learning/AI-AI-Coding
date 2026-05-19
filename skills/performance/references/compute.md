# 计算性能

> 计算瓶颈的核心特征:**主线程在跑大量同步代码**——可能是响应式追踪开销,也可能是业务计算本身。

## 何时进入本文件

- 输入框输入卡(每次输入触发链式 computed / watch)
- 编辑表单复杂联动卡
- 切换某个开关导致页面冻结片刻
- Performance 火焰图看到 `Proxy get / set` 大量出现
- 大对象 reactive + deep watch 组合

## 常见反模式与改法

### 反模式 1:大对象用 reactive

```ts
// 反例
const tree = reactive(buildHugeTree())  // 节点 ~5000

// 正例:用 shallowRef + 不可变更新
const tree = shallowRef(buildHugeTree())
function updateNode(id: string, patch: Partial<Node>) {
  tree.value = patchTree(tree.value, id, patch)  // 返回新引用
}
```

为什么:reactive 为每个属性建立 Proxy,大对象初始化和访问都很重。

### 反模式 2:计算不变的对象用 ref

```ts
// 反例
const heavyConfig = ref(loadBigStaticConfig())

// 正例
const heavyConfig = markRaw(loadBigStaticConfig())
// 或者直接 const heavyConfig = loadBigStaticConfig()(如果不需要响应式)
```

`markRaw` 告诉 Vue:**这个对象永远不要变响应式**。第三方实例(地图、富文本)也都该 markRaw。

### 反模式 3:深度 watch 大对象

```ts
// 反例
watch(form, () => save(form), { deep: true })

// 正例
watch(() => JSON.stringify(form.value), () => save(form))
// 或精确监听变化的字段
watch(() => form.value.fields, () => save(form), { deep: false })
```

更好:重新设计——别让一次 watch 触发承担太多职责。

### 反模式 4:每次渲染都跑昂贵 computed

```ts
// 反例
const expensive = computed(() => {
  return list.value.flatMap(x => x.items).map(transform).filter(check)
})
// list 变化频繁,每次都全跑

// 正例:拆 + memoize
const items = computed(() => list.value.flatMap(x => x.items))  // 缓存中间值
const filtered = computed(() => items.value.map(transform).filter(check))
// 或仅在需要时手动 trigger 而非自动追踪
```

### 反模式 5:同步循环阻塞主线程

```ts
// 反例
for (let i = 0; i < 50000; i++) heavyWork(i)

// 正例:分片
async function run() {
  for (let i = 0; i < 50000; i += 500) {
    await new Promise(r => requestIdleCallback(r))
    for (let j = i; j < Math.min(i + 500, 50000); j++) heavyWork(j)
  }
}

// 或 Worker
```

参考 large-data.md 反模式 3。

### 反模式 6:重复计算同一结果

```ts
// 反例
function getRoot(node: Node) {
  let cur = node
  while (cur.parent) cur = cur.parent
  return cur
}
// 在循环里每次调用都走到根

// 正例:memoize
const rootCache = new WeakMap<Node, Node>()
function getRoot(node: Node) {
  if (rootCache.has(node)) return rootCache.get(node)!
  let cur = node
  while (cur.parent) cur = cur.parent
  rootCache.set(node, cur)
  return cur
}
```

### 反模式 7:JSON 序列化大对象

```ts
// 反例
const snapshot = JSON.parse(JSON.stringify(huge))  // 同步、慢、丢类型

// 正例:用 structuredClone(浏览器原生,快)
const snapshot = structuredClone(huge)
```

### 反模式 8:在 render 路径上做正则 / 格式化

```vue
<!-- 反例 -->
<el-table-column :formatter="(row) => bigRegex.test(row.x) ? formatA(row) : formatB(row)" />

<!-- 正例:把派生数据预处理 -->
<script setup lang="ts">
const formattedRows = computed(() => rows.value.map(r => ({
  ...r,
  display: bigRegex.test(r.x) ? formatA(r) : formatB(r)
})))
</script>
```

## 与 ai-kit 的关联

- 防抖/节流统一走 `src/ai-kit/utils/`
- 异步请求走 `useRequest`,避免业务自己缓存 + 自己写防抖
- 大对象 reactive 这一类问题,**不要扩展 ai-kit** —— 它属于业务侧使用方式问题,在报告里说明改用 shallowRef / markRaw 即可

## 度量目标参考

| 场景 | 改造前 | 改造后目标 |
|------|--------|------------|
| 单次 watch 回调耗时 | > 100ms | < 16ms |
| 一次 computed 重算 | > 50ms | < 10ms |
| 5000 节点 reactive 初始化 | > 200ms | < 50ms(shallowRef + markRaw) |
| 输入到 UI 更新延迟 | > 150ms | < 50ms |
