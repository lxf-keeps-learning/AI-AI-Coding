/**
 * storage —— 类型安全的本地存储封装
 *
 * 功能：
 * - 统一 JSON 序列化/反序列化，避免手动 JSON.parse
 * - 支持 TTL 过期时间（毫秒）
 * - 泛型支持，读取时类型安全
 * - 同时提供 localStorage 和 sessionStorage 实例
 * - 支持批量清除（前缀匹配）
 *
 * AI 规则：
 * 所有本地存储读写必须通过本工具，禁止裸调 localStorage.setItem/getItem
 *
 * 用法示例：
 * ```ts
 * // 永久存储
 * storage.set('token', 'abc123')
 * storage.get<string>('token') // 'abc123'
 *
 * // 带 TTL（5分钟）
 * storage.set('captcha', '1234', 5 * 60 * 1000)
 * storage.get<string>('captcha') // 5分钟内有效，过期自动返回 null
 *
 * // sessionStorage
 * session.set('tab', 'profile')
 * session.get<string>('tab') // 'profile'
 * ```
 */

interface StorageItem<T> {
  value: T
  expire?: number // 过期时间戳
}

function createStorage(store: Storage) {
  /**
   * 写入存储
   * @param key   - 键名
   * @param value - 任意可序列化值
   * @param ttl   - 有效期（毫秒），不传表示永久
   */
  function set<T>(key: string, value: T, ttl?: number): void {
    const item: StorageItem<T> = { value }
    if (ttl != null && ttl > 0) item.expire = Date.now() + ttl
    try {
      store.setItem(key, JSON.stringify(item))
    } catch (e) {
      console.warn('[storage] set error:', e)
    }
  }

  /**
   * 读取存储
   * @returns 值，不存在或已过期返回 null
   */
  function get<T>(key: string): T | null {
    try {
      const raw = store.getItem(key)
      if (!raw) return null
      const item = JSON.parse(raw) as StorageItem<T>
      if (item.expire != null && Date.now() > item.expire) {
        store.removeItem(key)
        return null
      }
      return item.value
    } catch {
      return null
    }
  }

  /** 删除指定 key */
  function remove(key: string): void {
    store.removeItem(key)
  }

  /** 清空所有存储 */
  function clear(): void {
    store.clear()
  }

  /**
   * 清除指定前缀的所有 key
   * @example storage.clearPrefix('cache_')
   */
  function clearPrefix(prefix: string): void {
    const keys = Object.keys(store).filter(k => k.startsWith(prefix))
    keys.forEach(k => store.removeItem(k))
  }

  /** 判断 key 是否存在且未过期 */
  function has(key: string): boolean {
    return get(key) !== null
  }

  /** 获取所有 key */
  function keys(): string[] {
    return Object.keys(store)
  }

  return { set, get, remove, clear, clearPrefix, has, keys }
}

/** localStorage 封装（持久化） */
export const storage = createStorage(localStorage)

/** sessionStorage 封装（会话级，关闭标签页清除） */
export const session = createStorage(sessionStorage)
