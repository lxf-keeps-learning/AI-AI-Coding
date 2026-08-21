# Git Commit 提示词

> 约束参考：`.cursor/rules/global/git.mdc`

## 标准 Commit Message

根据当前 `git diff`（含暂存区）：

```
请根据以下 diff 生成一次提交：

<在此粘贴 git diff 或告知我查看当前工作区改动>

要求：
1. commit message 遵循 Conventional Commits：
   - feat: 新功能
   - fix: 修复
   - refactor: 重构（不改行为）
   - perf: 性能优化
   - test: 测试
   - docs: 文档
   - chore: 杂项/构建
2. 主题行 <= 50 字符，动词开头，英文或中文均可
3. 需要时加正文：为什么改、影响面、是否破坏性变更
4. 不要包含 diff 里没有的信息
```

## 带风险说明的提交说明

```
请根据当前 git diff 生成：
- commit message（Conventional Commits）
- 修改说明：改了哪些文件、各自做了什么、为什么改
- 风险说明：哪些模块/功能可能受影响、是否破坏性变更、是否需要回归测试

特别关注：
- 接口签名变化、字段增删、数据结构变化
- 公共组件/Hook 行为变化
- 依赖版本变化
- 删除或重命名的导出
```

## 拆分提交建议

```
当前工作区改动包含多个无关变更，请帮我拆分提交：
1. 按逻辑分组：功能 A、功能 B、重构、测试、文档
2. 每组的改动文件清单
3. 每组建议的 commit message
4. 提示是否有循环依赖需要先提交

不要修改代码，只输出拆分方案和命令。
```

## 使用注意

- 只依据真实的 git diff，禁止编造改动
- 不确定时先运行 `git status` / `git diff` 确认改动范围
- 涉及破坏性变更必须用 `!`（如 `feat!:`）或明确写在正文
- 无对应运行时资产，本 Prompt 不引用 ai-kit
