/**
 * validate —— 常用校验工具集
 *
 * 功能：
 * - isPhone：手机号（中国大陆）
 * - isEmail：电子邮箱
 * - isIdCard：居民身份证（18位，含校验位）
 * - isUrl：URL 地址
 * - isIP：IPv4 地址
 * - isChinese：纯中文
 * - isNumber：纯数字字符串
 * - passwordStrength：密码强度评分（0-4）
 * - createElValidator：生成 Element Plus FormRule 校验函数
 *
 * AI 规则：
 * 所有表单字段校验必须使用本工具生成 validator，禁止在 rules 中写内联正则
 *
 * 用法示例：
 * ```ts
 * // 直接校验
 * isPhone('13812345678') // true
 *
 * // 生成 Element Plus rules
 * const rules = {
 *   phone: [{ validator: createElValidator(isPhone, '手机号格式不正确'), trigger: 'blur' }]
 * }
 * ```
 */
import type { FormItemRule } from 'element-plus'

/** 手机号（中国大陆，1[3-9]xxxxxxxxx） */
export function isPhone(val: string): boolean {
  return /^1[3-9]\d{9}$/.test(val)
}

/** 电子邮箱 */
export function isEmail(val: string): boolean {
  return /^[\w.+-]+@[\w-]+\.[a-zA-Z]{2,}$/.test(val)
}

/**
 * 居民身份证（18位，含最后一位校验位验证）
 */
export function isIdCard(val: string): boolean {
  if (!/^\d{17}[\dXx]$/.test(val)) return false
  const weights = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']
  const sum = weights.reduce((acc, w, i) => acc + w * Number(val[i]), 0)
  return checkCodes[sum % 11] === val[17].toUpperCase()
}

/** URL 地址（支持 http/https/ftp） */
export function isUrl(val: string): boolean {
  try {
    const url = new URL(val)
    return ['http:', 'https:', 'ftp:'].includes(url.protocol)
  } catch {
    return false
  }
}

/** IPv4 地址 */
export function isIP(val: string): boolean {
  return /^((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/.test(val)
}

/** 纯中文（全部为中文字符） */
export function isChinese(val: string): boolean {
  return /^[一-龥]+$/.test(val)
}

/** 纯数字字符串（整数） */
export function isInteger(val: string): boolean {
  return /^\d+$/.test(val)
}

/** 正浮点数（可含小数） */
export function isPositiveNumber(val: string): boolean {
  return /^(0|[1-9]\d*)(\.\d+)?$/.test(val) && Number(val) > 0
}

/** 车牌号（含新能源） */
export function isPlateNumber(val: string): boolean {
  return /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤川青藏琼宁夏宁][A-HJ-NP-Z][A-HJ-NP-Z0-9]{4,5}[A-HJ-NP-Z0-9挂学警港澳]$/.test(val)
}

/** 统一社会信用代码（18位） */
export function isCreditCode(val: string): boolean {
  return /^[0-9A-HJ-NP-RT-UW-Y]{18}$/.test(val)
}

/**
 * 密码强度评估（0-4 分）
 * 0=极弱 1=弱 2=中 3=强 4=极强
 * 规则：长度8+ / 含数字 / 含小写 / 含大写 / 含特殊字符，各加1分
 */
export function passwordStrength(pwd: string): number {
  if (!pwd || pwd.length < 6) return 0
  let score = 0
  if (pwd.length >= 8) score++
  if (/\d/.test(pwd)) score++
  if (/[a-z]/.test(pwd)) score++
  if (/[A-Z]/.test(pwd)) score++
  if (/[^a-zA-Z0-9]/.test(pwd)) score++
  return Math.min(score, 4)
}

/** 密码强度文字标签 */
export const PASSWORD_STRENGTH_LABEL: Record<number, string> = {
  0: '极弱',
  1: '弱',
  2: '中',
  3: '强',
  4: '极强',
}

/**
 * 生成 Element Plus FormItemRule validator 函数
 * @param checkFn  - 校验函数，返回 boolean
 * @param message  - 校验失败提示
 * @param required - 是否必填（空值时也报错，默认 false，空值跳过校验）
 *
 * @example
 * ```ts
 * const rules: FormRules = {
 *   phone: [
 *     { required: true, message: '请输入手机号', trigger: 'blur' },
 *     { validator: createElValidator(isPhone, '手机号格式不正确'), trigger: 'blur' }
 *   ],
 *   idCard: [
 *     { validator: createElValidator(isIdCard, '身份证号格式不正确'), trigger: 'blur' }
 *   ]
 * }
 * ```
 */
export function createElValidator(
  checkFn: (val: string) => boolean,
  message: string,
  required = false
): FormItemRule['validator'] {
  return (_rule, value: string, callback) => {
    if (!value || value.trim() === '') {
      if (required) callback(new Error(message))
      else callback()
      return
    }
    if (!checkFn(value.trim())) {
      callback(new Error(message))
    } else {
      callback()
    }
  }
}

/** 预设校验规则，直接用于 el-form :rules */
export const validators = {
  phone: createElValidator(isPhone, '请输入正确的手机号'),
  email: createElValidator(isEmail, '请输入正确的邮箱地址'),
  idCard: createElValidator(isIdCard, '请输入正确的身份证号'),
  url: createElValidator(isUrl, '请输入正确的URL地址'),
  ip: createElValidator(isIP, '请输入正确的IP地址'),
  integer: createElValidator(isInteger, '请输入整数'),
  positiveNumber: createElValidator(isPositiveNumber, '请输入正数'),
  plateNumber: createElValidator(isPlateNumber, '请输入正确的车牌号'),
  creditCode: createElValidator(isCreditCode, '请输入正确的统一社会信用代码'),
}
