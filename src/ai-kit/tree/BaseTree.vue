<script setup lang="ts">
import { ref, watch } from 'vue'
import type { ElTree } from 'element-plus'

/**
 * BaseTree —— 通用树组件
 *
 * 功能：
 * - 搜索过滤（filterText 驱动）
 * - checkbox 勾选 / 展开收起
 * - lazy load（配置 lazy + load prop）
 * - loading 骨架
 * - 节点点击 / 勾选 emit
 * - 支持 dark mode
 *
 * AI 规则：
 * 所有树结构展示优先使用本组件，通过 useTree hook 管理数据
 *
 * 用法示例：
 * ```vue
 * <BaseTree
 *   :data="treeData"
 *   :loading="loading"
 *   v-model:checked-keys="checkedKeys"
 *   @node-click="onNodeClick"
 * />
 * ```
 */
interface TreeNode {
  [key: string]: unknown
}

interface Props {
  data?: TreeNode[]
  loading?: boolean
  nodeKey?: string
  label?: string
  children?: string
  showCheckbox?: boolean
  checkedKeys?: (string | number)[]
  defaultExpandAll?: boolean
  /** lazy load 函数 */
  load?: (node: TreeNode, resolve: (data: TreeNode[]) => void) => void
  lazy?: boolean
  /** 搜索文本（外部传入即可触发过滤） */
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
  defaultExpandAll: false,
  lazy: false,
  filterText: '',
})

const emit = defineEmits<{
  'update:checkedKeys': [keys: (string | number)[]]
  'node-click': [node: TreeNode]
  check: [node: TreeNode, checkedInfo: unknown]
}>()

const treeRef = ref<InstanceType<typeof ElTree>>()

// 搜索过滤
watch(
  () => props.filterText,
  (val) => treeRef.value?.filter(val)
)

function filterNode(value: string, data: TreeNode) {
  if (!value) return true
  return String(data[props.label] ?? '').includes(value)
}

function handleCheck(_node: TreeNode, info: { checkedKeys: (string | number)[] }) {
  emit('update:checkedKeys', info.checkedKeys)
  emit('check', _node, info)
}

function handleNodeClick(node: TreeNode) {
  emit('node-click', node)
}

/** 供父组件调用：获取选中节点 */
function getCheckedNodes() {
  return treeRef.value?.getCheckedNodes()
}

defineExpose({ getCheckedNodes, treeRef })
</script>

<template>
  <div class="base-tree" v-loading="loading">
    <!-- 搜索框由父组件传入 filterText 驱动，此处不内置，保持职责单一 -->
    <el-tree
      ref="treeRef"
      :data="data"
      :node-key="nodeKey"
      :props="{ label, children }"
      :show-checkbox="showCheckbox"
      :default-checked-keys="checkedKeys"
      :default-expand-all="defaultExpandAll"
      :lazy="lazy"
      :load="load"
      :filter-node-method="filterNode"
      highlight-current
      @check="handleCheck"
      @node-click="handleNodeClick"
    >
      <!-- 自定义节点内容 -->
      <template #default="{ node, data: nodeData }">
        <slot name="node" :node="node" :data="nodeData">
          <span class="base-tree__label">{{ node.label }}</span>
        </slot>
      </template>
    </el-tree>

    <el-empty v-if="!loading && !data.length" description="暂无数据" :image-size="60" />
  </div>
</template>

<style scoped>
.base-tree {
  width: 100%;
  min-height: 60px;
}
.base-tree__label {
  font-size: 14px;
  line-height: 1.5;
}
</style>
