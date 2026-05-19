# 渲染性能

> 渲染瓶颈的核心问题:**Vue 在你不希望它跑的时候跑了**,或者 DOM 节点多到浏览器 paint/composite 跟不上。

## 常见症状

- 滚动列表掉帧
- 大量子组件的页面切 tab 卡
- 输入框输入有延迟
- Vue Devtools 显示某组件渲染次数异常多

## 诊断步骤

1. **打开 Vue Devtools** → Performance 面板,录制一段卡顿期间的操作,看哪些组件 render 次数高、占时长
2. **打开 Chrome Performance** → Recording,看主线程长任务,展开 "Function call" 找到对应组件
3. **检查 props 引用**:父组件每次渲染是否创建了新对象/数组传给子组件?
4. **检查 watch / computed**:有没有 `deep: true` 监听大对象?有没有 computed 返回新对象使下游全部失效?
5. **检查列表 key**:`v-for` 是否用了稳定 key?不要用 index

## 典型反模式与改法

### 反模式 1:列表 key 用 index

```vue
<!-- 反例 -->
<el-table-column v-for="(col, idx) in columns" :key="idx" />

<!-- 正例 -->
<el-table-column v-for="col in columns" :key="col.prop" />
```

为什么:index 不稳定,顺序变化时 Vue 无法复用 DOM,触发整列重建。

### 反模式 2:父组件每次渲染都新建对象传给子

```vue
<!-- 反例 -->
<BaseChart :option="{ tooltip: { show: true }, series: data }" />

<!-- 正例 -->
<script setup lang="ts">
const chartOption = computed<EChartsOption>(() => ({
  tooltip: { show: true },
  series: data.value
}))
</script>
<BaseChart :option="chartOption" />
```

为什么:inline 对象每次渲染 `===` 都不同,子组件即使做了浅比较也会重新执行 watcher。

### 反模式 3:`watch` 深度监听大对象

```ts
// 反例
watch(form, () => { ... }, { deep: true })  // form 里嵌套 N 层

// 正例:监听你真正关心的字段
watch(() => form.value.name, () => { ... })
// 或者用 toRefs 提取
const { name, status } = toRefs(form.value)
watch([name, status], () => { ... })
```

为什么:`deep: true` 每次 set 都要遍历整棵对象,数据量稍大就成为长任务。

### 反模式 4:`reactive` 包大对象 / 表格全量数据

```ts
// 反例
const tableData = reactive<Row[]>([...thousand_rows])

// 正例
const tableData = shallowRef<Row[]>([...thousand_rows])
// 或使用 useTable 的封装
const { data } = useTable<Row>({ ... })
```

为什么:`reactive` 会对每个属性建立 Proxy 跟踪;大数组下,每次 get/set 都有开销。本项目要求**表格数据走 `useTable`**,不要业务自管 reactive 数组。

### 反模式 5:在 render 函数里创建函数

```vue
<!-- 反例 -->
<el-button @click="() => handleClick(row.id)">删除</el-button>

<!-- 正例 -->
<el-button @click="handleClick(row.id)">删除</el-button>
<!-- 或者把 row 传进事件 -->
<el-button @click="onDelete">删除</el-button>
```

为什么:模板里的箭头函数每次渲染都是新引用,触发子组件的 props 比较失败。

### 反模式 6:在大列表里用重组件

每行渲染 ECharts、复杂表单、富文本等,> 100 行就会卡。改法:

- 行内只渲染轻量预览,展开行/弹窗里再用重组件(`懒挂载`)
- 或表格使用虚拟滚动(`.cursor/rules/table/virtual-table.mdc`)

## 与 ai-kit 的关联

- 表格类性能问题优先用 `useTable` + virtual-table.mdc 的约束,而不是自己造虚拟滚动
- 图表渲染相关问题进入 chart.md
- 频繁渲染 + 输入相关问题,通常配合 `debounce` (`src/ai-kit/utils/debounce.ts`)

## 度量目标参考

| 场景 | 改造前可能 | 改造后目标 |
|------|------------|------------|
| 100 行表格滚动 FPS | 25-40 | ≥ 55 |
| 输入框输入到列表更新延迟 | 200-500ms | < 100ms |
| 切 tab 到页面交互响应 | 800-1500ms | < 300ms |
| 单次 render commit 时长 | > 100ms | < 16ms |

报告里把"改造前实测"写进症状采集,不能省略。
