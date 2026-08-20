<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

/**
 * BaseForm —— 提供统一校验、重置和响应式字段布局的表单容器
 *
 * 使用场景：弹窗表单、抽屉表单、独立编辑页
 * AI 规则：业务表单优先使用本组件，接口提交留在父组件；与 BaseDialog / BaseDrawer 配套使用
 * Props：model、rules、labelWidth、loading、inline、columns
 * Expose：validate、reset、clearValidate、scrollToField
 * Slots：default
 */
interface Props {
  model: object
  rules?: FormRules
  labelWidth?: string | number
  loading?: boolean
  inline?: boolean
  columns?: 1 | 2
}

withDefaults(defineProps<Props>(), {
  labelWidth: '100px',
  loading: false,
  inline: false,
  columns: 1,
})

const formRef = ref<FormInstance>()

async function validate(): Promise<boolean> {
  if (!formRef.value) return false
  try {
    await formRef.value.validate()
    return true
  } catch {
    return false
  }
}

function reset() {
  formRef.value?.resetFields()
}

function clearValidate(props?: string | string[]) {
  formRef.value?.clearValidate(props)
}

function scrollToField(prop: string) {
  formRef.value?.scrollToField(prop)
}

defineExpose({ validate, reset, clearValidate, scrollToField })
</script>

<template>
  <el-form
    ref="formRef"
    class="base-form"
    :class="{ 'base-form--two-columns': columns === 2 && !inline }"
    :model="model"
    :rules="rules"
    :label-width="labelWidth"
    :inline="inline"
    :disabled="loading"
    v-bind="$attrs"
  >
    <slot />
  </el-form>
</template>

<style scoped>
.base-form--two-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  column-gap: 20px;
}
@media (max-width: 768px) {
  .base-form--two-columns {
    grid-template-columns: 1fr;
  }
}
</style>
