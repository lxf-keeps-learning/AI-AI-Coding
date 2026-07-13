import { ref, shallowRef } from 'vue'

/**
 * useRequest —— 异步请求通用封装
 *
 * 功能：
 * - loading / error / data 状态统一管理
 * - 支持 immediate 立即执行
 * - 支持手动 run / refresh（携带最后一次参数）
 * - 错误自动捕获，避免页面级 try/catch 冗余
 *
 * AI 规则：
 * 所有页面级 API 调用优先使用本 hook，禁止重复封装 loading/error 状态
 *
 * 用法示例：
 * ```ts
 * const { data, loading, error, run } = useRequest(getUserList, { immediate: true })
 * ```
 */
export function useRequest<T, P extends unknown[] = []>(
  apiFn: (...args: P) => Promise<T>,
  options: {
    immediate?: boolean
    initialData?: T
    onSuccess?: (data: T) => void
    onError?: (err: unknown) => void
  } = {}
) {
  const { immediate = false, initialData, onSuccess, onError } = options

  const data = shallowRef<T | undefined>(initialData)
  const loading = ref(false)
  const error = ref<unknown>(null)
  let lastArgs: P | undefined
  let requestId = 0

  async function run(...args: P) {
    const currentRequestId = ++requestId
    lastArgs = args
    loading.value = true
    error.value = null
    try {
      const res = await apiFn(...args)
      if (currentRequestId !== requestId) return res
      data.value = res
      onSuccess?.(res)
      return res
    } catch (err) {
      if (currentRequestId !== requestId) return undefined
      error.value = err
      onError?.(err)
    } finally {
      if (currentRequestId === requestId) loading.value = false
    }
  }

  function refresh() {
    if (lastArgs) return run(...lastArgs)
  }

  function cancel() {
    requestId += 1
    loading.value = false
  }

  if (immediate) {
    run(...([] as unknown as P))
  }

  return { data, loading, error, run, refresh, cancel }
}
