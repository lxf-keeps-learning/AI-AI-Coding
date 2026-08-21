# useRequest 请求 Hook 提示词

> 所有请求逻辑必须基于：
> - Hook：`src/ai-kit/hooks/useRequest.ts`
> - 参考规则：`.cursor/rules/hooks/use-request.mdc`

---

## 场景一：手动触发的数据请求

```
参考：
  - src/ai-kit/hooks/useRequest.ts

生成「用户详情」加载逻辑：
  接口：getUserById(id: number)
  要求：
    - 用 useRequest(getUserById) 管理 data / loading / error
    - 组件加载时 request.run(userId)，不要在页面手写 ref 管理三态
    - 渲染 error 与「重试」入口（retry 调用 request.run(userId)），不能只显示 loading
    - data 为空时渲染空状态
    - 组件卸载时 request.cancel()，避免竞态覆盖
```

---

## 场景二：immediate 自动请求

```
参考：
  - src/ai-kit/hooks/useRequest.ts

生成「公告列表」加载逻辑：
  接口：getAnnouncements({ pageSize: 10 })
  要求：
    - useRequest(getAnnouncements, { immediate: true, defaultParams: [{ pageSize: 10 }], initialData: [] })
    - 有参数的 immediate 请求必须提供 defaultParams
    - 刷新用 request.refresh()，不重复写请求函数
    - 列表数据用 computed 或直接渲染 data
```

---

## 场景三：并发竞态与取消

```
参考：
  - src/ai-kit/hooks/useRequest.ts

生成「搜索联想」请求逻辑：
  接口：getSuggestions(keyword)
  要求：
    - 输入防抖 300ms 后调用 request.run(keyword)
    - 用 useRequest 内置递增标识保证只接受最后一次请求结果（后发覆盖先发）
    - 输入变化时对上一次请求 cancel()，防止旧结果闪回
    - 竞态验证：先输入 "a" 再快速输入 "ab"，结果必须来自 "ab"
    - cancel() 只使响应失效；真正中止 HTTP 在 service 层用 AbortController
```

---

## 通用注意事项

- API 一律放 services 目录，hook 内不写业务判断
- 页面级 `data/loading/error` 用 useRequest，分页列表用 useTable
- 必须渲染 error + 重试，不能只显示 loading
- 不要重复封装 request / debounce / throttle，直接复用 ai-kit
