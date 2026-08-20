/**
 * object —— 对象处理工具集
 *
 * 功能：
 * - deepClone：深克隆（支持 Date / RegExp / Map / Set）
 * - deepMerge：深度合并（对象递归合并）
 * - pick：取对象部分字段
 * - omit：删除对象部分字段
 * - isEmpty：判断值是否为空（null/undefined/空字符串/空数组/空对象）
 * - isEqual：深度相等比较
 * - flattenObject：嵌套对象扁平化（{ a: { b: 1 } } → { 'a.b': 1 }）
 * - unflattenObject：扁平对象还原嵌套结构
 * - cleanEmpty：移除对象中所有空值字段（用于接口参数清理）
 *
 * AI 规则：
 * 所有对象克隆、合并、字段提取必须使用本工具
 * 禁止用 JSON.parse(JSON.stringify()) 做深克隆（会丢失 Date/undefined 等）
 *
 * 用法示例：
 * ```ts
 * const cloned = deepClone(obj)
 * const params = pick(form, ['name', 'phone'])
 * const rest = omit(form, ['password'])
 * cleanEmpty({ name: 'Tom', status: '', age: null }) // { name: 'Tom' }
 * ```
 */

/**
 * 深克隆（支持 Date / RegExp / Map / Set / Array）
 */
export function deepClone<T>(val: T, cache = new WeakMap()): T {
  if (val === null || typeof val !== 'object') return val
  if (cache.has(val as object)) return cache.get(val as object) as T

  if (val instanceof Date) return new Date(val) as T
  if (val instanceof RegExp) return new RegExp(val.source, val.flags) as T
  if (val instanceof Map) {
    const m = new Map()
    cache.set(val, m)
    val.forEach((v, k) => m.set(deepClone(k, cache), deepClone(v, cache)))
    return m as T
  }
  if (val instanceof Set) {
    const s = new Set()
    cache.set(val, s)
    val.forEach(v => s.add(deepClone(v, cache)))
    return s as T
  }

  const clone: Record<string, unknown> = Array.isArray(val) ? ([] as unknown as Record<string, unknown>) : {}
  cache.set(val as object, clone)
  for (const key of Object.keys(val as object)) {
    clone[key] = deepClone((val as Record<string, unknown>)[key], cache)
  }
  return clone as T
}

/**
 * 深度合并对象（source 覆盖 target，嵌套对象递归合并）
 * @example deepMerge({ a: { b: 1 } }, { a: { c: 2 } }) → { a: { b: 1, c: 2 } }
 */
export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target
  const source = sources.shift()
  if (source) {
    for (const key of Object.keys(source)) {
      const sv = source[key as keyof T]
      const tv = target[key as keyof T]
      if (sv && typeof sv === 'object' && !Array.isArray(sv)
        && tv && typeof tv === 'object' && !Array.isArray(tv)) {
        deepMerge(tv as Record<string, unknown>, sv as Record<string, unknown>)
      } else if (sv !== undefined) {
        ;(target as Record<string, unknown>)[key] = sv
      }
    }
  }
  return deepMerge(target, ...sources)
}

/**
 * 取对象指定字段（不修改原对象）
 * @example pick({ a:1, b:2, c:3 }, ['a','c']) → { a:1, c:3 }
 */
export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  return keys.reduce((acc, key) => {
    if (key in obj) acc[key] = obj[key]
    return acc
  }, {} as Pick<T, K>)
}

/**
 * 删除对象指定字段（不修改原对象）
 * @example omit({ a:1, b:2, c:3 }, ['b']) → { a:1, c:3 }
 */
export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const excludes = new Set(keys as string[])
  return Object.keys(obj).reduce((acc, key) => {
    if (!excludes.has(key)) (acc as Record<string, unknown>)[key] = obj[key]
    return acc
  }, {} as Omit<T, K>)
}

/**
 * 判断值是否为空
 * 空：null / undefined / '' / [] / {}
 */
export function isEmpty(val: unknown): boolean {
  if (val === null || val === undefined) return true
  if (typeof val === 'string') return val.trim() === ''
  if (Array.isArray(val)) return val.length === 0
  if (typeof val === 'object') return Object.keys(val as object).length === 0
  return false
}

/**
 * 深度相等比较
 */
export function isEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true
  if (typeof a !== typeof b) return false
  if (a === null || b === null) return false
  if (typeof a !== 'object') return false

  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    return a.every((v, i) => isEqual(v, (b as unknown[])[i]))
  }

  const keysA = Object.keys(a as object)
  const keysB = Object.keys(b as object)
  if (keysA.length !== keysB.length) return false
  return keysA.every(k =>
    Object.prototype.hasOwnProperty.call(b, k)
    && isEqual((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])
  )
}

/**
 * 嵌套对象扁平化（用于接口参数或表单数据处理）
 * @param obj    - 嵌套对象
 * @param prefix - 键前缀
 * @param sep    - 分隔符，默认 '.'
 * @example flattenObject({ a: { b: { c: 1 } } }) → { 'a.b.c': 1 }
 */
export function flattenObject(
  obj: Record<string, unknown>,
  prefix = '',
  sep = '.'
): Record<string, unknown> {
  return Object.keys(obj).reduce<Record<string, unknown>>((acc, key) => {
    const fullKey = prefix ? `${prefix}${sep}${key}` : key
    const val = obj[key]
    if (val && typeof val === 'object' && !Array.isArray(val) && !(val instanceof Date)) {
      Object.assign(acc, flattenObject(val as Record<string, unknown>, fullKey, sep))
    } else {
      acc[fullKey] = val
    }
    return acc
  }, {})
}

/**
 * 移除对象中所有空值字段（接口请求参数清理）
 * 空值：null / undefined / ''（不含 0 和 false）
 * @param deep - 是否递归清理嵌套对象（默认 false）
 */
export function cleanEmpty<T extends Record<string, unknown>>(obj: T, deep = false): Partial<T> {
  return Object.keys(obj).reduce((acc, key) => {
    const val = obj[key]
    if (val === null || val === undefined || val === '') return acc
    if (deep && val && typeof val === 'object' && !Array.isArray(val)) {
      const cleaned = cleanEmpty(val as Record<string, unknown>, true)
      if (Object.keys(cleaned).length) (acc as Record<string, unknown>)[key] = cleaned
    } else {
      (acc as Record<string, unknown>)[key] = val
    }
    return acc
  }, {} as Partial<T>)
}
