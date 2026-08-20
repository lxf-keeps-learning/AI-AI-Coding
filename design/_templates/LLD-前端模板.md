# LLD-前端-<slug>

> 状态：评审中 ｜ 版本：v1.0 ｜ 需求 slug：<slug>
> 负责人：@研发    上游：design/<slug>/HLD-<slug>-概要设计.md
> 变更记录：v1.0 <日期> 初始创建

## 1. 技术栈与约束（Part B 来源）
- Vue 3 + TS(strict) + Vite；UI 库/状态管理/路由/测试框架
- 代码规范引用：.cursor/rules/global/*（base/architecture/naming/typescript）
- 禁止：any、type assertion；必须复用 ai-kit，禁止重复实现

## 2. 目录结构（★ 写死，供 design_ref 引用）
```
src/
├── pages/<slug>/              # 页面容器
│   ├── index.vue
│   └── components/            # 页面级组件
├── components/<slug>/         # 业务组件
├── hooks/<slug>/              # 业务 Hook
├── api/<slug>.ts              # API 封装
└── store/<slug>.ts            # Pinia store
```

## 3. 页面组件拆分
| 组件 | 职责 | 父组件 | 关键 Props | 复用 ai-kit |
|------|------|--------|-----------|------------|
| ReportPage | 页面容器/数据编排 | - | - | - |
| SummaryCard | 指标卡展示 | ReportPage | {kpi} | components |
| TrendChart | 趋势图 | ReportPage | {trend} | charts |

## 4. 数据模型与类型定义
```typescript
interface ReportSummary {
  date: string;
  kpi: Array<{ name: string; value: number; unit: string }>;
  trend: Array<{ date: string; value: number }>;
}
```

## 5. API 封装规范
```typescript
// api/<slug>.ts —— 遵循 ai-kit/hooks 的 request 封装
export const getReportSummary = (params: { date: string }) =>
  request.get<ReportSummary>('/api/report/summary', { params });
```

## 6. Hook 抽象
| Hook | 职责 | 返回 |
|------|------|------|
| useReportData | 数据加载/刷新/loading/error | {data, loading, refresh, error} |

## 7. 状态管理
- Store 模块：store/<slug>.ts（如需要）
- 状态字段 + actions 清单

## 8. 边界与异常处理
- 空数据：展示空状态（复用 ai-kit 空态组件）
- 接口失败：错误提示 + 重试
- 权限不足：路由守卫 + 403 页

## 9. 测试要点（供 ai-testing-orchestrator 用）
- 单测：Hook/工具函数/组件渲染
- 交互：关键交互链路（加载→渲染→筛选→刷新）
