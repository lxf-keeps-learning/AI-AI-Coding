<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { EChartsOption } from 'echarts'
import { useChart } from '../hooks/useChart'

/**
 * BaseChart —— 提供 loading、empty、error 和生命周期管理的 ECharts 容器
 *
 * 使用场景：折线图、柱状图、饼图和大多数配置驱动图表
 * AI 规则：简单 ECharts 图表必须使用本组件，禁止业务组件直接 echarts.init；复杂实例交互使用 useChart
 * Props：option、loading、empty、error、height、width、theme、updateDelay
 * Emits：retry
 * Slots：empty、error
 */
interface Props {
  option?: EChartsOption
  loading?: boolean
  empty?: boolean
  error?: unknown
  height?: string
  width?: string
  theme?: 'light' | 'dark' | ''
  showEmpty?: boolean
  updateDelay?: number
}

const props = withDefaults(defineProps<Props>(), {
  option: undefined,
  loading: false,
  empty: false,
  height: '300px',
  width: '100%',
  theme: '',
  showEmpty: true,
  updateDelay: 0,
})

const emit = defineEmits<{ retry: [] }>()
const chartEl = ref<HTMLDivElement>()
const themeRef = computed(() => props.theme)
const { setOption, showLoading, hideLoading } = useChart(chartEl, themeRef)
const isEmpty = computed(() => props.showEmpty && !props.loading && !props.error && (props.empty || !props.option))

watch(
  () => props.option,
  (option) => {
    if (option) setOption(option, props.updateDelay)
  },
  { immediate: true }
)

watch(
  () => props.loading,
  (loading) => (loading ? showLoading() : hideLoading()),
  { immediate: true }
)
</script>

<template>
  <div class="base-chart" :style="{ height, width }">
    <div ref="chartEl" class="base-chart__canvas" :style="{ height, width }" />

    <div v-if="error" class="base-chart__state">
      <slot name="error" :error="error" :retry="() => emit('retry')">
        <el-result icon="error" title="图表加载失败">
          <template #extra><el-button type="primary" @click="emit('retry')">重试</el-button></template>
        </el-result>
      </slot>
    </div>

    <div v-else-if="isEmpty" class="base-chart__state">
      <slot name="empty"><el-empty description="暂无数据" :image-size="60" /></slot>
    </div>
  </div>
</template>

<style scoped>
.base-chart {
  position: relative;
  min-height: 120px;
}
.base-chart__canvas {
  display: block;
}
.base-chart__state {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-bg-color, #fff);
}
</style>
