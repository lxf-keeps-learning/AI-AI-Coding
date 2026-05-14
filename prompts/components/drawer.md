# Drawer 抽屉组件提示词

## 快速生成

```
参考：
  - src/ai-kit/components/BaseDrawer.vue
  - src/ai-kit/forms/BaseForm.vue
  - src/ai-kit/hooks/useDialog.ts

生成「用户详情编辑」抽屉组件，字段：name(姓名)、phone(手机号)、deptId(部门)、roles(角色，多选)
要求：表单校验、loading 状态、离开拦截（表单修改后提示）
```

## 带左侧树 + 右侧抽屉的联动场景

```
参考：
  - src/ai-kit/tree/BaseTree.vue
  - src/ai-kit/components/BaseDrawer.vue
  - src/ai-kit/hooks/useTree.ts
  - src/ai-kit/hooks/useDialog.ts

生成「组织架构管理」页面：
  - 左侧：部门树（BaseTree + useTree），点击部门节点
  - 右侧：用户列表（useTable）
  - 操作：点击"编辑"打开 BaseDrawer，字段：name、phone、status
```

## 步骤表单抽屉

```
参考：
  - src/ai-kit/components/BaseDrawer.vue
  - src/ai-kit/hooks/useDialog.ts

生成「申请流程」步骤抽屉，共 3 步：
  步骤1：基本信息（name、type、description）
  步骤2：配置项（配置表格，可动态增删行）
  步骤3：确认预览
要求：步骤间校验、上一步/下一步、最终提交
```
