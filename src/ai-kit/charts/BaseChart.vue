<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { EChartsOption } from 'echarts'
import { useChart } from '../hooks/useChart'

/**
 * BaseChart —— 通用 ECharts 图表组件
 *
 * 功能：
 * - 自动 init / dispose / resize（ResizeObserver）
 * - loading 占位
 * - 空数据状态
 * - 通过 :option 传入配置，组件内节流 setOption
 * - 支持 dark mode（theme prop）
 *
 * AI 规则：
 * 所有 ECharts 图表封装必须基于本组件，通过 :option 传入配置
 * 禁止在业务组件内直接 echarts.init
 *
 * 用法示例：
 * ```vue
 * <BaseChart :option="chartOption" :loading="loading" height="300px" />
 * ```
 */
interface Props {
  option?: EChartsOption
  loading?: boolean
  height?: string
  width?: string
  theme?: 'light' | 'dark' | ''
  /** option 为空时是否显示空状态 */
  showEmpty?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  option: undefined,
  loading: false,
  height: '300px',
  width: '100%',
  theme: '',
  showEmpty: true,
})

const chartEl = ref<HTMLDivElement>()
const { setOption, showLoading, hideLoading } = useChart(chartEl, props.theme as 'light' | 'dark' | '')

// 监听 option 变化，节流 200ms 避免重绘
watch(
  () => props.option,
  (val) => {
    if (val) setOption(val, 200)
  },
  { deep: true }
)

// 监听 loading
watch(
  () => props.loading,
  (val) => (val ? showLoading() : hideLoading()),
  { immediate: true }
)

onMounted(() => {
  if (props.option) setOption(props.option)
})
</script>

<template>
  <div class="base-chart" :style="{ height, width }">
    <div ref="chartEl" class="base-chart__canvas" :style="{ height, width }" />
    <el-empty
      v-if="showEmpty && !loading && !option"
      class="base-chart__empty"
      description="暂无数据"
      :image-size="60"
    />
  </div>
</template>

<style scoped>
.base-chart {
  position: relative;
}
.base-chart__canvas {
  display: block;
}
.base-chart__empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
