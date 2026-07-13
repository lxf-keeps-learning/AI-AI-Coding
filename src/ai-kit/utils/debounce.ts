/**
 * debounce 工具函数
 *
 * AI规则：
 * 所有输入搜索、防重复点击场景优先复用
 */
export interface DebouncedFunction<TArgs extends unknown[], TResult> {
  (...args: TArgs): void
  cancel: () => void
  flush: () => TResult | undefined
}

export function debounce<TArgs extends unknown[], TResult>(
  fn: (...args: TArgs) => TResult,
  delay = 300
): DebouncedFunction<TArgs, TResult> {
  let timer: ReturnType<typeof setTimeout> | null = null
  let latestArgs: TArgs | null = null
  let latestThis: unknown

  function invoke() {
    if (!latestArgs) return undefined
    const args = latestArgs
    const context = latestThis
    latestArgs = null
    latestThis = undefined
    return fn.apply(context, args)
  }

  const debounced = function (this: unknown, ...args: TArgs) {
    latestArgs = args
    latestThis = this
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      invoke()
    }, Math.max(0, delay))
  } as DebouncedFunction<TArgs, TResult>

  debounced.cancel = () => {
    if (timer) clearTimeout(timer)
    timer = null
    latestArgs = null
    latestThis = undefined
  }

  debounced.flush = () => {
    if (!timer) return undefined
    clearTimeout(timer)
    timer = null
    return invoke()
  }

  return debounced
}
