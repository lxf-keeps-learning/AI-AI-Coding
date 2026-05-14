生成 ECharts 折线图组件：

要求：
- 支持 resize
- 自动销毁
- dark mode
- loading
- 空状态
- data update
- tooltip 优化
- 防止内存泄漏
- hooks 化

性能要求：
- 避免重复 setOption
- 大数据节流
- 支持增量更新