# Dialog 弹窗提示词

> 所有弹窗必须基于：
> - 组件：`src/ai-kit/components/BaseDialog.vue`
> - Hook（状态管理）：`src/ai-kit/hooks/useDialog.ts`
> - 表单（弹窗内表单）：`src/ai-kit/forms/BaseForm.vue`

> 禁止裸用 `el-dialog`，禁止父子双控 visible，禁止在 Dialog 内部直接调用接口。

---

## 场景一：新增/编辑复用弹窗

```
参考：
  - src/ai-kit/components/BaseDialog.vue
  - src/ai-kit/forms/BaseForm.vue
  - src/ai-kit/hooks/useDialog.ts

生成「用户新增/编辑」弹窗 UserDialog.vue：
  打开方式：列表页通过 useDialog 打开，open(null) 为新增，open(row) 为编辑
  表单字段：
    - name(姓名, required)
    - phone(手机号, required, 手机号格式校验)
    - deptId(部门, el-select 远程搜索, required)
    - status(状态, el-radio-group: 启用/禁用, 默认启用)
  要求：
    - 标题随模式变化：payload 有 id → "编辑用户"，否则 "新增用户"
    - confirm 回调中先 formRef.validate()，通过后才调接口
    - 提交期间 confirm 按钮显示 loading，loading 时关闭图标、ESC、取消均不可用
    - 提交成功 dialog.confirm() 并刷新父级列表，失败保持弹窗打开
    - 表单通过 defineExpose({ validate, reset }) 暴露给 BaseDialog
    - 使用 BaseDialog + useDialog，禁止裸用 el-dialog
```

---

## 场景二：详情只读弹窗

```
参考：
  - src/ai-kit/components/BaseDialog.vue
  - src/ai-kit/hooks/useRequest.ts

生成「订单详情」只读弹窗 OrderDetailDialog.vue：
  接口：getOrderDetail(id)，返回订单对象
  展示：
    - 描述列表（el-descriptions）：订单号、客户、金额、状态、创建时间、备注
    - 明细表格（只读 el-table，无操作列）
  要求：
    - 打开时按 payload.id 拉取详情，loading 用 useRequest 管理
    - 只有「关闭」按钮，没有 confirm
    - 接口失败显示 error 与「重试」入口，不显示空内容
    - 打开期间重复请求以最后一次为准（useRequest 内置并发收敛）
```

---

## 场景三：脏检查拦截（离开拦截）

```
参考：
  - src/ai-kit/components/BaseDialog.vue
  - src/ai-kit/forms/BaseForm.vue
  - src/ai-kit/hooks/useDialog.ts

生成「配置编辑」弹窗，表单被修改后关闭需确认：
  要求：
    - 通过 beforeClose 做脏检查：form 有改动时弹 ElMessageBox 确认「内容未保存，确认关闭？」
    - 确认后才真正关闭；取消则不关闭
    - 异步 beforeClose 失败时监听 close-error 事件，给出反馈
    - 提交成功或关闭后 reset 表单，下次打开是干净状态
    - 脏标记：对 form 做 JSON 快照对比或 watch，简单场景用初始值快照
```

---

## 通用注意事项

- visible 单一来源是 `useDialog`，`BaseDialog` 的 `v-model:visible` 绑定 `dialog.visible.value`
- 打开方式统一 `await dialog.open(row)` 拿 Promise<boolean> 结果，`if (ok) fetchList()`
- 表单校验放 confirm 回调、接口调用之前
- 需要 loading 用 `dialog.loading`，与弹窗交互状态联动
- 关闭按钮行为绑定 `dialog.close`，确认按钮绑定 `handleConfirm`，不要自定义绕开
