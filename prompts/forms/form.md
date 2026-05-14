# Form 表单提示词

## 基础表单（嵌入 Dialog）

```
参考：
  - src/ai-kit/forms/BaseForm.vue
  - src/ai-kit/components/BaseDialog.vue
  - src/ai-kit/hooks/useDialog.ts

生成「用户新增/编辑」功能：
  表单字段：
    - name(姓名, required)
    - phone(手机号, required, 格式校验)
    - email(邮箱, 格式校验)
    - deptId(部门, el-select, required)
    - status(状态, el-radio-group: 启用/禁用)
  要求：
    - 表单组件 UserForm.vue 单独拆出
    - 通过 defineExpose({ validate, reset }) 暴露给父组件
    - 嵌入 BaseDialog，confirm 回调中校验 → 提交 → 刷新列表
```

## 动态表单（字段动态增减）

```
参考：
  - src/ai-kit/forms/BaseForm.vue
  - src/ai-kit/hooks/useDialog.ts

生成「参数配置」动态表单：
  - 支持动态添加/删除行（key-value 键值对）
  - 每行校验：key 必填且唯一，value 必填
  - 最多 20 行限制，超出禁用添加
  - 支持拖拽排序（可选）
```

## 搜索表单（配合 useSearch）

```
参考：
  - src/ai-kit/search/BaseSearch.vue
  - src/ai-kit/hooks/useSearch.ts
  - src/ai-kit/hooks/useTable.ts

生成「订单列表」搜索表单：
  字段：orderNo(订单号)、status(状态，多选)、dateRange(日期范围)、userName(用户名)
  要求：
    - 使用 BaseSearch 组件包裹
    - useSearch 管理参数，搜索防抖 300ms
    - 重置还原所有字段并刷新列表
    - 日期范围用 el-date-picker type="daterange"
```

## 步骤表单

```
参考：
  - src/ai-kit/forms/BaseForm.vue
  - src/ai-kit/components/BaseDrawer.vue

生成「项目申请」步骤表单，共 3 步：
  步骤1 - 基本信息：name、type、priority、description
  步骤2 - 成员配置：负责人（单选）、参与人（多选）、预计工期
  步骤3 - 确认提交：汇总展示，可回到上一步修改
  要求：
    - 每步独立校验，通过后才能下一步
    - 用 el-steps 显示进度
    - 在 BaseDrawer 内展示
```
