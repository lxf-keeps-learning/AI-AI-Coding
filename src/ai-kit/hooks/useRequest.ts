import { ref, shallowRef, type Ref, type ShallowRef } from 'vue'

export interface UseRequestOptions<T, P extends unknown[]> {
  immediate?: boolean
  defaultParams?: P
  initialData?: T
  onSuccess?: (data: T) => void
  onError?: (error: unknown) => void
}

export interface UseRequestReturn<T, P extends unknown[]> {
  data: ShallowRef<T | undefined>
  loading: Ref<boolean>
  error: ShallowRef<unknown | null>
  run: (...args: P) => Promise<T | undefined>
  refresh: () => Promise<T | undefined>
  cancel: () => void
  reset: () => void
}

/**
 * useRequest —— 统一管理异步请求的数据、状态和并发结果
 *
 * 功能：
 * - 统一 data / loading / error
 * - 支持 immediate、手动 run 和携带最后参数的 refresh
 * - 只允许最后一次请求更新状态，避免旧响应覆盖新响应
 * - cancel 使当前响应失效；实际中止网络请求应由 service 使用 AbortSignal
 *
 * AI 规则：
 * 页面级异步状态优先使用本 hook，禁止重复封装 loading/error/data
 * 有参数的 immediate 请求必须提供 defaultParams
 *
 * 用法示例：
 * ```ts
 * const request = useRequest(getUserById, { defaultParams: [1], immediate: true })
 * await request.run(2)
 * ```
 */
export function useRequest<T, P extends unknown[] = []>(
  apiFn: (...args: P) => Promise<T>,
  options: UseRequestOptions<T, P> = {}
): UseRequestReturn<T, P> {
  const { immediate = false, defaultParams, initialData, onSuccess, onError } = options
  const data = shallowRef<T | undefined>(initialData)
  const loading = ref(false)
  const error = shallowRef<unknown | null>(null)
  let lastArgs: P | undefined = defaultParams
  let requestId = 0

  async function run(...args: P): Promise<T | undefined> {
    const currentRequestId = ++requestId
    lastArgs = args
    loading.value = true
    error.value = null
    try {
      const result = await apiFn(...args)
      if (currentRequestId !== requestId) return result
      data.value = result
      onSuccess?.(result)
      return result
    } catch (caughtError) {
      if (currentRequestId !== requestId) return undefined
      error.value = caughtError
      onError?.(caughtError)
      return undefined
    } finally {
      if (currentRequestId === requestId) loading.value = false
    }
  }

  function refresh(): Promise<T | undefined> {
    return lastArgs ? run(...lastArgs) : Promise.resolve(undefined)
  }

  function cancel() {
    requestId += 1
    loading.value = false
  }

  function reset() {
    cancel()
    data.value = initialData
    error.value = null
    lastArgs = defaultParams
  }

  if (immediate) {
    if (!defaultParams && apiFn.length > 0) {
      error.value = new Error('useRequest: 有参数的 immediate 请求必须提供 defaultParams')
    } else {
      void run(...(defaultParams ?? ([] as unknown as P)))
    }
  }

  return { data, loading, error, run, refresh, cancel, reset }
}
