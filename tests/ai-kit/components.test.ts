import { defineComponent, nextTick } from 'vue'
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import BaseDialog from '../../src/ai-kit/components/BaseDialog.vue'
import BaseDrawer from '../../src/ai-kit/components/BaseDrawer.vue'
import BaseSearch from '../../src/ai-kit/search/BaseSearch.vue'

const ElButtonStub = defineComponent({
  name: 'ElButton',
  props: { disabled: Boolean, loading: Boolean },
  emits: ['click'],
  template: '<button :disabled="disabled" @click="$emit(\'click\')"><slot /></button>',
})

const ElDialogStub = defineComponent({
  name: 'ElDialog',
  props: { beforeClose: Function },
  template: '<section><slot /><slot name="footer" /></section>',
})

const ElDrawerStub = defineComponent({
  name: 'ElDrawer',
  props: { beforeClose: Function, size: String },
  template: '<section><slot /><slot name="footer" /></section>',
})

describe('BaseDialog', () => {
  it('loading 时阻止关闭', async () => {
    const wrapper = mount(BaseDialog, {
      props: { visible: true, loading: true },
      global: { stubs: { ElDialog: ElDialogStub, ElButton: ElButtonStub } },
    })
    const done = vi.fn()

    wrapper.getComponent(ElDialogStub).props('beforeClose')?.(done)
    await flushPromises()

    expect(done).not.toHaveBeenCalled()
    expect(wrapper.emitted('update:visible')).toBeUndefined()
    expect(wrapper.emitted('cancel')).toBeUndefined()
  })

  it('关闭拦截异常不会产生未处理拒绝，并通过 close-error 上报', async () => {
    const error = new Error('dirty-check failed')
    const wrapper = mount(BaseDialog, {
      props: { visible: true, beforeClose: async () => Promise.reject(error) },
      global: { stubs: { ElDialog: ElDialogStub, ElButton: ElButtonStub } },
    })
    const done = vi.fn()

    wrapper.getComponent(ElDialogStub).props('beforeClose')?.(done)
    await flushPromises()

    expect(done).not.toHaveBeenCalled()
    expect(wrapper.emitted('close-error')).toEqual([[error]])
  })
})

describe('BaseDrawer', () => {
  it('未传 size 时使用不会超过视口的响应式尺寸', () => {
    const wrapper = mount(BaseDrawer, {
      props: { visible: true },
      global: {
        directives: { loading: () => undefined },
        stubs: { ElDrawer: ElDrawerStub, ElButton: ElButtonStub },
      },
    })

    expect(wrapper.getComponent(ElDrawerStub).props('size')).toBe('min(480px, 100vw)')
  })
})

describe('BaseSearch', () => {
  it('超过三个字段时提供展开和收起', async () => {
    const wrapper = mount(BaseSearch, {
      slots: {
        default: '<el-form-item>A</el-form-item><el-form-item>B</el-form-item><el-form-item>C</el-form-item><el-form-item>D</el-form-item>',
      },
      global: {
        stubs: {
          ElCard: defineComponent({ template: '<div><slot /></div>' }),
          ElForm: defineComponent({ template: '<form><slot /></form>' }),
          ElFormItem: defineComponent({ template: '<div class="el-form-item"><slot /></div>' }),
          ElButton: ElButtonStub,
        },
      },
    })
    await nextTick()

    expect(wrapper.get('.base-search__fields').classes()).toContain('is-collapsed')
    const toggle = wrapper.findAll('button').find((button) => button.text() === '展开')
    expect(toggle).toBeDefined()
    await toggle?.trigger('click')

    expect(wrapper.get('.base-search__fields').classes()).not.toContain('is-collapsed')
    expect(wrapper.emitted('update:expanded')).toEqual([[true]])
  })
})
