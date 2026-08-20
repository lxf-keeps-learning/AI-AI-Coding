/**
 * utils —— 公共工具函数统一导出入口
 *
 * 使用方式：
 * ```ts
 * import { formatDate, isPhone, deepClone } from '@/ai-kit/utils'
 * ```
 *
 * 或按需导入具体模块：
 * ```ts
 * import { formatDate } from '@/ai-kit/utils/date'
 * import { isPhone } from '@/ai-kit/utils/validate'
 * ```
 *
 * 工具模块清单：
 * | 模块        | 文件              | 主要功能                            |
 * |------------|-------------------|-------------------------------------|
 * | debounce   | debounce.ts       | 防抖                                |
 * | throttle   | throttle.ts       | 节流                                |
 * | date       | date.ts           | 日期格式化 / 相对时间 / 范围计算     |
 * | format     | format.ts         | 数字 / 货币 / 文件大小 / 脱敏格式化  |
 * | validate   | validate.ts       | 手机号 / 邮箱 / 身份证 / El校验函数 |
 * | storage    | storage.ts        | localStorage / sessionStorage 封装  |
 * | dom        | dom.ts            | 剪贴板 / 下载 / 全屏 / 滚动         |
 * | file       | file.ts           | 文件类型 / 读取 / 压缩 / base64      |
 * | tree       | tree.ts           | 树形数据扁平化 / 查找 / 过滤         |
 * | array      | array.ts          | 去重 / 分组 / 排序 / 统计            |
 * | object     | object.ts         | 深克隆 / pick / omit / 空值清理      |
 * | string     | string.ts         | 截断 / 高亮 / 驼峰转换 / 转义        |
 */

export * from './debounce'
export * from './throttle'
export * from './date'
export * from './format'
export * from './validate'
export * from './storage'
export * from './dom'
export * from './file'
export * from './tree'
export * from './array'
export * from './object'
export * from './string'
