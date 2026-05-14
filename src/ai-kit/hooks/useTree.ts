import { ref } from 'vue'

/**
 * useTree —— Tree 组件通用状态管理
 *
 * 功能：
 * - treeData 数据维护 + loading
 * - 搜索过滤（filterText 驱动 el-tree filter-node-method）
 * - 勾选 / 展开节点 keys 管理
 * - 刷新树数据
 *
 * AI 规则：
 * 所有 Tree 页面优先使用本 hook，禁止在页面内裸声明 treeData / filterText
 *
 * 用法示例：
 * ```ts
 * const { treeData, loading, filterText, checkedKeys, fetchTree } =
 *   useTree(() => getDeptTree())
 * ```
 */
export function useTree<T = unknown>(apiFn: () => Promise<T[]>) {
  const treeData = ref<T[]>([])
  const loading = ref(false)
  const filterText = ref('')
  const checkedKeys = ref<(string | number)[]>([])
  const expandedKeys = ref<(string | number)[]>([])

  async function fetchTree() {
    loading.value = true
    try {
      treeData.value = await apiFn()
    } finally {
      loading.value = false
    }
  }

  /** 配合 el-tree :filter-node-method 使用 */
  function filterNode(value: string, data: Record<string, unknown>, label = 'label') {
    if (!value) return true
    return String(data[label] ?? '').includes(value)
  }

  function resetChecked() {
    checkedKeys.value = []
  }

  return {
    treeData,
    loading,
    filterText,
    checkedKeys,
    expandedKeys,
    fetchTree,
    filterNode,
    resetChecked,
  }
}
