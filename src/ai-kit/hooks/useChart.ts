import { onMounted, onUnmounted, shallowRef, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import type { EChartsOption } from 'echarts'
import * as echarts from 'echarts'

export type ChartTheme = 'light' | 'dark' | ''

export interface UseChartReturn {
  chart: Readonly<Ref<echarts.ECharts | null>>
  init: () => echarts.ECharts | null
  setOption: (option: EChartsOption, delayMs?: number) => void
  showLoading: () => void
  hideLoading: () => void
  resize: () => void
  dispose: () => void
}

/**
 * useChart —— 管理 ECharts 实例的初始化、更新、缩放与销毁
 *
 * 功能：
 * - 自动 init / dispose，卸载时清理实例、observer 与定时器
 * - ResizeObserver + window resize 响应容器变化
 * - 实例创建前缓存 option / loading，挂载后补应用
 * - theme 变化时安全重建并恢复最后一次 option
 *
 * AI 规则：
 * 所有 ECharts 图表优先使用本 hook，禁止在业务组件内裸调用 echarts.init
 * 简单展示场景优先使用 BaseChart，需要事件和实例控制时再直接使用 useChart
 *
 * 用法示例：
 * ```ts
 * const chartEl = ref<HTMLDivElement>()
 * const { chart, setOption } = useChart(chartEl)
 * setOption({ xAxis: {}, yAxis: {}, series: [] })
 * ```
 */
export function useChart(
  elRef: Ref<HTMLElement | undefined>,
  theme: MaybeRefOrGetter<ChartTheme> = ''
): UseChartReturn {
  const chart = shallowRef<echarts.ECharts | null>(null)
  let resizeObserver: ResizeObserver | null = null
  let optionTimer: ReturnType<typeof setTimeout> | null = null
  let lastOption: EChartsOption | null = null
  let loadingRequested = false

  function applyPendingState() {
    if (!chart.value) return
    if (lastOption) chart.value.setOption(lastOption, { notMerge: false })
    if (loadingRequested) chart.value.showLoading('default', { text: '加载中...' })
  }

  function init() {
    if (!elRef.value) return null
    if (chart.value) return chart.value
    chart.value = echarts.getInstanceByDom(elRef.value) ?? echarts.init(elRef.value, toValue(theme) || undefined)
    applyPendingState()
    return chart.value
  }

  function setOption(option: EChartsOption, delayMs = 0) {
    lastOption = option
    if (optionTimer) {
      clearTimeout(optionTimer)
      optionTimer = null
    }
    const apply = () => chart.value?.setOption(option, { notMerge: false })
    if (delayMs > 0) optionTimer = setTimeout(apply, delayMs)
    else apply()
  }

  function showLoading() {
    loadingRequested = true
    chart.value?.showLoading('default', { text: '加载中...' })
  }

  function hideLoading() {
    loadingRequested = false
    chart.value?.hideLoading()
  }

  function resize() {
    chart.value?.resize()
  }

  function dispose() {
    resizeObserver?.disconnect()
    resizeObserver = null
    if (optionTimer) clearTimeout(optionTimer)
    optionTimer = null
    chart.value?.dispose()
    chart.value = null
  }

  function observeContainer() {
    if (!elRef.value || typeof ResizeObserver === 'undefined') return
    resizeObserver?.disconnect()
    resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(elRef.value)
  }

  onMounted(() => {
    init()
    observeContainer()
    if (typeof window !== 'undefined') window.addEventListener('resize', resize)
  })

  watch(
    () => toValue(theme),
    (next, previous) => {
      if (next === previous || !chart.value) return
      dispose()
      init()
      observeContainer()
    }
  )

  onUnmounted(() => {
    if (typeof window !== 'undefined') window.removeEventListener('resize', resize)
    dispose()
  })

  return { chart, init, setOption, showLoading, hideLoading, resize, dispose }
}
