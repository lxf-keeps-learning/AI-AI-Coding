import { ref, shallowRef } from 'vue'

/**
 * useDialog —— 弹窗 / 抽屉通用状态管理
 *
 * 功能：
 * - visible 单一来源控制
 * - 携带泛型 payload（record、id 等）
 * - Promise 化：open 返回 Promise，confirm/cancel 决议
 * - 自动清理：close 后重置 payload
 *
 * AI 规则：
 * 所有 Dialog / Drawer 开关逻辑优先使用本 hook，禁止父子双控 visible
 *
 * 用法示例：
 * ```ts
 * const { visible, payload, open, close, confirm } = useDialog<UserRecord>()
 *
 * // 打开并等待确认结果
 * const ok = await open(row)
 * if (ok) fetchList()
 * ```
 */
export function useDialog<T = unknown>() {
  const visible = ref(false)
  const payload = shallowRef<T | null>(null)
  const loading = ref(false)

  let _resolve: ((ok: boolean) => void) | null = null

  /** 打开弹窗，返回 Promise<boolean>（true=确认, false=取消） */
  function open(record?: T): Promise<boolean> {
    payload.value = record ?? null
    visible.value = true
    return new Promise((resolve) => {
      _resolve = resolve
    })
  }

  /** 确认关闭，决议 true */
  function confirm() {
    visible.value = false
    _resolve?.(true)
    _resolve = null
    payload.value = null
    loading.value = false
  }

  /** 取消 / ESC 关闭，决议 false */
  function close() {
    visible.value = false
    _resolve?.(false)
    _resolve = null
    payload.value = null
    loading.value = false
  }

  return { visible, payload, loading, open, close, confirm }
}
