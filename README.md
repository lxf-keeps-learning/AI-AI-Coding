### 团队使用
1. 团队成员： git clone https://github.com/xs-lxf/AI-AI-Coding.git

2. Cursor 打开项目

3. 直接使用chat 会话框 聊天，如 生成团队管理页面


### 为什么cursor 可以实现
1. Cursor自动读取 .cursor/rules 中的规则，同时Cursor 会读取整个项目代码上下文，项目本身也是AI知识库


### 团队实际接入步骤
1. 项目内置AI工程，必须跟代码一起提交git
project/
    ├── .cursor/
    ├── prompts/
    ├── src/ai-kit/
    ├── docs/ai/

2. 团队统一使用Cursor
    - Cursor + Claude Sonnet + GPT-5.5
    - 不建议混用太多AI工具，容易 Prompt不统一、Rules不生效、生成质量不稳定

3. 团队打开项目即可生效：.cursor/rules 自动被Cursor加载，不需要单独配置Prompt

### 实际使用
1. 开发列表页 
    - 在chat会话框里输入：
        参考：
            - list-page-template.vue
            - BaseSearch
            - useTable

            生成设备管理页面
    - AI会自动：找模版、找Search、找hooks、找request、生成标准结构

2. Code Review
    - 在chat框输入：review 当前diff
    - AI自动：检查规范、检查重复代码、检查性能、检查hooks、检查TS类型


## 增加公共组件时，必须写AI注释
1. 让AI 更懂项目，而不是猜、搜索、模仿，注释相当于AI的文档，也是Prompt Engineering 核心

## 项目重点 （！！！）
1. 不要让AI从0开始生成
2. 让AI基于现有的规范标准去生成