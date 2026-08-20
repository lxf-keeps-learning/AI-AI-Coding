import { afterEach, describe, expect, it, vi } from 'vitest'
import { debounce } from '../../src/ai-kit/utils/debounce'
import { throttle } from '../../src/ai-kit/utils/throttle'

afterEach(() => {
  vi.useRealTimers()
})

describe('debounce', () => {
  it('只执行最后一次参数，并支持 flush', () => {
    vi.useFakeTimers()
    const callback = vi.fn((value: number) => value * 2)
    const run = debounce(callback, 100)
    run(1)
    run(2)

    expect(callback).not.toHaveBeenCalled()
    expect(run.flush()).toBe(4)
    expect(callback).toHaveBeenCalledOnce()
    expect(callback).toHaveBeenCalledWith(2)
  })
})

describe('throttle', () => {
  it('立即执行第一次，并在窗口结束时执行最后一次', () => {
    vi.useFakeTimers()
    const callback = vi.fn()
    const run = throttle(callback, 100)
    run(1)
    run(2)
    run(3)

    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenLastCalledWith(1)
    vi.advanceTimersByTime(100)
    expect(callback).toHaveBeenCalledTimes(2)
    expect(callback).toHaveBeenLastCalledWith(3)
  })
})
