/**
 * date —— 日期处理工具集
 *
 * 功能：
 * - formatDate：日期格式化（无需引入 dayjs/moment）
 * - formatRelative：相对时间（刚刚/N分钟前/N天前）
 * - dateDiff：两日期差值（天/小时/分钟）
 * - getDateRange：快捷日期范围（今天/本周/本月/近N天）
 * - isToday / isYesterday：日期判断
 * - startOfDay / endOfDay：当天起止时间戳
 *
 * AI 规则：
 * 项目内所有日期格式化和计算必须使用本工具，禁止引入 dayjs/moment 等外部库
 * 禁止在组件/页面内写内联日期处理逻辑
 *
 * 用法示例：
 * ```ts
 * formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss') // '2024-03-15 09:30:00'
 * formatRelative(Date.now() - 3 * 60 * 1000)    // '3分钟前'
 * getDateRange('last7')                           // [startTs, endTs]
 * ```
 */

type DateInput = Date | number | string

function toDate(val: DateInput): Date {
  if (val instanceof Date) return val
  const d = new Date(val)
  return isNaN(d.getTime()) ? new Date() : d
}

/**
 * 日期格式化
 * @param date - 日期值（Date / 时间戳 / 字符串）
 * @param fmt  - 格式模板，支持：YYYY MM DD HH mm ss SSS
 * @example formatDate(new Date(), 'YYYY-MM-DD') → '2024-03-15'
 * @example formatDate(new Date(), 'YYYY/MM/DD HH:mm') → '2024/03/15 09:30'
 */
export function formatDate(date: DateInput, fmt = 'YYYY-MM-DD HH:mm:ss'): string {
  const d = toDate(date)
  const pad = (n: number, len = 2) => String(n).padStart(len, '0')
  return fmt
    .replace('YYYY', String(d.getFullYear()))
    .replace('MM', pad(d.getMonth() + 1))
    .replace('DD', pad(d.getDate()))
    .replace('HH', pad(d.getHours()))
    .replace('mm', pad(d.getMinutes()))
    .replace('ss', pad(d.getSeconds()))
    .replace('SSS', pad(d.getMilliseconds(), 3))
}

/**
 * 相对时间（刚刚 / N分钟前 / N小时前 / N天前）
 * @param date - 过去的时间点
 * @example formatRelative(Date.now() - 30000) → '30秒前'
 * @example formatRelative('2024-01-01') → '2024-01-01'（超过30天显示日期）
 */
export function formatRelative(date: DateInput): string {
  const now = Date.now()
  const then = toDate(date).getTime()
  const diff = now - then

  if (diff < 0) return formatDate(date, 'YYYY-MM-DD HH:mm')
  if (diff < 60_000) return '刚刚'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}分钟前`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}小时前`
  if (diff < 2_592_000_000) return `${Math.floor(diff / 86_400_000)}天前`
  return formatDate(date, 'YYYY-MM-DD')
}

/**
 * 计算两个日期之间的差值
 * @param start - 开始日期
 * @param end   - 结束日期（默认 now）
 * @param unit  - 返回单位：'day' | 'hour' | 'minute' | 'second' | 'ms'
 * @example dateDiff('2024-01-01', '2024-01-10', 'day') → 9
 */
export function dateDiff(
  start: DateInput,
  end: DateInput = Date.now(),
  unit: 'day' | 'hour' | 'minute' | 'second' | 'ms' = 'day'
): number {
  const diff = toDate(end).getTime() - toDate(start).getTime()
  const map = { ms: 1, second: 1000, minute: 60_000, hour: 3_600_000, day: 86_400_000 }
  return Math.floor(diff / map[unit])
}

/**
 * 快捷日期范围，返回 [开始时间戳, 结束时间戳]
 * @param preset - 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'last7' | 'last30' | 'last90'
 * @example getDateRange('last7') → [1709654400000, 1710259199999]
 */
export function getDateRange(
  preset: 'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'last7' | 'last30' | 'last90'
): [number, number] {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const todayEnd = new Date(today.getTime() + 86_400_000 - 1)

  switch (preset) {
    case 'today':
      return [today.getTime(), todayEnd.getTime()]
    case 'yesterday': {
      const start = new Date(today.getTime() - 86_400_000)
      return [start.getTime(), today.getTime() - 1]
    }
    case 'thisWeek': {
      const day = now.getDay() || 7
      const start = new Date(today.getTime() - (day - 1) * 86_400_000)
      return [start.getTime(), todayEnd.getTime()]
    }
    case 'lastWeek': {
      const day = now.getDay() || 7
      const thisMonday = new Date(today.getTime() - (day - 1) * 86_400_000)
      const lastMonday = new Date(thisMonday.getTime() - 7 * 86_400_000)
      return [lastMonday.getTime(), thisMonday.getTime() - 1]
    }
    case 'thisMonth': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1)
      return [start.getTime(), todayEnd.getTime()]
    }
    case 'lastMonth': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const end = new Date(now.getFullYear(), now.getMonth(), 1)
      return [start.getTime(), end.getTime() - 1]
    }
    case 'last7':
      return [today.getTime() - 6 * 86_400_000, todayEnd.getTime()]
    case 'last30':
      return [today.getTime() - 29 * 86_400_000, todayEnd.getTime()]
    case 'last90':
      return [today.getTime() - 89 * 86_400_000, todayEnd.getTime()]
  }
}

/** 是否为今天 */
export function isToday(date: DateInput): boolean {
  const d = toDate(date)
  const now = new Date()
  return d.getFullYear() === now.getFullYear()
    && d.getMonth() === now.getMonth()
    && d.getDate() === now.getDate()
}

/** 是否为昨天 */
export function isYesterday(date: DateInput): boolean {
  const yesterday = new Date(Date.now() - 86_400_000)
  const d = toDate(date)
  return d.getFullYear() === yesterday.getFullYear()
    && d.getMonth() === yesterday.getMonth()
    && d.getDate() === yesterday.getDate()
}

/** 当天开始时间戳（00:00:00.000） */
export function startOfDay(date: DateInput = Date.now()): number {
  const d = toDate(date)
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
}

/** 当天结束时间戳（23:59:59.999） */
export function endOfDay(date: DateInput = Date.now()): number {
  return startOfDay(date) + 86_400_000 - 1
}
