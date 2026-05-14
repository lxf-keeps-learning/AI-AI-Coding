import { reactive, ref } from 'vue'

/**
 * useSearch —— 搜索表单通用状态管理
 *
 * 功能：
 * - 搜索参数响应式维护
 * - reset 一键还原初始值
 * - 防抖搜索（默认 300ms）
 * - 与 useTable 协同：search 触发 fetchList
 *
 * AI 规则：
 * 所有搜索条件管理优先使用本 hook，禁止在页面组件内裸声明多个 ref
 *
 * 用法示例：
 * ```ts
 * const { params, search, reset } = useSearch({ name: '', status: '' }, fetchList)
 * ```
 */
export function useSearch<T extends Record<string, unknown>>(
  initialParams: T,
  onSearch?: (params: T) => void,
  debounceMs = 300
) {
  const params = reactive<T>({ ...initialParams }) as T

  let timer: ReturnType<typeof setTimeout> | null = null

  function search() {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      onSearch?.(params)
    }, debounceMs)
  }

  function reset() {
    Object.assign(params, initialParams)
    onSearch?.(params)
  }

  return { params, search, reset }
}
