# 网络性能

> 网络瓶颈的核心特征:**主线程没事干,但页面就是没响应**——在等服务端或下载资源。

## 何时进入本文件

- 首屏白屏 / LCP 不达标
- Network 瀑布图等待时间长 / 串行
- 一次提交后等很久(没动 UI)
- 一次进入页面发了 10+ 接口

## 优化思路矩阵

| 现象 | 首选方案 |
|------|----------|
| 首屏资源大 | 代码分割 + 路由懒加载 + 依赖按需 + CDN |
| 关键资源串行 | 预加载 / preconnect / dns-prefetch |
| N+1 请求 | 后端合并接口,或前端 batch |
| 一次拉太多数据 | 分页 / 增量 / 字段裁剪 |
| 重复请求 | 请求级别缓存 / 节流 / 去重 |
| 用户输入触发频繁请求 | 防抖 + cancel 在途请求 |
| 上传/下载阻塞 | 并发上传 / 断点续传 |

## 典型反模式与改法

### 反模式 1:页面 onMounted 里串行发 N 个请求

```ts
// 反例
onMounted(async () => {
  const a = await getA()
  const b = await getB()
  const c = await getC()
})

// 正例:并行
onMounted(async () => {
  const [a, b, c] = await Promise.all([getA(), getB(), getC()])
})
```

### 反模式 2:列表里每行发一个请求(N+1)

```ts
// 反例
list.forEach(item => {
  getDetail(item.id).then(d => item.detail = d)
})

// 正例:后端提供批量接口或前端 batch
const ids = list.map(i => i.id)
const details = await getDetailsBatch(ids)
```

### 反模式 3:搜索框 input 每次都打请求

```ts
// 反例
watch(keyword, async (v) => { list.value = await search(v) })

// 正例:防抖 + 取消在途请求
import { debounce } from '@/ai-kit/utils/debounce'
const search = useRequest(searchApi, { debounce: 300 })
watch(keyword, (v) => search.run({ keyword: v }))
```

本项目硬性要求:**用 `useRequest`,不要业务方自己造**。useRequest 已经处理 loading / error / 防抖 / 取消。

### 反模式 4:一次性拉所有数据"以便前端搜索"

```ts
// 反例
const all = await getAllUsers()  // 几千几万条,只为前端模糊搜索

// 正例
// 让搜索走服务端
```

### 反模式 5:不使用 HTTP 缓存 / 内存缓存

```ts
// 反例
// 每次进同一页面都重新拉字典
const dicts = await getDicts()

// 正例
// 字典类数据放 store 或带 TTL 的缓存,首次后命中本地
```

### 反模式 6:首屏加载全部路由 / 重依赖

```ts
// 反例 — 同步导入大依赖
import * as echarts from 'echarts'  // 几百 KB
import VueOfficeExcel from '@vue-office/excel'

// 正例 — 动态导入
const echarts = await import('echarts')
const VueOfficeExcel = defineAsyncComponent(() => import('@vue-office/excel'))
```

路由层面:**Vite + Vue Router 默认支持动态导入**,二级路由用 `() => import('...')`。

### 反模式 7:大图未压缩、未懒加载

```html
<!-- 反例 -->
<img src="/big.png" />

<!-- 正例 -->
<img src="/big.png" loading="lazy" decoding="async" />
<!-- 并使用 WebP / AVIF、CDN 自适应分辨率 -->
```

## 与 ai-kit 的关联

- 所有请求走 `useRequest`(`src/ai-kit/hooks/useRequest.ts`),它统一了 loading / error / 防抖 / 取消
- API 函数放 `services/`,页面**禁止**直接 fetch / axios
- 字典 / 枚举类数据可以做模块级缓存,但需要 TTL / 失效机制(避免变成 memory 反模式)

## 度量目标参考

| 指标 | 改造前 | 改造后目标 |
|------|--------|------------|
| LCP | > 4s | < 2.5s |
| TTI | > 5s | < 3s |
| 首屏 JS bundle | > 1MB | < 300KB |
| 关键路径请求数 | > 8 | ≤ 4 |
| API 平均 RT | 视后端而定 | 注明 baseline 与目标 |

## 报告里要给的"瀑布图清单"

写网络相关报告时,必须给出:

- [ ] 首屏关键路径上的资源/请求列表(按时间)
- [ ] 每条:大小、TTFB、是否阻塞渲染
- [ ] 优化后预期合并 / 并行 / 缓存的项
- [ ] 哪些可以推迟到首屏后(deferred)
