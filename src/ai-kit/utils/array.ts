/**
 * array —— 数组处理工具集
 *
 * 功能：
 * - unique：数组去重（支持对象数组按字段去重）
 * - groupBy：按字段分组
 * - chunk：数组分块（分页/批量处理）
 * - flatten：多维数组扁平化
 * - intersection：两数组交集
 * - difference：两数组差集
 * - sortBy：多字段排序
 * - sumBy / avgBy：按字段求和/均值
 * - maxBy / minBy：按字段取最大/最小值
 * - moveItem：移动数组元素位置
 * - toggleItem：数组成员切换（存在则删除，不存在则添加）
 *
 * AI 规则：
 * 所有列表数据处理（分组、去重、排序、统计）必须使用本工具
 * 禁止在组件内写内联 reduce/filter 复杂逻辑
 *
 * 用法示例：
 * ```ts
 * unique([1,2,2,3])                        // [1,2,3]
 * unique(users, 'id')                      // 按 id 去重
 * groupBy(orders, 'status')               // { paid: [...], pending: [...] }
 * chunk([1,2,3,4,5], 2)                   // [[1,2],[3,4],[5]]
 * sortBy(list, ['-score', 'name'])        // 按 score 降序，name 升序
 * ```
 */

/**
 * 数组去重
 * @param arr  - 原始数组
 * @param key  - 对象数组时按该字段去重（基本类型数组不需要）
 */
export function unique<T>(arr: T[], key?: keyof T): T[] {
  if (!key) return [...new Set(arr)]
  const seen = new Set<unknown>()
  return arr.filter(item => {
    const val = item[key]
    if (seen.has(val)) return false
    seen.add(val)
    return true
  })
}

/**
 * 按字段分组，返回以字段值为 key 的对象
 * @example groupBy([{type:'a'},{type:'b'},{type:'a'}], 'type') → { a:[...], b:[...] }
 */
export function groupBy<T extends Record<string, unknown>>(
  arr: T[],
  key: keyof T
): Record<string, T[]> {
  return arr.reduce<Record<string, T[]>>((acc, item) => {
    const group = String(item[key])
    ;(acc[group] ??= []).push(item)
    return acc
  }, {})
}

/**
 * 数组分块（用于分页展示或批量接口调用）
 * @example chunk([1,2,3,4,5], 2) → [[1,2],[3,4],[5]]
 */
export function chunk<T>(arr: T[], size: number): T[][] {
  if (size <= 0) return [arr]
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

/**
 * 多维数组扁平化（默认完全扁平）
 * @example flatten([[1,[2]],3]) → [1,2,3]
 */
export function flatten<T>(arr: unknown[], depth = Infinity): T[] {
  return arr.flat(depth) as T[]
}

/**
 * 两数组交集（基本类型）
 * @example intersection([1,2,3],[2,3,4]) → [2,3]
 */
export function intersection<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b)
  return a.filter(v => setB.has(v))
}

/**
 * 两数组差集（在 a 中不在 b 中的元素）
 * @example difference([1,2,3],[2,3]) → [1]
 */
export function difference<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b)
  return a.filter(v => !setB.has(v))
}

/**
 * 多字段排序（类似 lodash orderBy）
 * @param arr    - 对象数组
 * @param fields - 排序字段，'-' 前缀表示降序，如 ['-score', 'name']
 */
export function sortBy<T extends Record<string, unknown>>(arr: T[], fields: string[]): T[] {
  return [...arr].sort((a, b) => {
    for (const field of fields) {
      const desc = field.startsWith('-')
      const key = desc ? field.slice(1) : field
      const av = a[key] as string | number
      const bv = b[key] as string | number
      if (av === bv) continue
      const cmp = av < bv ? -1 : 1
      return desc ? -cmp : cmp
    }
    return 0
  })
}

/**
 * 按字段求和
 * @example sumBy(orders, 'amount') → 1234.5
 */
export function sumBy<T extends Record<string, unknown>>(arr: T[], key: keyof T): number {
  return arr.reduce((sum, item) => sum + Number(item[key] ?? 0), 0)
}

/**
 * 按字段求平均值
 */
export function avgBy<T extends Record<string, unknown>>(arr: T[], key: keyof T): number {
  if (!arr.length) return 0
  return sumBy(arr, key) / arr.length
}

/**
 * 按字段取最大值对应的元素
 * @example maxBy(users, 'age') → { name: 'Bob', age: 30 }
 */
export function maxBy<T extends Record<string, unknown>>(arr: T[], key: keyof T): T | undefined {
  return arr.reduce<T | undefined>((max, item) =>
    !max || Number(item[key]) > Number(max[key]) ? item : max, undefined)
}

/**
 * 按字段取最小值对应的元素
 */
export function minBy<T extends Record<string, unknown>>(arr: T[], key: keyof T): T | undefined {
  return arr.reduce<T | undefined>((min, item) =>
    !min || Number(item[key]) < Number(min[key]) ? item : min, undefined)
}

/**
 * 移动数组元素（不改变原数组）
 * @param arr   - 原始数组
 * @param from  - 源索引
 * @param to    - 目标索引
 */
export function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const result = [...arr]
  const [item] = result.splice(from, 1)
  result.splice(to, 0, item)
  return result
}

/**
 * 切换数组成员：已存在则移除，不存在则添加（用于多选 checkbox 状态管理）
 * @param arr   - 原始数组
 * @param item  - 要切换的元素
 * @param key   - 对象数组时用于比较的字段
 */
export function toggleItem<T>(arr: T[], item: T, key?: keyof T): T[] {
  const idx = key
    ? arr.findIndex(i => i[key] === item[key as keyof T])
    : arr.indexOf(item)
  if (idx > -1) return arr.filter((_, i) => i !== idx)
  return [...arr, item]
}
