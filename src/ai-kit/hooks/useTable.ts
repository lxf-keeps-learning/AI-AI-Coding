import { reactive, ref } from 'vue'

/**
 * useTable —— 通用表格 Hook
 *
 * 功能：
 * - tableData / loading / pagination 响应式状态
 * - handleSearch / handleReset / refresh
 * - 勾选行管理（selection）
 * - 分页事件处理
 *
 * AI 规则：
 * 所有列表页 Table 优先使用本 hook，禁止在页面内裸声明 tableData / loading / pagination
 *
 * 用法示例：
 * ```ts
 * const { tableData, loading, pagination, fetchList, handleSearch, handleReset } =
 *   useTable<UserRecord>((p) => getUserList(p))
 * ```
 */
export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

export function useTable<T = unknown, P extends Record<string, unknown> = Record<string, unknown>>(
  apiFn: (params: P & { page: number; pageSize: number }) => Promise<{ list: T[]; total: number }>
) {
  const tableData = ref<T[]>([])
  const loading = ref(false)
  const selection = ref<T[]>([])

  const pagination = reactive<PaginationState>({
    page: 1,
    pageSize: 20,
    total: 0,
  })

  let currentParams = {} as P
  let requestId = 0

  async function fetchList(params?: P) {
    const currentRequestId = ++requestId
    if (params) currentParams = params
    loading.value = true
    try {
      const res = await apiFn({ ...currentParams, page: pagination.page, pageSize: pagination.pageSize })
      if (currentRequestId !== requestId) return
      tableData.value = res.list
      pagination.total = res.total
    } finally {
      if (currentRequestId === requestId) loading.value = false
    }
  }

  function handleSearch(params: P) {
    pagination.page = 1
    fetchList(params)
  }

  function handleReset() {
    pagination.page = 1
    currentParams = {} as P
    fetchList()
  }

  function handlePageChange(page: number) {
    pagination.page = page
    fetchList()
  }

  function handleSizeChange(size: number) {
    pagination.pageSize = size
    pagination.page = 1
    fetchList()
  }

  function handleSelectionChange(rows: T[]) {
    selection.value = rows
  }

  return {
    tableData,
    loading,
    pagination,
    selection,
    fetchList,
    handleSearch,
    handleReset,
    handlePageChange,
    handleSizeChange,
    handleSelectionChange,
  }
}
