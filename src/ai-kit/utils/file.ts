/**
 * file —— 文件处理工具集
 *
 * 功能：
 * - getFileExt：获取文件扩展名
 * - getFileName：获取文件名（不含扩展名）
 * - isImageFile：是否为图片类型
 * - isVideoFile：是否为视频类型
 * - readFileAsBase64：读取文件为 Base64
 * - readFileAsText：读取文件为文本
 * - compressImage：图片压缩（质量/尺寸）
 * - base64ToBlob：Base64 转 Blob
 * - blobToBase64：Blob 转 Base64
 *
 * AI 规则：
 * 所有文件类型判断、读取、压缩必须使用本工具
 * 上传前验证配合 validate.ts 使用
 *
 * 用法示例：
 * ```ts
 * getFileExt('photo.jpg')           // 'jpg'
 * isImageFile(file)                 // true
 * const b64 = await readFileAsBase64(file)
 * const compressed = await compressImage(file, { quality: 0.7, maxWidth: 1200 })
 * ```
 */

/** 获取文件扩展名（小写） */
export function getFileExt(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() ?? ''
}

/** 获取文件名（不含扩展名） */
export function getFileName(filename: string): string {
  const base = filename.split('/').pop() ?? filename
  const dotIdx = base.lastIndexOf('.')
  return dotIdx > -1 ? base.slice(0, dotIdx) : base
}

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'ico', 'avif']
const VIDEO_EXTS = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv', 'flv']
const AUDIO_EXTS = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a']
const DOC_EXTS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv']

/** 是否为图片文件 */
export function isImageFile(file: File | string): boolean {
  const name = typeof file === 'string' ? file : file.name
  return IMAGE_EXTS.includes(getFileExt(name))
}

/** 是否为视频文件 */
export function isVideoFile(file: File | string): boolean {
  const name = typeof file === 'string' ? file : file.name
  return VIDEO_EXTS.includes(getFileExt(name))
}

/** 是否为音频文件 */
export function isAudioFile(file: File | string): boolean {
  const name = typeof file === 'string' ? file : file.name
  return AUDIO_EXTS.includes(getFileExt(name))
}

/** 是否为文档文件 */
export function isDocFile(file: File | string): boolean {
  const name = typeof file === 'string' ? file : file.name
  return DOC_EXTS.includes(getFileExt(name))
}

/**
 * 读取文件为 Base64 字符串（含 data:... 前缀）
 */
export function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

/**
 * 读取文件为文本字符串
 * @param encoding - 编码，默认 'UTF-8'
 */
export function readFileAsText(file: File, encoding = 'UTF-8'): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsText(file, encoding)
  })
}

/**
 * Base64 转 Blob
 * @param base64    - 含 data:... 前缀或纯 base64
 * @param mimeType  - MIME 类型（不传则从 base64 前缀解析）
 */
export function base64ToBlob(base64: string, mimeType?: string): Blob {
  const [header, data] = base64.includes(',') ? base64.split(',') : ['', base64]
  const mime = mimeType ?? header.match(/:(.*?);/)?.[1] ?? 'application/octet-stream'
  const bytes = atob(data)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  return new Blob([arr], { type: mime })
}

/**
 * Blob 转 Base64
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * 图片压缩
 * @param file     - 原始图片 File
 * @param options  - 压缩选项
 *   - quality   图片质量 0-1（默认 0.8）
 *   - maxWidth  最大宽度（超出按比例缩放）
 *   - maxHeight 最大高度（超出按比例缩放）
 *   - type      输出格式（默认 'image/jpeg'）
 * @returns 压缩后的 File 对象
 */
export async function compressImage(
  file: File,
  options: {
    quality?: number
    maxWidth?: number
    maxHeight?: number
    type?: string
  } = {}
): Promise<File> {
  const { quality = 0.8, maxWidth, maxHeight, type = 'image/jpeg' } = options

  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(file)

    img.onload = () => {
      URL.revokeObjectURL(url)
      let { width, height } = img

      if (maxWidth && width > maxWidth) {
        height = Math.round((height * maxWidth) / width)
        width = maxWidth
      }
      if (maxHeight && height > maxHeight) {
        width = Math.round((width * maxHeight) / height)
        height = maxHeight
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')!
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          if (!blob) { reject(new Error('compress failed')); return }
          resolve(new File([blob], file.name, { type }))
        },
        type,
        quality
      )
    }
    img.onerror = reject
    img.src = url
  })
}

/**
 * 检查文件大小是否超限
 * @param file    - File 对象
 * @param maxMB   - 最大允许大小（MB）
 */
export function checkFileSize(file: File, maxMB: number): boolean {
  return file.size <= maxMB * 1024 * 1024
}
