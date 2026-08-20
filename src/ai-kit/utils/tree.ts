/**
 * tree —— 树形数据结构工具集
 *
 * 功能：
 * - listToTree：扁平列表 → 树形结构
 * - treeToList：树形结构 → 扁平列表（广度/深度优先）
 * - findTreeNode：查找第一个满足条件的节点
 * - filterTree：过滤树（保留满足条件的节点及其祖先）
 * - getTreeNodePath：获取节点到根的路径
 * - getTreeLeaves：获取所有叶子节点
 * - mapTree：对树每个节点做变换（类似 Array.map）
 * - sortTree：对树每层节点排序
 *
 * AI 规则：
 * 所有树形数据处理必须使用本工具，禁止在组件/hook 内写递归遍历
 * 配合 BaseTree / useTree 使用
 *
 * 用法示例：
 * ```ts
 * const tree = listToTree(flatList, { id: 'id', parentId: 'pid', children: 'children' })
 * const flat = treeToList(tree)
 * const node = findTreeNode(tree, n => n.id === targetId)
 * const path = getTreeNodePath(tree, n => n.id === targetId) // [root, ..., target]
 * ```
 */

export interface TreeOptions {
  id?: string        // 节点唯一标识字段名，默认 'id'
  parentId?: string  // 父节点字段名，默认 'parentId'
  children?: string  // 子节点字段名，默认 'children'
  rootId?: unknown   // 根节点的 parentId 值，默认 null / undefined / 0 / ''
}

/**
 * 扁平列表转树形结构
 * @param list    - 包含 id 和 parentId 的扁平列表
 * @param options - 字段映射配置
 */
export function listToTree<T extends Record<string, unknown>>(
  list: T[],
  options: TreeOptions = {}
): T[] {
  const { id = 'id', parentId = 'parentId', children = 'children', rootId } = options
  const ROOT_IDS = new Set([null, undefined, 0, '', rootId])

  const map = new Map<unknown, T & { [key: string]: T[] }>()
  const roots: T[] = []

  list.forEach(item => {
    map.set(item[id], { ...item, [children]: [] })
  })

  map.forEach(node => {
    const pid = node[parentId]
    if (ROOT_IDS.has(pid)) {
      roots.push(node)
    } else {
      const parent = map.get(pid)
      if (parent) {
        ;(parent[children] as T[]).push(node)
      } else {
        roots.push(node) // 孤立节点视为根
      }
    }
  })

  return roots
}

/**
 * 树形结构转扁平列表（广度优先）
 * @param tree     - 树形数据
 * @param children - 子节点字段名，默认 'children'
 */
export function treeToList<T extends Record<string, unknown>>(
  tree: T[],
  children = 'children'
): T[] {
  const result: T[] = []
  const queue = [...tree]
  while (queue.length) {
    const node = queue.shift()!
    result.push(node)
    const kids = node[children] as T[] | undefined
    if (kids?.length) queue.push(...kids)
  }
  return result
}

/**
 * 查找第一个满足条件的节点（深度优先）
 * @returns 找到的节点，未找到返回 null
 */
export function findTreeNode<T extends Record<string, unknown>>(
  tree: T[],
  predicate: (node: T) => boolean,
  children = 'children'
): T | null {
  for (const node of tree) {
    if (predicate(node)) return node
    const kids = node[children] as T[] | undefined
    if (kids?.length) {
      const found = findTreeNode(kids, predicate, children)
      if (found) return found
    }
  }
  return null
}

/**
 * 过滤树：保留满足条件的节点及其所有祖先
 * @param tree      - 原始树
 * @param predicate - 节点保留条件
 */
export function filterTree<T extends Record<string, unknown>>(
  tree: T[],
  predicate: (node: T) => boolean,
  children = 'children'
): T[] {
  function filter(nodes: T[]): T[] {
    return nodes.reduce<T[]>((acc, node) => {
      const kids = node[children] as T[] | undefined
      const filteredKids = kids?.length ? filter(kids) : []
      if (predicate(node) || filteredKids.length) {
        acc.push({ ...node, [children]: filteredKids })
      }
      return acc
    }, [])
  }
  return filter(tree)
}

/**
 * 获取节点到根节点的路径（包含目标节点）
 * @returns 路径数组（[根节点, ..., 目标节点]），未找到返回 []
 */
export function getTreeNodePath<T extends Record<string, unknown>>(
  tree: T[],
  predicate: (node: T) => boolean,
  children = 'children'
): T[] {
  function dfs(nodes: T[], path: T[]): T[] | null {
    for (const node of nodes) {
      const current = [...path, node]
      if (predicate(node)) return current
      const kids = node[children] as T[] | undefined
      if (kids?.length) {
        const result = dfs(kids, current)
        if (result) return result
      }
    }
    return null
  }
  return dfs(tree, []) ?? []
}

/**
 * 获取所有叶子节点（没有子节点的节点）
 */
export function getTreeLeaves<T extends Record<string, unknown>>(
  tree: T[],
  children = 'children'
): T[] {
  const leaves: T[] = []
  function dfs(nodes: T[]) {
    nodes.forEach(node => {
      const kids = node[children] as T[] | undefined
      if (!kids?.length) leaves.push(node)
      else dfs(kids)
    })
  }
  dfs(tree)
  return leaves
}

/**
 * 对树每个节点做变换（类似 Array.map，不改变结构）
 * @param mapper - 变换函数，返回新节点（无需处理 children，自动递归）
 */
export function mapTree<T extends Record<string, unknown>, R extends Record<string, unknown>>(
  tree: T[],
  mapper: (node: T, level: number) => R,
  children = 'children',
  level = 0
): R[] {
  return tree.map(node => {
    const mapped = mapper(node, level)
    const kids = node[children] as T[] | undefined
    return {
      ...mapped,
      [children]: kids?.length ? mapTree(kids, mapper, children, level + 1) : [],
    }
  })
}

/**
 * 对树每层节点排序
 * @param compareFn - 排序比较函数（同 Array.sort）
 */
export function sortTree<T extends Record<string, unknown>>(
  tree: T[],
  compareFn: (a: T, b: T) => number,
  children = 'children'
): T[] {
  return [...tree].sort(compareFn).map(node => {
    const kids = node[children] as T[] | undefined
    return {
      ...node,
      [children]: kids?.length ? sortTree(kids, compareFn, children) : [],
    }
  })
}
