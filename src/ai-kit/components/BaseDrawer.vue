<script setup lang="ts">
/**
 * BaseDrawer —— 通用抽屉组件
 *
 * 功能：
 * - 响应式宽度（桌面 480px / 移动端 100%）
 * - 内容区独立滚动，不产生双滚动条
 * - 支持 loading 遮罩
 * - 长表单离开提示（通过 beforeClose 暴露给业务）
 * - 支持 dark mode
 *
 * AI 规则：
 * 所有抽屉组件必须基于本组件封装，禁止裸用 el-drawer
 *
 * 用法示例：
 * ```vue
 * <BaseDrawer v-model:visible="visible" title="编辑用户" :loading="loading" @confirm="onSave">
 *   <UserForm ref="formRef" :model="form" />
 * </BaseDrawer>
 * ```
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
  /** 离开前拦截，返回 false 阻止关闭（用于表单未保存提示） */
  beforeClose?: () => boolean | Promise<boolean>
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  size: '480px',
  loading: false,
  direction: 'rtl',
  confirmText: '保 存',
  cancelText: '取 消',
  hideFooter: false,
})

const emit = defineEmits<{
  'update:visible': [val: boolean]
  confirm: []
  cancel: []
}>()

async function handleClose() {
  if (props.beforeClose) {
    const allow = await props.beforeClose()
    if (!allow) return
  }
  emit('update:visible', false)
  emit('cancel')
}

function handleConfirm() {
  emit('confirm')
}
</script>

<template>
  <el-drawer
    :model-value="visible"
    :title="title"
    :size="size"
    :direction="direction"
    destroy-on-close
    @close="handleClose"
  >
    <div v-loading="loading" class="base-drawer__body">
      <slot />
    </div>

    <template v-if="!hideFooter" #footer>
      <div class="base-drawer__footer">
        <el-button @click="handleClose">{{ cancelText }}</el-button>
        <el-button type="primary" :loading="loading" @click="handleConfirm">
          {{ confirmText }}
        </el-button>
      </div>
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
