<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ElTree } from 'element-plus'
import type { TreeKey } from '../hooks/useTree'

/**
 * BaseTree —— 提供过滤、勾选、展开、空态和错误态的树容器
 *
 * 使用场景：部门树、菜单树、懒加载树、可勾选权限树
 * AI 规则：树结构展示优先使用本组件，远程数据配合 useTree；禁止业务页面重复封装 el-tree 状态
 * Props：data、loading、error、nodeKey、label、children、checkedKeys、expandedKeys、lazy、load
 * Emits：update:checkedKeys、update:expandedKeys、node-click、check、retry
 * Slots：node、empty、error
 */
export interface TreeRecord {
  [key: string]: unknown
}

interface Props {
  data?: TreeRecord[]
  loading?: boolean
  error?: unknown
  nodeKey?: string
  label?: string
  children?: string
  showCheckbox?: boolean
  checkedKeys?: TreeKey[]
  expandedKeys?: TreeKey[]
  defaultExpandAll?: boolean
  load?: (node: unknown, resolve: (data: TreeRecord[]) => void) => void
  lazy?: boolean
  filterText?: string
}

const props = withDefaults(defineProps<Props>(), {
  data: () => [],
  loading: false,
  nodeKey: 'id',
  label: 'label',
  children: 'children',
  showCheckbox: false,
  checkedKeys: () => [],
  expandedKeys: () => [],
  defaultExpandAll: false,
  lazy: false,
  filterText: '',
})

const emit = defineEmits<{
  'update:checkedKeys': [keys: TreeKey[]]
  'update:expandedKeys': [keys: TreeKey[]]
  'node-click': [node: TreeRecord]
  check: [node: TreeRecord, checkedInfo: unknown]
  retry: []
}>()

const treeRef = ref<InstanceType<typeof ElTree>>()
const currentExpandedKeys = new Set<TreeKey>(props.expandedKeys)

watch(
  () => props.filterText,
  (value) => treeRef.value?.filter(value),
  { immediate: true }
)

watch(
  () => props.checkedKeys,
  (keys) => treeRef.value?.setCheckedKeys(keys),
  { deep: true }
)

function filterNode(value: string, data: TreeRecord) {
  if (!value) return true
  return String(data[props.label] ?? '').toLocaleLowerCase().includes(value.toLocaleLowerCase())
}

function handleCheck(node: TreeRecord, info: { checkedKeys: TreeKey[] }) {
  emit('update:checkedKeys', info.checkedKeys)
  emit('check', node, info)
}

function getNodeKey(node: TreeRecord): TreeKey | null {
  const key = node[props.nodeKey]
  return typeof key === 'string' || typeof key === 'number' ? key : null
}

function handleExpand(node: TreeRecord) {
  const key = getNodeKey(node)
  if (key === null) return
  currentExpandedKeys.add(key)
  emit('update:expandedKeys', [...currentExpandedKeys])
}

function handleCollapse(node: TreeRecord) {
  const key = getNodeKey(node)
  if (key === null) return
  currentExpandedKeys.delete(key)
  emit('update:expandedKeys', [...currentExpandedKeys])
}

function getCheckedNodes() {
  return treeRef.value?.getCheckedNodes() ?? []
}

defineExpose({ getCheckedNodes, treeRef })
</script>

<template>
  <div class="base-tree" v-loading="loading">
    <div v-if="error" class="base-tree__state">
      <slot name="error" :error="error" :retry="() => emit('retry')">
        <el-alert title="树数据加载失败" type="error" show-icon :closable="false" />
        <el-button type="primary" link @click="emit('retry')">重试</el-button>
      </slot>
    </div>

    <el-tree
      v-else
      ref="treeRef"
      :data="data"
      :node-key="nodeKey"
      :props="{ label, children }"
      :show-checkbox="showCheckbox"
      :default-checked-keys="checkedKeys"
      :default-expanded-keys="expandedKeys"
      :default-expand-all="defaultExpandAll"
      :lazy="lazy"
      :load="load"
      :filter-node-method="filterNode"
      highlight-current
      @check="handleCheck"
      @node-click="(node: TreeRecord) => emit('node-click', node)"
      @node-expand="handleExpand"
      @node-collapse="handleCollapse"
    >
      <template #default="{ node, data: nodeData }">
        <slot name="node" :node="node" :data="nodeData">
          <span class="base-tree__label">{{ node.label }}</span>
        </slot>
      </template>
    </el-tree>

    <slot v-if="!error && !loading && !data.length" name="empty">
      <el-empty description="暂无数据" :image-size="60" />
    </slot>
  </div>
</template>

<style scoped>
.base-tree {
  width: 100%;
  min-height: 60px;
}
.base-tree__state {
  display: flex;
  align-items: center;
  gap: 8px;
}
.base-tree__state :deep(.el-alert) {
  flex: 1;
}
.base-tree__label {
  font-size: 14px;
  line-height: 1.5;
}
</style>
