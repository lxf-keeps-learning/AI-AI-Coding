# 性能改造报告模板

> 输出文件名建议:`performance-report-<日期>-<范围简写>.md`,例如 `performance-report-20260519-monitor-page.md`。

下面是完整模板。每一节都必须存在,即使内容为空也保留小标题并标注"无"或"未采集"。**没有度量指标的报告不接受**,这是硬性要求。

---

````markdown
# 性能改造报告 — <范围简写>

> 生成日期:YYYY-MM-DD
> 分析者:Claude / performance skill
> 项目版本:<git commit 或日期>

---

## 1. 症状采集摘要

**问题描述**:
- 现象:<进入页面后白屏 N 秒 / 滚动掉帧 / ...>
- 复现路径:<具体操作步骤>
- 发生范围:<生产 / 测试 / 仅 Chrome / 仅低配机 / ...>
- 数据量级:<行数 / 节点数 / 数据点 / JSON 大小>

**度量证据(baseline)**:
| 指标 | 工具 | 实测值 |
|------|------|--------|
| LCP | Lighthouse | 4.8s |
| TTI | Lighthouse | 6.2s |
| 滚动 FPS | Performance | 28 |
| 堆内存(刚进入 / 操作 10min) | Memory tab | 90MB / 280MB |
| 长任务最长 | Performance | 1.2s |

> 如果用户没提供 baseline,**在这里写"未提供,以下结论为假设性,建议立即采集 baseline 验证"**,并把"采集 baseline" 作为 P0 改造项写进改造清单。

---

## 2. 瓶颈分类与定位

> 多个瓶颈并存时,各列一节。每节给出:命中的类、定位证据、相关文件:行号。

### 2.1 渲染瓶颈

- **判定依据**:Vue Devtools 显示 UserTable 渲染 N 次/秒;Performance 火焰图 commit 段 120ms+
- **定位**:
  - `src/views/user/index.vue:80-95` — `<el-table>` 直接渲染 reactive 大数组
  - `src/views/user/index.vue:35` — `watch(form, ..., { deep: true })`
- **相关 reference**:render.md 反模式 3、反模式 4

### 2.2 内存瓶颈

- ...

(其它瓶颈节同上)

---

## 3. 优化方案

> 每条按下面格式,引用具体反模式与改法。

### 3.1 替换 deep watch 为字段级监听

- **文件**:`src/views/user/index.vue:35`
- **问题代码**:
  ```ts
  watch(form, () => save(form), { deep: true })
  ```
- **改造为**:
  ```ts
  watch(() => [form.value.name, form.value.status], () => save(form))
  ```
- **原理**:避免 Vue 遍历整棵 form 对象比对。
- **影响面**:单组件,无 API 变更
- **复用 ai-kit**:无新增,仅写法调整

### 3.2 表格数据改 shallowRef + 走 useTable

- **文件**:`src/views/user/index.vue:80-95`
- **问题代码**:
  ```ts
  const tableData = reactive<User[]>([])
  ```
- **改造为**:
  ```ts
  const { data, pagination, loading } = useTable<User>({
    fetcher: (params) => getUserList(params)
  })
  ```
- **原理**:`useTable` 内部使用合适的响应式形态,避免 reactive 大数组的跟踪开销
- **影响面**:模板部分需要把 `:data="tableData"` 改为 `:data="data"`,分页改为 useTable 的 `pagination`
- **复用 ai-kit**:`useTable`(`src/ai-kit/hooks/useTable.ts`)

### 3.3 (其它优化方案)

---

## 4. 改造清单与优先级

| 优先级 | 项目 | 类型 | 工作量 | 风险 | 验收 |
|--------|------|------|--------|------|------|
| P0 | 3.1 替换 deep watch | 渲染/计算 | 0.25d | 低 | 输入字段不再触发整 form 比对 |
| P0 | 3.2 表格改 useTable + 服务端分页 | 渲染/大数据 | 1d | 中 | 5000 条数据下滚动 FPS ≥ 55 |
| P1 | 3.3 图表降采样 | 图表/大数据 | 0.5d | 低 | 10000 点初始化 < 800ms |
| P2 | 加性能埋点 | 度量 | 0.25d | 无 | 上线后能持续看 LCP/FPS |

**优先级定义**:

- **P0** = 修复后立刻消除可观测的卡顿/泄漏/白屏
- **P1** = 在压力场景下能消除瓶颈,但日常用户感知不强
- **P2** = 度量、防回归、文档同步

---

## 5. 度量指标(改造前 baseline → 改造后目标)

> **无指标 = 没法验证 = 报告不合格**。即使是估算值,也必须写出来,后续改造完用真实值校准。

| 指标 | 改造前 | 改造后目标 | 改造后实测(留空) |
|------|--------|------------|--------------------|
| LCP | 4.8s | < 2.5s | |
| TTI | 6.2s | < 3s | |
| 5000 行表格滚动 FPS | 28 | ≥ 55 | |
| 10min 操作后堆内存 | 280MB | < 120MB | |
| 长任务最长 | 1.2s | < 200ms | |

---

## 6. 回滚预案

- 3.2 表格改 useTable:保留 `feature.useTableV2` 开关(本地配置),问题时切回旧表格
- 3.3 图表降采样:`sampling` 配置抽到 props,可一键切回不采样
- 整体:本次改造的 git 分支可以整组 revert,影响范围限在 `src/views/user/` 与 `src/ai-kit/hooks/useTable.ts` 的扩展点

---

## 7. 附录:复现脚本 / 截图占位

- Performance 录制:<链接 / 路径>
- Memory 快照:<链接 / 路径>
- Lighthouse 报告:<链接 / 路径>
````

---

## 写报告时的注意事项

- **症状未采集就不要推方案**。如果还没拿到 baseline,在第 1 节明确写"未采集",并把采集作为 P0 推上去
- **每个方案引用具体 reference 中的反模式编号**,便于 reviewer 验证
- **优先复用 ai-kit**:任何方案如果绕开 ai-kit 自造,在该方案下面写"为什么不能用现有 ai-kit"
- **度量目标必须给具体数字**,即使是预估,后续校准
- **不夸大收益**:不要写"性能大幅提升",写"FPS 25 → 55",可量化
- **回滚预案不能省**:特性开关 / 配置项 / git 整组 revert,至少一种

## 报告产出位置

报告默认写到项目根的 `docs/performance-reports/`(若目录不存在则在报告里提示需要创建)。文件命名 `performance-report-YYYYMMDD-<scope>.md`。
