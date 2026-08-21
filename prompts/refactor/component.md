# 组件重构提示词

> 参考规则：`.cursor/rules/refactor/component-refactor.mdc`
> 本 Prompt 面向业务代码重构，不绑定单一 ai-kit 依赖。

---

## 场景一：重复逻辑抽 composable

```
参考：
  - .cursor/rules/refactor/component-refactor.mdc

重构以下组件（粘贴组件代码或告知文件路径）：
  目标：
    - 不改变业务逻辑与对外行为
    - 提取重复逻辑为 composable（如请求、防抖、分页逻辑）
    - 优先复用 ai-kit 已有能力：useRequest / useTable / useDialog / useSearch
    - 发现已有能力时直接替换，禁止再次封装
  验收：
    - 行为不变（原有测试通过）
    - 重复代码消除，类型安全提升
    - 给出 文件:行号 + 具体动作 + 验收标准
```

## 场景二：大组件拆分子组件

```
参考：
  - .cursor/rules/refactor/component-refactor.mdc

重构超长组件（目标：单文件 <= 500 行）：
  目标：
    - 按职责拆分：表单区、列表区、操作区、图表区各自成子组件
    - 子组件 props/emits 类型完整，不通过 any 传参
    - 状态归属清晰：子组件自身状态 vs 提升到父级
  验收：
    - 每个拆分后文件职责单一
    - 页面行为与样式不变
    - 降低耦合：子组件不反向依赖父组件内部状态
```

## 场景三：类型安全提升

```
参考：
  - .cursor/rules/refactor/component-refactor.mdc

重构存在 any / 隐式 any 的组件：
  目标：
    - 消灭 any，补齐类型（接口、泛型、组件类型）
    - API 返回类型与页面类型分离（services/types）
    - el-table 列配置类型化，操作回调参数类型化
  验收：vue-tsc 通过，any 数量归零
```

---

## 通用注意事项

- 只出「报告 + 改造清单」，不直接改业务代码，改前与用户确认
- 重构必须保持行为不变；涉及行为变化单独标注
- 复用 ai-kit 优先于新封装；重复建议给到 ai-kit 已有文件
