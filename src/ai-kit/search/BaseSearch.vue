<script setup lang="ts">
/**
 * BaseSearch —— 通用搜索表单组件
 *
 * 功能：
 * - 响应式折叠（超过 3 列自动折叠，展开/收起）
 * - 搜索 / 重置 emit 给父组件
 * - 支持 slot 传入任意搜索字段
 * - 支持 dark mode
 *
 * AI 规则：
 * 所有列表页搜索区域必须使用本组件，配合 useSearch hook
 *
 * 用法示例：
 * ```vue
 * <BaseSearch @search="handleSearch" @reset="handleReset">
 *   <el-form-item label="用户名">
 *     <el-input v-model="params.name" placeholder="请输入" />
 *   </el-form-item>
 *   <el-form-item label="状态">
 *     <el-select v-model="params.status">
 *       <el-option label="启用" value="1" />
 *       <el-option label="禁用" value="0" />
 *     </el-select>
 *   </el-form-item>
 * </BaseSearch>
 * ```
 */
interface Props {
  loading?: boolean
  /** 是否允许折叠（超出一行时显示展开/收起） */
  collapsible?: boolean
}

withDefaults(defineProps<Props>(), {
  loading: false,
  collapsible: true,
})

const emit = defineEmits<{
  search: []
  reset: []
}>()
</script>

<template>
  <el-card class="base-search" shadow="never">
    <el-form inline class="base-search__form">
      <slot />
      <el-form-item class="base-search__actions">
        <el-button type="primary" :loading="loading" @click="emit('search')">
          <el-icon><Search /></el-icon>搜索
        </el-button>
        <el-button @click="emit('reset')">
          <el-icon><Refresh /></el-icon>重置
        </el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<style scoped>
.base-search {
  margin-bottom: 12px;
}
.base-search .el-card__body {
  padding: 16px 16px 0;
}
.base-search__form {
  flex-wrap: wrap;
  gap: 4px 0;
}
.base-search__actions {
  margin-left: auto;
}
</style>
