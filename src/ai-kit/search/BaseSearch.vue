<script setup lang="ts">
import { computed, onMounted, onUpdated, ref } from 'vue'

/**
 * BaseSearch —— 提供查询、重置和可折叠字段布局的搜索容器
 *
 * 使用场景：列表页基础查询、多条件筛选、移动端搜索区
 * AI 规则：列表页搜索区域优先使用本组件并配合 useSearch，禁止重复编写查询按钮和折叠状态
 * Props：loading、collapsible、defaultExpanded
 * Emits：search、reset、update:expanded
 * Slots：default
 */
interface Props {
  loading?: boolean
  collapsible?: boolean
  defaultExpanded?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  collapsible: true,
  defaultExpanded: false,
})

const emit = defineEmits<{
  search: []
  reset: []
  'update:expanded': [value: boolean]
}>()

const fieldsRef = ref<HTMLDivElement>()
const fieldCount = ref(0)
const expanded = ref(props.defaultExpanded)
const showToggle = computed(() => props.collapsible && fieldCount.value > 3)

function updateFieldCount() {
  fieldCount.value = fieldsRef.value?.querySelectorAll('.el-form-item').length ?? 0
  if (!showToggle.value) expanded.value = true
}

function toggleExpanded() {
  expanded.value = !expanded.value
  emit('update:expanded', expanded.value)
}

onMounted(updateFieldCount)
onUpdated(updateFieldCount)
</script>

<template>
  <el-card class="base-search" shadow="never">
    <el-form inline class="base-search__form" @submit.prevent="emit('search')">
      <div
        ref="fieldsRef"
        class="base-search__fields"
        :class="{ 'is-collapsed': showToggle && !expanded }"
      >
        <slot />
      </div>
      <el-form-item class="base-search__actions">
        <el-button type="primary" native-type="submit" :loading="loading">搜索</el-button>
        <el-button :disabled="loading" @click="emit('reset')">重置</el-button>
        <el-button v-if="showToggle" link type="primary" @click="toggleExpanded">
          {{ expanded ? '收起' : '展开' }}
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped>
.base-search {
  margin-bottom: 12px;
}
.base-search :deep(.el-card__body) {
  padding: 16px 16px 0;
}
.base-search__form {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 0;
}
.base-search__fields {
  display: contents;
}
.base-search__fields.is-collapsed :deep(.el-form-item:nth-child(n + 4)) {
  display: none;
}
.base-search__actions {
  margin-left: auto;
}
@media (max-width: 640px) {
  .base-search__form,
  .base-search__fields :deep(.el-form-item),
  .base-search__fields :deep(.el-form-item__content) {
    width: 100%;
  }
  .base-search__actions {
    margin-left: 0;
  }
}
</style>
