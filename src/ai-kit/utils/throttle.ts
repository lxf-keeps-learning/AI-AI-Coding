/**
 * throttle 工具函数
 *
 * AI规则：
 * 滚动、resize、大数据场景优先复用
 */
export interface ThrottledFunction<TArgs extends unknown[]> {
  (...args: TArgs): void
  cancel: () => void
}

export function throttle<TArgs extends unknown[]>(
  fn: (...args: TArgs) => unknown,
  interval = 200
): ThrottledFunction<TArgs> {
  let lastRun = 0
  let timer: ReturnType<typeof setTimeout> | null = null
  let latestArgs: TArgs | null = null
  let latestThis: unknown

  const throttled = function (this: unknown, ...args: TArgs) {
    const now = Date.now()
    const wait = Math.max(0, interval - (now - lastRun))
    latestArgs = args
    latestThis = this

    const invoke = () => {
      timer = null
      lastRun = Date.now()
      const invokeArgs = latestArgs
      const context = latestThis
      latestArgs = null
      latestThis = undefined
      if (invokeArgs) fn.apply(context, invokeArgs)
    }

    if (wait === 0) {
      if (timer) clearTimeout(timer)
      invoke()
    } else if (!timer) {
      timer = setTimeout(invoke, wait)
    }
  } as ThrottledFunction<TArgs>

  throttled.cancel = () => {
    if (timer) clearTimeout(timer)
    timer = null
    latestArgs = null
    latestThis = undefined
    lastRun = 0
  }

  return throttled
}
