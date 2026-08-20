/**
 * dom —— DOM 操作工具集
 *
 * 功能：
 * - copyText：复制文本到剪贴板
 * - downloadFile：触发文件下载（Blob / URL）
 * - downloadByUrl：通过 URL 下载文件（跨域需后端配合）
 * - toggleFullscreen：切换元素全屏
 * - isFullscreen：是否处于全屏状态
 * - scrollToTop：平滑滚动到顶部
 * - scrollToEl：滚动到指定元素
 * - getScrollTop：获取页面滚动距离
 * - setDocTitle：设置页面标题
 * - addClass / removeClass / hasClass：class 操作
 *
 * AI 规则：
 * 所有剪贴板、下载、全屏、滚动操作必须使用本工具
 * 禁止在组件内直接操作 document.execCommand / window.open 下载
 *
 * 用法示例：
 * ```ts
 * await copyText('hello world')
 * downloadFile(blob, 'report.xlsx')
 * toggleFullscreen(chartEl.value)
 * scrollToTop()
 * ```
 */

/**
 * 复制文本到剪贴板
 * @returns Promise<boolean> 是否成功
 */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text)
      return true
    }
    // 降级方案
    const el = document.createElement('textarea')
    el.value = text
    el.style.cssText = 'position:fixed;opacity:0;pointer-events:none'
    document.body.appendChild(el)
    el.select()
    const success = document.execCommand('copy')
    document.body.removeChild(el)
    return success
  } catch {
    return false
  }
}

/**
 * 通过 Blob 下载文件
 * @param blob     - Blob 对象（如接口返回的二进制数据）
 * @param filename - 下载文件名（含扩展名）
 */
export function downloadFile(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 300)
}

/**
 * 通过 URL 下载文件（适合同域资源；跨域需后端设置 Content-Disposition）
 * @param url      - 文件地址
 * @param filename - 下载文件名
 */
export function downloadByUrl(url: string, filename?: string): void {
  const a = document.createElement('a')
  a.href = url
  a.download = filename ?? url.split('/').pop() ?? 'download'
  a.target = '_blank'
  a.rel = 'noopener noreferrer'
  a.style.display = 'none'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

/**
 * 切换全屏（传入元素进入全屏，不传则退出全屏）
 * @param el - 目标元素，默认 document.documentElement
 */
export async function toggleFullscreen(el?: HTMLElement): Promise<void> {
  const target = el ?? document.documentElement
  if (!document.fullscreenElement) {
    await target.requestFullscreen?.()
  } else {
    await document.exitFullscreen?.()
  }
}

/** 当前是否处于全屏状态 */
export function isFullscreen(): boolean {
  return Boolean(document.fullscreenElement)
}

/**
 * 平滑滚动到顶部
 * @param el - 滚动容器，默认 window
 */
export function scrollToTop(el?: HTMLElement): void {
  if (el) {
    el.scrollTo({ top: 0, behavior: 'smooth' })
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

/**
 * 滚动到指定元素（使元素出现在视口内）
 * @param el      - 目标元素
 * @param options - scrollIntoView 配置
 */
export function scrollToEl(
  el: HTMLElement,
  options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'start' }
): void {
  el.scrollIntoView(options)
}

/** 获取页面当前滚动距离 */
export function getScrollTop(el?: HTMLElement): number {
  return el ? el.scrollTop : document.documentElement.scrollTop || document.body.scrollTop
}

/** 设置页面标题 */
export function setDocTitle(title: string, suffix = ''): void {
  document.title = suffix ? `${title} - ${suffix}` : title
}

/** 添加 class */
export function addClass(el: HTMLElement, className: string): void {
  el.classList.add(...className.split(' ').filter(Boolean))
}

/** 移除 class */
export function removeClass(el: HTMLElement, className: string): void {
  el.classList.remove(...className.split(' ').filter(Boolean))
}

/** 是否包含 class */
export function hasClass(el: HTMLElement, className: string): boolean {
  return el.classList.contains(className)
}

/**
 * 获取元素相对于视口的位置
 */
export function getElRect(el: HTMLElement): DOMRect {
  return el.getBoundingClientRect()
}

/**
 * 防止页面滚动（弹窗打开时锁定 body）
 */
export function lockBodyScroll(): void {
  document.body.style.overflow = 'hidden'
  document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`
}

/** 恢复页面滚动 */
export function unlockBodyScroll(): void {
  document.body.style.overflow = ''
  document.body.style.paddingRight = ''
}
