<script setup lang="ts">
import { ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

/**
 * BaseForm —— 通用表单组件
 *
 * 功能：
 * - 统一 validate / reset / scrollToField
 * - 双列响应式布局（默认 label-width=100px）
 * - 支持 loading 禁用所有字段
 * - 禁止在表单内直接调用 API（交由父组件处理）
 * - 支持 dark mode
 *
 * AI 规则：
 * 业务表单必须基于本组件封装，通过 slot 传入 el-form-item
 * 通过 expose 的 validate/reset 供父组件（Dialog/Drawer）调用
 *
 * 用法示例：
 * ```vue
 * <BaseForm ref="formRef" :model="form" :rules="rules" :loading="loading">
 *   <el-form-item label="用户名" prop="name">
 *     <el-input v-model="form.name" />
 *   </el-form-item>
 * </BaseForm>
 *
 * // 父组件确认时：
 * const ok = await formRef.value?.validate()
 * ```
 */
interface Props {
  model: Record<string, unknown>
  rules?: FormRules
  labelWidth?: string
  loading?: boolean
  inline?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  labelWidth: '100px',
  loading: false,
  inline: false,
})

const formRef = ref<FormInstance>()

async function validate(): Promise<boolean> {
  try {
    await formRef.value?.validate()
    return true
  } catch {
    return false
  }
}

function reset() {
  formRef.value?.resetFields()
}

function scrollToField(prop: string) {
  formRef.value?.scrollToField(prop)
}

defineExpose({ validate, reset, scrollToField })
</script>

<template>
  <el-form
    ref="formRef"
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
