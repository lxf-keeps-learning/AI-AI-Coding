<script setup lang="ts">
import { computed } from 'vue'

/**
 * BaseDrawer —— 提供响应式尺寸、关闭拦截和提交状态的抽屉容器
 *
 * 使用场景：详情编辑、长表单、分步流程
 * AI 规则：所有业务 Drawer 优先使用本组件，禁止业务页面裸用 el-drawer；与 useDialog 配套使用
 * Props：visible、title、size、loading、direction、beforeClose、confirmText、cancelText、hideFooter
 * Emits：update:visible、confirm、cancel、close-error
 * Slots：default、footer
 */
interface Props {
  visible: boolean
  title?: string
  size?: string
  loading?: boolean
  direction?: 'rtl' | 'ltr' | 'ttb' | 'btt'
  confirmText?: string
  cancelText?: string
  hideFooter?: boolean
  beforeClose?: () => boolean | Promise<boolean>
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  loading: false,
  direction: 'rtl',
  confirmText: '保 存',
  cancelText: '取 消',
  hideFooter: false,
})

const emit = defineEmits<{
  'update:visible': [value: boolean]
  confirm: []
  cancel: []
  'close-error': [error: unknown]
}>()

const responsiveSize = computed(() => {
  if (props.size) return props.size
  return props.direction === 'ttb' || props.direction === 'btt'
    ? 'min(480px, 100vh)'
    : 'min(480px, 100vw)'
})

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
  <el-drawer
    :model-value="visible"
    :title="title"
    :size="responsiveSize"
    :direction="direction"
    :show-close="!loading"
    :close-on-press-escape="!loading"
    :before-close="handleBeforeClose"
    destroy-on-close
  >
    <div v-loading="loading" class="base-drawer__body">
      <slot />
    </div>

    <template v-if="!hideFooter" #footer>
      <slot name="footer">
        <div class="base-drawer__footer">
          <el-button :disabled="loading" @click="requestClose()">{{ cancelText }}</el-button>
          <el-button type="primary" :loading="loading" @click="emit('confirm')">
            {{ confirmText }}
          </el-button>
        </div>
      </slot>
    </template>
  </el-drawer>
</template>

<style scoped>
.base-drawer__body {
  height: 100%;
  overflow-y: auto;
  padding: 0 4px;
}
.base-drawer__footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-light);
}
</style>
