import { ref, shallowRef, type Ref, type ShallowRef } from 'vue'

export interface UseDialogReturn<T> {
  visible: Ref<boolean>
  payload: ShallowRef<T | null>
  loading: Ref<boolean>
  open: (record?: T) => Promise<boolean>
  close: () => void
  confirm: () => void
  setLoading: (value: boolean) => void
}

/**
 * useDialog —— 管理弹窗或抽屉的显示、载荷和确认结果
 *
 * 功能：
 * - visible / payload / loading 单一来源
 * - open 返回 Promise<boolean>，confirm / close 完成决议
 * - 重复 open 时先以 false 结束上一次调用，避免悬空 Promise
 *
 * AI 规则：
 * 所有 Dialog / Drawer 状态优先使用本 hook，禁止父子双控 visible
 * 与 BaseDialog / BaseDrawer 配套使用
 *
 * 用法示例：
 * ```ts
 * const dialog = useDialog<UserRecord>()
 * const confirmed = await dialog.open(row)
 * ```
 */
export function useDialog<T = unknown>(): UseDialogReturn<T> {
  const visible = ref(false)
  const payload = shallowRef<T | null>(null)
  const loading = ref(false)
  let resolvePending: ((confirmed: boolean) => void) | null = null

  function settle(confirmed: boolean) {
    resolvePending?.(confirmed)
    resolvePending = null
    visible.value = false
    payload.value = null
    loading.value = false
  }

  function open(record?: T): Promise<boolean> {
    resolvePending?.(false)
    payload.value = record ?? null
    loading.value = false
    visible.value = true
    return new Promise((resolve) => {
      resolvePending = resolve
    })
  }

  function confirm() {
    settle(true)
  }

  function close() {
    settle(false)
  }

  function setLoading(value: boolean) {
    loading.value = value
  }

  return { visible, payload, loading, open, close, confirm, setLoading }
}
