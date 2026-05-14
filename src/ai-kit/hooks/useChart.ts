import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue'
import type { EChartsOption } from 'echarts'
import * as echarts from 'echarts'

/**
 * useChart —— ECharts 图表生命周期管理
 *
 * 功能：
 * - 自动 init / dispose（防内存泄漏）
 * - 自动 resize（ResizeObserver + window resize）
 * - 节流 setOption（避免频繁重绘）
 * - dark mode 响应（传入 theme）
 * - loading 状态控制
 *
 * AI 规则：
 * 所有 ECharts 图表优先使用本 hook，禁止在组件内裸调用 echarts.init
 *
 * 用法示例：
 * ```ts
 * const chartRef = ref<HTMLDivElement>()
 * const { setOption, showLoading, hideLoading } = useChart(chartRef)
 * setOption({ ... })
 * ```
 */
export function useChart(
  elRef: Ref<HTMLElement | undefined>,
  theme: 'light' | 'dark' | '' = ''
) {
  let chart: echarts.ECharts | null = null
  let resizeObserver: ResizeObserver | null = null
  let throttleTimer: ReturnType<typeof setTimeout> | null = null

  function init() {
    if (!elRef.value || chart) return
    chart = echarts.init(elRef.value, theme || undefined)
  }

  function setOption(option: EChartsOption, throttleMs = 0) {
    if (!chart) return
    if (throttleMs > 0) {
      if (throttleTimer) clearTimeout(throttleTimer)
      throttleTimer = setTimeout(() => chart?.setOption(option, { notMerge: false }), throttleMs)
    } else {
      chart.setOption(option, { notMerge: false })
    }
  }

  function showLoading() {
    chart?.showLoading('default', { text: '加载中...' })
  }

  function hideLoading() {
    chart?.hideLoading()
  }

  function resize() {
    chart?.resize()
  }

  function dispose() {
    resizeObserver?.disconnect()
    resizeObserver = null
    if (throttleTimer) clearTimeout(throttleTimer)
    chart?.dispose()
    chart = null
  }

  onMounted(() => {
    init()
    if (elRef.value) {
      resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(elRef.value)
    }
    window.addEventListener('resize', resize)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', resize)
    dispose()
  })

  return { chart: ref(chart), setOption, showLoading, hideLoading, resize, dispose }
}
