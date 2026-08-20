/**
 * string —— 字符串处理工具集
 *
 * 功能：
 * - truncate：文本截断（超出显示省略号）
 * - highlight：关键词高亮（返回含 <em> 标签的 HTML）
 * - toCamelCase：下划线/中划线 → 驼峰
 * - toKebabCase：驼峰 → 中划线
 * - toSnakeCase：驼峰 → 下划线
 * - capitalize：首字母大写
 * - padStart / padEnd：字符串填充（同原生，提供语义封装）
 * - escapeHtml：转义 HTML 特殊字符（防 XSS）
 * - stripHtml：去除 HTML 标签
 * - generateId：生成随机 ID（无依赖）
 * - template：简单模板字符串替换
 * - byteLength：计算字符串字节长度（中文2字节）
 *
 * AI 规则：
 * 所有字符串转换、截断、关键词高亮必须使用本工具
 *
 * 用法示例：
 * ```ts
 * truncate('这是一段很长的文字', 6)           // '这是一段很...'
 * highlight('用户管理', '管理')              // '用户<em class="highlight">管理</em>'
 * toCamelCase('user_name')                  // 'userName'
 * escapeHtml('<script>alert(1)</script>')   // '&lt;script&gt;...'
 * generateId()                              // 'k7x2p9q1'
 * ```
 */

/**
 * 文本截断（超出 maxLen 个字符显示省略号）
 * @param str    - 原始字符串
 * @param maxLen - 最大字符数
 * @param suffix - 省略号，默认 '...'
 */
export function truncate(str: string, maxLen: number, suffix = '...'): string {
  if (!str) return ''
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen) + suffix
}

/**
 * 关键词高亮（返回 HTML 字符串，已对原文转义防 XSS）
 * @param text    - 原始文本
 * @param keyword - 关键词（大小写不敏感）
 * @param cls     - 高亮 class，默认 'highlight'
 */
export function highlight(text: string, keyword: string, cls = 'highlight'): string {
  if (!keyword || !text) return escapeHtml(text)
  const escaped = escapeHtml(text)
  const escapedKw = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return escaped.replace(
    new RegExp(escapedKw, 'gi'),
    match => `<em class="${cls}">${match}</em>`
  )
}

/**
 * 下划线/中划线 → 小驼峰
 * @example toCamelCase('user_name') → 'userName'
 * @example toCamelCase('get-user-info') → 'getUserInfo'
 */
export function toCamelCase(str: string): string {
  return str.replace(/[-_]([a-zA-Z])/g, (_, c) => c.toUpperCase())
}

/**
 * 小驼峰 → 中划线（kebab-case）
 * @example toKebabCase('getUserInfo') → 'get-user-info'
 */
export function toKebabCase(str: string): string {
  return str.replace(/([A-Z])/g, (_, c) => `-${c.toLowerCase()}`).replace(/^-/, '')
}

/**
 * 小驼峰 → 下划线（snake_case）
 * @example toSnakeCase('getUserInfo') → 'get_user_info'
 */
export function toSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, (_, c) => `_${c.toLowerCase()}`).replace(/^_/, '')
}

/** 首字母大写 */
export function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

/**
 * 转义 HTML 特殊字符（防 XSS）
 * @example escapeHtml('<script>') → '&lt;script&gt;'
 */
export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * 去除 HTML 标签，返回纯文本
 * @example stripHtml('<p>hello <b>world</b></p>') → 'hello world'
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '')
}

/**
 * 生成随机 ID（不依赖外部库）
 * @param len - 长度，默认 8
 */
export function generateId(len = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  const arr = new Uint8Array(len)
  crypto.getRandomValues(arr)
  arr.forEach(v => (result += chars[v % chars.length]))
  return result
}

/**
 * 简单模板字符串替换（{{ key }} 语法）
 * @param tpl  - 模板字符串，如 '你好，{{ name }}！'
 * @param data - 数据对象
 * @example template('Hi {{ name }}, age {{ age }}', { name: 'Tom', age: 18 }) → 'Hi Tom, age 18'
 */
export function template(tpl: string, data: Record<string, unknown>): string {
  return tpl.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => String(data[key] ?? ''))
}

/**
 * 计算字符串字节长度（中文/日文等占 2 字节，英文占 1 字节）
 * 用于短信/评论字数限制
 */
export function byteLength(str: string): number {
  let len = 0
  for (const ch of str) {
    len += ch.charCodeAt(0) > 127 ? 2 : 1
  }
  return len
}

/**
 * 去除字符串首尾空白（同 trim，提供语义封装，避免与 String.prototype 混淆）
 * 同时将多个连续空格合并为一个
 */
export function normalizeSpace(str: string): string {
  return str.trim().replace(/\s+/g, ' ')
}
