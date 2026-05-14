<script setup lang="ts">
/**
 * BaseDialog —— 通用弹窗组件
 *
 * 功能：
 * - 统一 loading / 确认 / 取消 / ESC 关闭
 * - 焦点陷阱（el-dialog 内置）
 * - 支持 dark mode（CSS 变量）
 * - 禁止业务强耦合，slot 传入内容
 *
 * AI 规则：
 * 所有弹窗组件必须基于本组件封装，禁止裸用 el-dialog
 *
 * 用法示例：
 * ```vue
 * <BaseDialog v-model:visible="visible" title="新增用户" :loading="loading" @confirm="onConfirm">
 *   <UserForm ref="formRef" :model="form" />
 * </BaseDialog>
 * ```
 */
interface Props {
  visible: boolean
  title?: string
  width?: string | number
  loading?: boolean
  /** 点击遮罩是否关闭 */
  closeOnClickModal?: boolean
  confirmText?: string
  cancelText?: string
  /** 隐藏底部操作栏 */
  hideFooter?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  width: '520px',
  loading: false,
  closeOnClickModal: false,
  confirmText: '确 定',
  cancelText: '取 消',
  hideFooter: false,
})

const emit = defineEmits<{
  'update:visible': [val: boolean]
  confirm: []
  cancel: []
}>()

function handleClose() {
  emit('update:visible', false)
  emit('cancel')
}

function handleConfirm() {
  emit('confirm')
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    :width="width"
    :close-on-click-modal="closeOnClickModal"
    destroy-on-close
    @close="handleClose"
  >
    <slot />

    <template v-if="!hideFooter" #footer>
      <div class="base-dialog__footer">
        <el-button @click="handleClose">{{ cancelText }}</el-button>
        <el-button type="primary" :loading="loading" @click="handleConfirm">
          {{ confirmText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.base-dialog__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
