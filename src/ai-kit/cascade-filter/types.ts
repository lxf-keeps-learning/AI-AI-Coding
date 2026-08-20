/**
 * CascadeFilter 类型定义（与 design/cascade-filter/LLD-前端-cascade-filter.md 对齐）
 */
export type CascadeLevel = 1 | 2 | 3

export interface CascadeOption {
  id: string
  name: string
  /** 是否有下级；未知时按 level < levels 视为有下级 */
  hasChildren?: boolean
  disabled?: boolean
}

/** 选中值：定长数组，undefined 表示该级"不限/未选" */
export type CascadeValue = Array<string | undefined>

export type FetchOptions = (
  level: CascadeLevel,
  parentId?: string,
) => Promise<CascadeOption[]>

export interface CascadeFilterProps {
  modelValue: CascadeValue
  /** 选项加载函数（唯一需要业务适配的入口） */
  fetchOptions: FetchOptions
  /** 级数，默认 3 */
  levels?: number
  /** 每级是否注入"不限"选项，默认 false */
  allowEmpty?: boolean
  /** "不限"文案，默认 '不限' */
  emptyLabel?: string
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
}
