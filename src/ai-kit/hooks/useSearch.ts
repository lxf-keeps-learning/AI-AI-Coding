import { onUnmounted, reactive, toRaw, type UnwrapNestedRefs } from 'vue'
import { debounce, type DebouncedFunction } from '../utils/debounce'

export interface UseSearchReturn<T extends Record<string, unknown>> {
  params: UnwrapNestedRefs<T>
  search: DebouncedFunction<[], void>
  searchImmediately: () => void
  reset: () => void
  getParams: () => T
}

/**
 * useSearch —— 管理搜索参数、防抖提交和重置
 *
 * 功能：
 * - 从初始值创建响应式查询模型
 * - search 防抖触发，searchImmediately 立即触发
 * - 向回调传递普通对象快照，避免响应式对象后续变化
 * - 组件卸载时取消待执行任务
 *
 * AI 规则：
 * 列表查询参数优先使用本 hook，禁止页面用多个独立 ref 重复管理
 * 与 BaseSearch / useTable 配套使用
 *
 * 用法示例：
 * ```ts
 * const search = useSearch({ name: '', status: undefined }, table.handleSearch)
 * ```
 */
export function useSearch<T extends Record<string, unknown>>(
  initialParams: T,
  onSearch?: (params: T) => void,
  debounceMs = 300
): UseSearchReturn<T> {
  const initialSnapshot = { ...initialParams }
  const params = reactive({ ...initialSnapshot }) as UnwrapNestedRefs<T>

  function getParams(): T {
    return { ...(toRaw(params) as T) }
  }

  function searchImmediately() {
    onSearch?.(getParams())
  }

  const search = debounce(searchImmediately, debounceMs)

  function reset() {
    search.cancel()
    Object.assign(params, initialSnapshot)
    searchImmediately()
  }

  onUnmounted(search.cancel)

  return { params, search, searchImmediately, reset, getParams }
}
