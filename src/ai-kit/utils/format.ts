/**
 * format —— 数据格式化工具集
 *
 * 功能：
 * - formatNumber：数字千分位 / 小数位控制
 * - formatCurrency：货币格式（万/亿自动换算）
 * - formatFileSize：文件大小（B/KB/MB/GB）
 * - formatPercent：百分比
 * - formatPhone：手机号脱敏（138****8888）
 * - formatIdCard：身份证脱敏（110***********1234）
 * - formatBankCard：银行卡格式（**** **** **** 1234）
 * - formatDuration：秒数转时长（01:30:05）
 * - formatCount：大数量简写（1.2万/3.5亿）
 *
 * AI 规则：
 * 所有数字、货币、文件大小、敏感信息展示必须使用本工具
 * 禁止在模板/组件内写内联格式化逻辑
 *
 * 用法示例：
 * ```ts
 * formatCurrency(123456789)   // '1.23亿'
 * formatFileSize(1536000)     // '1.46 MB'
 * formatPhone('13812345678')  // '138****5678'
 * formatDuration(3665)        // '01:01:05'
 * ```
 */

/**
 * 数字千分位格式化
 * @param value   - 数字或数字字符串
 * @param decimal - 小数位数（默认不限制）
 * @example formatNumber(1234567.89, 2) → '1,234,567.89'
 */
export function formatNumber(value: number | string, decimal?: number): string {
  const num = Number(value)
  if (isNaN(num)) return String(value)
  const fixed = decimal !== undefined ? num.toFixed(decimal) : String(num)
  const [int, dec] = fixed.split('.')
  const formatted = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return dec !== undefined ? `${formatted}.${dec}` : formatted
}

/**
 * 货币格式（自动换算万/亿，保留两位小数）
 * @param value  - 原始数值（元）
 * @param unit   - 强制单位 'yuan'|'wan'|'yi'，默认自动判断
 * @example formatCurrency(12345678) → '1234.57万'
 * @example formatCurrency(1234567890) → '12.35亿'
 */
export function formatCurrency(
  value: number,
  unit?: 'yuan' | 'wan' | 'yi'
): string {
  if (isNaN(value)) return '--'
  const absVal = Math.abs(value)
  const sign = value < 0 ? '-' : ''

  if (unit === 'yi' || (!unit && absVal >= 1e8)) {
    return `${sign}${(absVal / 1e8).toFixed(2)}亿`
  }
  if (unit === 'wan' || (!unit && absVal >= 1e4)) {
    return `${sign}${(absVal / 1e4).toFixed(2)}万`
  }
  return `${sign}${formatNumber(absVal, 2)}`
}

/**
 * 文件大小格式化
 * @param bytes - 字节数
 * @param decimal - 小数位（默认 2）
 * @example formatFileSize(1536) → '1.50 KB'
 * @example formatFileSize(1073741824) → '1.00 GB'
 */
export function formatFileSize(bytes: number, decimal = 2): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const units = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / Math.pow(k, i)).toFixed(decimal)} ${units[i]}`
}

/**
 * 百分比格式化
 * @param value   - 0~1 的小数（如 0.1234）或 0~100 的整数
 * @param decimal - 小数位数（默认 1）
 * @param isRatio - true 表示传入值是 0~1 的比例（默认 true）
 * @example formatPercent(0.1234) → '12.3%'
 * @example formatPercent(56.789, 2, false) → '56.79%'
 */
export function formatPercent(value: number, decimal = 1, isRatio = true): string {
  if (isNaN(value)) return '--'
  const pct = isRatio ? value * 100 : value
  return `${pct.toFixed(decimal)}%`
}

/**
 * 手机号脱敏（保留前3后4位）
 * @example formatPhone('13812345678') → '138****5678'
 */
export function formatPhone(phone: string): string {
  if (!phone) return ''
  return phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
}

/**
 * 身份证脱敏（保留前3后4位）
 * @example formatIdCard('110101199001011234') → '110***********1234'
 */
export function formatIdCard(idCard: string): string {
  if (!idCard) return ''
  if (idCard.length <= 7) return idCard
  return idCard.replace(/^(.{3})(.+)(.{4})$/, (_, a, b, c) => `${a}${'*'.repeat(b.length)}${c}`)
}

/**
 * 银行卡格式化（每4位加空格，前几组脱敏）
 * @param cardNo  - 银行卡号
 * @param visible - 末尾可见位数（默认 4）
 * @example formatBankCard('6222021234567890') → '**** **** **** 7890'
 */
export function formatBankCard(cardNo: string, visible = 4): string {
  if (!cardNo) return ''
  const clean = cardNo.replace(/\s/g, '')
  const last = clean.slice(-visible)
  const masked = '*'.repeat(clean.length - visible)
  const full = masked + last
  return full.replace(/(.{4})/g, '$1 ').trim()
}

/**
 * 秒数转时长字符串
 * @param seconds - 总秒数
 * @param showHour - 是否显示小时（默认 true）
 * @example formatDuration(3665) → '01:01:05'
 * @example formatDuration(90, false) → '01:30'
 */
export function formatDuration(seconds: number, showHour = true): string {
  if (isNaN(seconds) || seconds < 0) return showHour ? '00:00:00' : '00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  const pad = (n: number) => String(n).padStart(2, '0')
  return showHour ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

/**
 * 大数量简写（1.2万 / 3.5亿）
 * @param count - 原始数量
 * @example formatCount(12345) → '1.2万'
 * @example formatCount(356000000) → '3.6亿'
 */
export function formatCount(count: number): string {
  if (isNaN(count)) return '--'
  if (count >= 1e8) return `${(count / 1e8).toFixed(1)}亿`
  if (count >= 1e4) return `${(count / 1e4).toFixed(1)}万`
  return String(count)
}
