import { reactive, ref, shallowRef, type Ref, type ShallowRef } from 'vue'

export interface PaginationState {
  page: number
  pageSize: number
  total: number
}

export interface TableResponse<T> {
  list: T[]
  total: number
}

export interface UseTableOptions {
  initialPage?: number
  initialPageSize?: number
  onError?: (error: unknown) => void
}

export interface UseTableReturn<T, P extends Record<string, unknown>> {
  tableData: ShallowRef<T[]>
  loading: Ref<boolean>
  error: ShallowRef<unknown | null>
  pagination: PaginationState
  selection: Ref<T[]>
  fetchList: (params?: P) => Promise<boolean>
  refresh: () => Promise<boolean>
  cancel: () => void
  handleSearch: (params: P) => Promise<boolean>
  handleReset: () => Promise<boolean>
  handlePageChange: (page: number) => Promise<boolean>
  handleSizeChange: (size: number) => Promise<boolean>
  handleSelectionChange: (rows: T[]) => void
}

/**
 * useTable —— 管理列表数据、分页、选择和请求状态
 *
 * 功能：
 * - 统一 tableData / pagination / loading / error / selection
 * - 搜索、重置、翻页和刷新使用同一请求入口
 * - 只允许最后一次请求更新列表，避免并发响应覆盖
 *
 * AI 规则：
 * 所有分页列表优先使用本 hook，禁止页面重复声明 tableData/loading/pagination
 * API 必须返回 { list, total }，其它响应结构在 service 层适配
 *
 * 用法示例：
 * ```ts
 * const table = useTable<User, UserQuery>(getUserList)
 * onMounted(table.fetchList)
 * ```
 */
export function useTable<T, P extends Record<string, unknown> = Record<string, unknown>>(
  apiFn: (params: P & { page: number; pageSize: number }) => Promise<TableResponse<T>>,
  options: UseTableOptions = {}
): UseTableReturn<T, P> {
  const tableData = shallowRef<T[]>([])
  const loading = ref(false)
  const error = shallowRef<unknown | null>(null)
  const selection = ref<T[]>([]) as Ref<T[]>
  const pagination = reactive<PaginationState>({
    page: options.initialPage ?? 1,
    pageSize: options.initialPageSize ?? 20,
    total: 0,
  })
  let currentParams = {} as P
  let requestId = 0

  async function fetchList(params?: P): Promise<boolean> {
    const currentRequestId = ++requestId
    if (params) currentParams = { ...params }
    loading.value = true
    error.value = null
    try {
      const result = await apiFn({ ...currentParams, page: pagination.page, pageSize: pagination.pageSize })
      if (currentRequestId !== requestId) return false
      tableData.value = result.list
      pagination.total = result.total
      selection.value = []
      return true
    } catch (caughtError) {
      if (currentRequestId !== requestId) return false
      error.value = caughtError
      options.onError?.(caughtError)
      return false
    } finally {
      if (currentRequestId === requestId) loading.value = false
    }
  }

  function refresh() {
    return fetchList()
  }

  function cancel() {
    requestId += 1
    loading.value = false
  }

  function handleSearch(params: P) {
    pagination.page = 1
    return fetchList(params)
  }

  function handleReset() {
    pagination.page = 1
    currentParams = {} as P
    return fetchList()
  }

  function handlePageChange(page: number) {
    pagination.page = page
    return fetchList()
  }

  function handleSizeChange(size: number) {
    pagination.pageSize = size
    pagination.page = 1
    return fetchList()
  }

  function handleSelectionChange(rows: T[]) {
    selection.value = rows
  }

  return {
    tableData,
    loading,
    error,
    pagination,
    selection,
    fetchList,
    refresh,
    cancel,
    handleSearch,
    handleReset,
    handlePageChange,
    handleSizeChange,
    handleSelectionChange,
  }
}
