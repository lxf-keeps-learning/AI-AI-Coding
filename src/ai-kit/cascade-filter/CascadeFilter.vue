<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useCascadeOptions } from './useCascadeOptions'
import type { CascadeFilterProps, CascadeLevel, CascadeOption, CascadeValue } from './types'

const props = withDefaults(defineProps<CascadeFilterProps>(), {
  levels: 3,
  allowEmpty: false,
  emptyLabel: '不限',
  placeholder: '请选择',
  disabled: false,
  clearable: true,
})

const emit = defineEmits<{
  'update:modelValue': [value: CascadeValue]
  change: [value: CascadeValue]
}>()

/** el-cascader 内部用于标记"不限"的特殊 value */
const EMPTY_FLAG = '__CASCADE_EMPTY__'

const { getOptions, loadLevel, hydrate, hydrating, errorByLevel } = useCascadeOptions({
  fetchOptions: props.fetchOptions,
  levels: props.levels,
})

/** 外部定长数组（undefined=不限）↔ el-cascader 路径数组（EMPTY_FLAG=不限） */
const innerValue = computed<Array<string | undefined>>({
  get: () => props.modelValue.map((v) => (v == null || v === '' ? EMPTY_FLAG : v)),
  set: (val) => emit('update:modelValue', normalize(val)),
})

function normalize(val: Array<string | undefined> | null): CascadeValue {
  if (!val) return []
  return val.map((v) => (v === EMPTY_FLAG ? undefined : v))
}

interface CascaderNodeOption {
  value: string
  label: string
  isLeaf: boolean
  disabled?: boolean
}

/** 业务选项 → el-cascader 节点；allowEmpty 时每级头部注入"不限" */
function toCascaderNodes(level: CascadeLevel, opts: CascadeOption[]): CascaderNodeOption[] {
  const nodes: CascaderNodeOption[] = opts.map((o) => ({
    value: o.id,
    label: o.name,
    isLeaf: level >= props.levels || o.hasChildren === false,
    disabled: o.disabled,
  }))
  if (props.allowEmpty) {
    nodes.unshift({ value: EMPTY_FLAG, label: props.emptyLabel, isLeaf: true })
  }
  return nodes
}

interface LazyLoadNode {
  level: number
  value?: unknown
}

const cascaderProps = computed(() => ({
  lazy: true,
  checkStrictly: true,
  emitPath: true,
  lazyLoad: async (node: LazyLoadNode, resolve: (opts: CascaderNodeOption[]) => void) => {
    const level = (node.level + 1) as CascadeLevel
    if (level > props.levels) {
      resolve([])
      return
    }
    const parentId = node.level === 0 ? undefined : String(node.value)
    const opts = await loadLevel(level, parentId)

    if (opts.length === 0 && errorByLevel.value.get(level)) {
      // 加载失败：提示 + resolve 空（无缓存 → 重新展开该级即自动重试）
      ElMessage.error(errorByLevel.value.get(level) ?? '选项加载失败，请重试')
    }
    resolve(toCascaderNodes(level, opts))
  },
}))

onMounted(async () => {
  const hasValue = props.modelValue.some((v) => v != null && v !== '')
  if (hasValue) {
    // 回显：先预热各级选项缓存 → el-cascader 展开路径时 lazyLoad 全部缓存命中，label 正常显示
    const restored = await hydrate(props.modelValue)
    if (JSON.stringify(restored) !== JSON.stringify(props.modelValue)) {
      emit('update:modelValue', restored) // 截断同步，不触发 change
    }
  } else {
    // 首屏预热一级（避免展开时才请求）
    await loadLevel(1)
  }
})

function onChange(val: Array<string | undefined> | null): void {
  emit('change', normalize(val))
}
</script>

<template>
  <el-cascader
    :model-value="innerValue"
    :props="cascaderProps"
    :placeholder="placeholder"
    :disabled="disabled || hydrating"
    :clearable="clearable"
    style="width: 100%"
    @change="onChange"
  />
</template>
