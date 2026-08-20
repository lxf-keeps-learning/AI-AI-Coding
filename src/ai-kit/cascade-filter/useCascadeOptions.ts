import { ref, shallowRef, type Ref, type ShallowRef } from 'vue'
import type { CascadeLevel, CascadeOption, CascadeValue, FetchOptions } from './types'

export interface UseCascadeOptionsOptions {
  fetchOptions: FetchOptions
  levels: number
}

/**
 * useCascadeOptions —— 级联选项的加载/缓存/清空/回显/重试
 *
 * 设计要点：
 * - 每级独立 loading / error（互不打断）
 * - 本级缓存保留（同级切换不回源）；选择变更后 clearBelow 失效下级缓存
 * - in-flight 去重：同一级并发调用共享同一个 Promise（回显预热与 el-cascader
 *   lazyLoad 同时触发时不会重复请求）
 * - 失败不抛错，返回 [] 并记录 errorByLevel；重试 = force 重拉（或缓存未命中自然重拉）
 */
export function useCascadeOptions({ fetchOptions, levels }: UseCascadeOptionsOptions) {
  const optionsByLevel: ShallowRef<Map<CascadeLevel, CascadeOption[]>> = shallowRef(new Map())
  const loadingByLevel: Ref<Map<CascadeLevel, boolean>> = ref(new Map())
  const errorByLevel: Ref<Map<CascadeLevel, string>> = ref(new Map())
  const hydrating = ref(false)

  /** 同级的 in-flight 去重 */
  const pending = new Map<CascadeLevel, Promise<CascadeOption[]>>()

  function getOptions(level: CascadeLevel): CascadeOption[] {
    return optionsByLevel.value.get(level) ?? []
  }

  function setLoading(level: CascadeLevel, v: boolean): void {
    loadingByLevel.value = new Map(loadingByLevel.value).set(level, v)
  }

  function setError(level: CascadeLevel, msg: string): void {
    errorByLevel.value = new Map(errorByLevel.value).set(level, msg)
  }

  function loadLevel(level: CascadeLevel, parentId?: string, force = false): Promise<CascadeOption[]> {
    if (!force && optionsByLevel.value.has(level)) {
      return Promise.resolve(getOptions(level))
    }
    if (!force && pending.has(level)) {
      return pending.get(level) as Promise<CascadeOption[]>
    }

    const task = (async () => {
      setLoading(level, true)
      setError(level, '')
      try {
        const opts = await fetchOptions(level, parentId)
        optionsByLevel.value = new Map(optionsByLevel.value).set(level, opts)
        return opts
      } catch (err) {
        const msg = err instanceof Error ? err.message : '选项加载失败'
        setError(level, msg)
        return []
      } finally {
        setLoading(level, false)
      }
    })()

    pending.set(level, task)
    void task.finally(() => pending.delete(level))
    return task
  }

  /** 清空 level 及以下所有级的选项缓存（选择变更时必须重拉） */
  function clearBelow(level: CascadeLevel): void {
    const next = new Map(optionsByLevel.value)
    for (let l = level + 1; l <= levels; l++) {
      next.delete(l as CascadeLevel)
    }
    optionsByLevel.value = next
  }

  /**
   * 回显：按 value 路径逐级加载并校验，返回截断后的有效值。
   * 某级值失效 → 截断到上一级（调用方负责提示）。
   */
  async function hydrate(value: CascadeValue): Promise<CascadeValue> {
    hydrating.value = true
    const restored: CascadeValue = []
    try {
      let parentId: string | undefined
      const maxLevel = Math.min(levels, value.length)
      for (let l = 1; l <= maxLevel; l++) {
        const id = value[l - 1]
        if (id == null || id === '') {
          restored.push(undefined)
          continue
        }
        const opts = await loadLevel(l as CascadeLevel, parentId)
        const hit = opts.some((o) => o.id === id)
        if (!hit) break
        restored.push(id)
        parentId = id
      }
      return restored
    } finally {
      hydrating.value = false
    }
  }

  return {
    optionsByLevel,
    loadingByLevel,
    errorByLevel,
    hydrating,
    getOptions,
    loadLevel,
    clearBelow,
    hydrate,
  }
}
