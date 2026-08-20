import { describe, expect, it, vi } from 'vitest'
import { useDialog } from '../../src/ai-kit/hooks/useDialog'
import { useRequest } from '../../src/ai-kit/hooks/useRequest'
import { useTable } from '../../src/ai-kit/hooks/useTable'

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void
  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })
  return { promise, resolve, reject }
}

describe('useDialog', () => {
  it('重复打开时结束上一次 Promise，并正确返回确认结果', async () => {
    const dialog = useDialog<{ id: number }>()
    const first = dialog.open({ id: 1 })
    const second = dialog.open({ id: 2 })

    await expect(first).resolves.toBe(false)
    expect(dialog.payload.value).toEqual({ id: 2 })

    dialog.confirm()
    await expect(second).resolves.toBe(true)
    expect(dialog.visible.value).toBe(false)
    expect(dialog.payload.value).toBeNull()
  })
})

describe('useRequest', () => {
  it('只允许最后一次请求更新 data', async () => {
    const first = deferred<string>()
    const second = deferred<string>()
    const api = vi.fn().mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise)
    const request = useRequest(api)

    const firstRun = request.run()
    const secondRun = request.run()
    second.resolve('new')
    await secondRun
    first.resolve('old')
    await firstRun

    expect(request.data.value).toBe('new')
    expect(request.loading.value).toBe(false)
  })

  it('有参数的 immediate 请求缺少 defaultParams 时给出错误', () => {
    const request = useRequest(async (_id: number) => 'ok', { immediate: true })
    expect(request.error.value).toBeInstanceOf(Error)
  })
})

describe('useTable', () => {
  it('捕获错误并允许后续重试恢复', async () => {
    const api = vi
      .fn()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({ list: [{ id: 1 }], total: 1 })
    const table = useTable<{ id: number }>(api)

    await expect(table.fetchList()).resolves.toBe(false)
    expect(table.error.value).toBeInstanceOf(Error)

    await expect(table.fetchList()).resolves.toBe(true)
    expect(table.error.value).toBeNull()
    expect(table.tableData.value).toEqual([{ id: 1 }])
  })
})
