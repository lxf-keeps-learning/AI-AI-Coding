# LLD-前端-cascade-filter

> 状态：评审中 ｜ 版本：v1.0 ｜ 需求 slug：cascade-filter
> 负责人：@lxf    上游：design/cascade-filter/HLD-cascade-filter-概要设计.md
> 变更记录：v1.0 2026-08-20 初始创建（组件 API 定稿）

## 1. 技术栈与约束
- Vue 3 + TS(strict) + Vite；UI 基础 **Element Plus（el-cascader 懒加载模式）**；状态本地化（不进 Pinia）
- 代码规范引用：`.cursor/rules/global/*`（base/architecture/naming/typescript）+ `tree/lazy-tree.mdc`（懒加载树行为）+ `hooks/use-request.mdc`
- 禁止：`any`、type assertion；**必须复用 ai-kit**（useRequest / 树 / 空态），禁止重复实现

## 2. 目录结构（★ 写死，供 design_ref 引用）

```
src/ai-kit/cascade-filter/
├── CascadeFilter.vue          # 对外主组件（el-cascader 封装，含"不限"注入）
├── useCascadeOptions.ts       # 核心 Hook：选项加载/缓存/清空/回显/重试
├── types.ts                   # CascadeOption / CascadeFilterProps / 事件签名
├── index.ts                   # 统一导出（组件 + 类型）
└── __tests__/
    ├── useCascadeOptions.spec.ts
    └── CascadeFilter.spec.ts

# 业务接入（示例，非组件库内容）
src/pages/any-page/index.vue    # 引入 CascadeFilter + 写 fetcher + v-model
```

## 3. 组件 API（★ 定稿）

### Props

| prop | 类型 | 默认 | 说明 |
|------|------|------|------|
| modelValue | `CascadeValue` | `[]` | 选中值，**定长数组 `[一级,二级,三级]`**，`undefined` = 该级不限/未选 |
| fetchOptions | `FetchOptions` | 必填 | 选项加载函数 `(level, parentId?) => Promise<CascadeOption[]>` |
| levels | `number` | `3` | 级数（2/3/4 可配，>=2） |
| allowEmpty | `boolean` | `false` | 每级是否注入"不限"选项 |
| emptyLabel | `string` | `'不限'` | "不限"文案 |
| placeholder | `string` | `'请选择'` | 占位文案 |
| disabled | `boolean` | `false` | 整体禁用 |
| clearable | `boolean` | `true` | 是否可一键清空 |

### Emits

| 事件 | 参数 | 说明 |
|------|------|------|
| update:modelValue | `CascadeValue` | v-model 同步（含回显完成时） |
| change | `CascadeValue` | 用户主动变更/清空后触发（回显不触发）→ 调用方发起查询 |

## 4. 数据模型与类型定义（★ 写死）

```typescript
// types.ts
export type CascadeLevel = 1 | 2 | 3

export interface CascadeOption {
  id: string
  name: string
  hasChildren?: boolean   // 未知时按 level < levels 视为有下级
  disabled?: boolean
}

/** 选中值：定长数组，undefined 表示该级不限/未选 */
export type CascadeValue = Array<string | undefined>

export type FetchOptions = (
  level: CascadeLevel,
  parentId?: string,
) => Promise<CascadeOption[]>

export interface CascadeFilterProps {
  modelValue: CascadeValue
  fetchOptions: FetchOptions
  levels?: number
  allowEmpty?: boolean
  emptyLabel?: string
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
}
```

## 5. Hook 抽象（useCascadeOptions）

| Hook | 职责 | 返回 |
|------|------|------|
| useCascadeOptions | 各级选项的加载/缓存/清空/回显/重试 | 见下 |

```typescript
export function useCascadeOptions(opts: {
  fetchOptions: FetchOptions
  levels: number
}) {
  return {
    optionsByLevel: Ref<Map<CascadeLevel, CascadeOption[]>>, // 已加载选项（缓存）
    loadingByLevel: Ref<Map<CascadeLevel, boolean>>,        // 每级独立 loading
    errorByLevel:   Ref<Map<CascadeLevel, string>>,         // 每级独立 error
    hydrating:      Ref<boolean>,                           // 回显补齐中，面板禁用
    loadLevel:      (level: CascadeLevel, parentId?: string) => Promise<void>,
    hydrate:        (value: CascadeValue) => Promise<void>, // 回显逐级补齐
    clearBelow:     (level: CascadeLevel) => void,          // 清空下级选项缓存与值
    retry:          (level: CascadeLevel, parentId?: string) => Promise<void>,
  }
}
```

**缓存策略**：`optionsByLevel` 以 `level` 为键缓存；**选择变更后 `clearBelow` 立即失效下级缓存**（数据依赖上级，必须重拉），本级缓存保留（同级切换不回源）。

## 6. 组件内部结构（CascadeFilter.vue）

```vue
<template>
  <el-cascader
    v-model="innerValue"
    :props="cascaderProps"        <!-- lazy 模式 + checkStrictly + 自定义 resolve -->
    :placeholder="placeholder"
    :disabled="disabled || hydrating"
    :clearable="clearable"
    @change="onChange"
  />
</template>
```

**el-cascader lazy 桥接**（核心）：

```typescript
const cascaderProps = {
  lazy: true,
  checkStrictly: true,                    // 允许选任意级（只选到二级也成立）
  lazyLoad: async (node, resolve) => {
    const level = node.level as CascadeLevel
    const parentId = node.level === 1 ? undefined : (node.value as string)
    await loadLevel(level, parentId)      // 走 useCascadeOptions（含 loading/error/缓存）
    const opts = normalizeOptions(optionsByLevel.value.get(level) ?? [], level)
    resolve(opts)
  },
}
```

**"不限"注入**：`normalizeOptions` 在 `allowEmpty=true` 时于每级头部插入 `{ id: '', name: emptyLabel }`，选中后该级值为 `undefined`（定长数组语义，查询侧统一按"最后一级有值"截断）。

**事件时序**：

```
挂载
 ├─ modelValue 有值 → hydrate(value)：loadLevel(1)→命中→loadLevel(2)→命中→loadLevel(3)
 │    任一环缺失 → 截断到上一级 + 轻提示；hydrating 全程 true（面板禁用）
 └─ 无值 → loadLevel(1)
选一级(id1) → clearBelow(1) + emit update → loadLevel(2, id1)
选二级(id2) → clearBelow(2) + emit update → loadLevel(3, id2)
选三级/清空/点"不限" → emit update:modelValue + emit change
```

## 7. 边界与异常处理

| 场景 | 行为 |
|------|------|
| 某级加载中 | 该级 loading（skeleton/面板 loading），下级不可点 |
| 接口失败 | 该级 error 态 + 重试按钮（retry 同参重拉），**不打断其他级已选状态** |
| 空数据 | 该级空态"暂无选项"，不白屏 |
| 回显值失效 | 截断到仍有值的上一级 + 轻提示 |
| 只选到二级 | value=[id1,id2,undefined]，查询按二级范围（调用方处理） |
| 全部清空 | value=[] → change([]) → 查询全量 |
| allowEmpty=false 且上级未选 | 下级不可用（el-cascader 天然约束） |

## 8. 测试要点（供 ai-testing-orchestrator 用）

- **useCascadeOptions 单测**：
  - loadLevel：入参正确（level+parentId）、缓存命中不重复请求、失败置 error
  - clearBelow：下级缓存失效 + 值截断
  - hydrate：逐级补齐顺序、缺环截断、hydrating 状态翻转
- **CascadeFilter 组件测试**（mock fetchOptions）：
  - 挂载无值 → 只调 `loadLevel(1)`，入参 `(1, undefined)`
  - 选一级 → 调用 `(2, id1)`；选二级 → `(3, id2)`
  - 变更一级 → 二三级选项清空、value 截断
  - allowEmpty=true → 每级含"不限"项，选中后该级 undefined
  - 回显：value=[a,b,c] → 依次调用 1/2/3 级；缺失 → 截断
  - change 仅在用户操作时触发（回显不触发）

## 9. 业务接入示例（复用姿势）

```vue
<script setup lang="ts">
import { ref } from 'vue'
import CascadeFilter from '@/ai-kit/cascade-filter/CascadeFilter.vue'
import type { CascadeOption } from '@/ai-kit/cascade-filter/types'

const filter = ref<Array<string | undefined>>([])

// 换业务只换这个函数：省市区 / 组织架构 / 商品类目 各自适配
async function fetchOptions(level: 1 | 2 | 3, parentId?: string): Promise<CascadeOption[]> {
  const { data } = await request.get('/api/cascade/options', { params: { level, parentId } })
  return data.options
}

function onFilterChange(val: Array<string | undefined>) {
  queryList(val)   // 触发列表/报表查询
}
</script>

<template>
  <CascadeFilter v-model="filter" :fetch-options="fetchOptions" allow-empty @change="onFilterChange" />
</template>
```
