import { ref, shallowRef, type Ref, type ShallowRef } from 'vue'

export type TreeKey = string | number

export interface UseTreeReturn<T> {
  treeData: ShallowRef<T[]>
  loading: Ref<boolean>
  error: ShallowRef<unknown | null>
  filterText: Ref<string>
  checkedKeys: Ref<TreeKey[]>
  expandedKeys: Ref<TreeKey[]>
  fetchTree: () => Promise<boolean>
  filterNode: (value: string, data: Record<string, unknown>, label?: string) => boolean
  resetChecked: () => void
}

/**
 * useTree —— 管理树数据、筛选、勾选、展开和请求状态
 *
 * 功能：
 * - 统一 treeData / loading / error
 * - 维护 filterText、checkedKeys 和 expandedKeys
 * - 并发刷新时只应用最后一次结果
 *
 * AI 规则：
 * 所有远程树数据场景优先使用本 hook，禁止页面重复管理树状态
 * 与 BaseTree 配套使用；纯静态小树可以只使用 BaseTree
 *
 * 用法示例：
 * ```ts
 * const tree = useTree<DeptNode>(getDeptTree)
 * onMounted(tree.fetchTree)
 * ```
 */
export function useTree<T>(apiFn: () => Promise<T[]>): UseTreeReturn<T> {
  const treeData = shallowRef<T[]>([])
  const loading = ref(false)
  const error = shallowRef<unknown | null>(null)
  const filterText = ref('')
  const checkedKeys = ref<TreeKey[]>([])
  const expandedKeys = ref<TreeKey[]>([])
  let requestId = 0

  async function fetchTree(): Promise<boolean> {
    const currentRequestId = ++requestId
    loading.value = true
    error.value = null
    try {
      const result = await apiFn()
      if (currentRequestId !== requestId) return false
      treeData.value = result
      return true
    } catch (caughtError) {
      if (currentRequestId !== requestId) return false
      error.value = caughtError
      return false
    } finally {
      if (currentRequestId === requestId) loading.value = false
    }
  }

  function filterNode(value: string, data: Record<string, unknown>, label = 'label') {
    if (!value) return true
    return String(data[label] ?? '').toLocaleLowerCase().includes(value.toLocaleLowerCase())
  }

  function resetChecked() {
    checkedKeys.value = []
  }

  return { treeData, loading, error, filterText, checkedKeys, expandedKeys, fetchTree, filterNode, resetChecked }
}
