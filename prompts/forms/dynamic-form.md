# Dynamic Form 动态表单提示词

> 所有动态表单必须基于：
> - 组件：`src/ai-kit/forms/BaseForm.vue`
> - 数据请求：`src/ai-kit/hooks/useRequest.ts`
> - 弹窗容器（可选）：`src/ai-kit/components/BaseDialog.vue`

---

## 场景一：schema 驱动动态表单

```
参考：
  - src/ai-kit/forms/BaseForm.vue
  - src/ai-kit/hooks/useRequest.ts

生成「动态配置」表单，由 schema 数组驱动：
  字段描述：
    - [{ key, label, type: 'input'|'select'|'date'|'number', required, options?, placeholder? }]
  要求：
    - 组件遍历 schema 渲染表单项，不写死字段
    - 支持 el-select 的 options 由接口 getConfigOptions(key) 按需加载
    - 必填项渲染红色星号，校验规则从 schema.required 生成
    - 字段变化时按 key 联动清空/更新其他字段（支持 onChange 回调）
    - resetFields 恢复初始值，表单值变化通过 update:modelValue 同步
    - 使用 BaseForm + useRequest，禁止页面内裸写一堆 el-form-item
```

---

## 场景二：动态增删行（key-value）

```
参考：
  - src/ai-kit/forms/BaseForm.vue

生成「参数配置」动态行表单：
  结构：可动态添加/删除的行，每行 key-value 键值对
  要求：
    - 行内校验：key 必填且唯一，value 必填
    - 添加行时自动补空对象，删除行时同步清理校验状态
    - 最多 20 行，超出禁用添加按钮并提示
    - 每行支持上移/下移或拖拽排序（可选）
    - 用 form 数组字段 + 循环渲染 el-form-item（:prop="`rows.${index}.key`"）
    - 整体校验通过后汇总 rows 提交
```

---

## 场景三：动态表单嵌入弹窗

```
参考：
  - src/ai-kit/forms/BaseForm.vue
  - src/ai-kit/components/BaseDialog.vue
  - src/ai-kit/hooks/useDialog.ts
  - src/ai-kit/hooks/useRequest.ts

生成「字段编辑器」动态表单，嵌入 BaseDialog：
  功能：
    - 动态字段列表：fieldName、fieldType(select: string/number/boolean/date)、required(switch)
    - 添加/删除字段行，字段名校验唯一
    - 提交时调用 saveSchema(payload)，成功后关闭弹窗并刷新
  要求：
    - useDialog 管理弹窗状态，BaseForm 渲染字段列表
    - useRequest 管理保存请求的 loading/error，失败保留弹窗和已填数据
    - 删除行、清空校验用 resetFields 保持一致
```

---

## 通用注意事项

- 动态字段的 prop 必须使用索引路径（`rows.${index}.key`），否则校验状态错乱
- 删除行后调用 `formRef.validateField()` 或整体 reset 清理残留校验
- 重复字段名在新增/提交前统一校验，避免脏数据入库
- schema 驱动时 type 与组件映射集中维护，禁止散落 switch
