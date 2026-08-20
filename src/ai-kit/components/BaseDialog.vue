<script setup lang="ts">
/**
 * BaseDialog —— 提供统一关闭拦截和提交状态的弹窗容器
 *
 * 使用场景：新增编辑表单、确认流程、自定义内容弹窗
 * AI 规则：所有业务 Dialog 优先使用本组件，禁止业务页面裸用 el-dialog；与 useDialog 配套使用
 * Props：visible、title、width、loading、beforeClose、confirmText、cancelText、hideFooter
 * Emits：update:visible、confirm、cancel、close-error
 * Slots：default、footer
 */
interface Props {
  visible: boolean
  title?: string
  width?: string | number
  loading?: boolean
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  confirmText?: string
  cancelText?: string
  hideFooter?: boolean
  beforeClose?: () => boolean | Promise<boolean>
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  width: '520px',
  loading: false,
  closeOnClickModal: false,
  closeOnPressEscape: true,
  confirmText: '确 定',
  cancelText: '取 消',
  hideFooter: false,
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: []
  cancel: []
  'close-error': [error: unknown]
}>()

async function requestClose(done?: () => void) {
  if (props.loading) return
  try {
    if (props.beforeClose && !(await props.beforeClose())) return
  } catch (error) {
    emit('close-error', error)
    return
  }
  emit('update:visible', false)
  emit('cancel')
  done?.()
}

function handleBeforeClose(done: () => void) {
  void requestClose(done)
}
</script>

<template>
  <el-dialog
    :model-value="visible"
    :title="title"
    :width="width"
    :close-on-click-modal="closeOnClickModal"
    :close-on-press-escape="closeOnPressEscape && !loading"
    :show-close="!loading"
    :before-close="handleBeforeClose"
    destroy-on-close
  >
    <slot />

    <template v-if="!hideFooter" #footer>
      <slot name="footer">
        <div class="base-dialog__footer">
          <el-button :disabled="loading" @click="requestClose()">{{ cancelText }}</el-button>
          <el-button type="primary" :loading="loading" @click="emit('confirm')">
            {{ confirmText }}
          </el-button>
        </div>
      </slot>
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
