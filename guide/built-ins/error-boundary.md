---
description: ErrorBoundary：捕获子树渲染错误并显示 fallback。
---

# ErrorBoundary {#error-boundary}

`ErrorBoundary` 捕获其子树在**渲染期间抛出的错误**，并显示 fallback 内容，避免整个应用白屏。

## 基本用法

```tsx
import { ErrorBoundary } from 'actview'

function Bomber() {
  // 渲染期间抛错（例如读取不存在的配置）
  throw new Error('boom!')
}

export function App() {
  return (
    <ErrorBoundary fallback={<b style={{ color: 'red' }}>组件渲染出错了</b>}>
      <Bomber />
    </ErrorBoundary>
  )
}
```

`fallback` 支持两种形式：

```tsx
// VNode
<ErrorBoundary fallback={<p>出错了</p>}>
  <Widget />
</ErrorBoundary>

// 函数：接收错误对象
<ErrorBoundary fallback={(err) => <p>出错了：{String(err)}</p>}>
  <Widget />
</ErrorBoundary>
```

## 捕获范围

- 子组件 `setup` / `render` 执行期间抛出的错误；
- 异步组件（`lazy`）loader 失败后渲染时抛出的错误（见 [异步组件](../components/async)）；
- **不捕获**事件回调、异步任务（`setTimeout` / `Promise` 回调）中抛出的错误——这些不属于渲染期，请用 `try/catch` 自行处理。

## 嵌套边界

`ErrorBoundary` 可以嵌套。渲染错误会交给**最近的**边界处理：

```tsx
<ErrorBoundary fallback={<p>外层兜底</p>}>
  <section>
    <ErrorBoundary fallback={<p>内层兜底</p>}>
      <DangerousWidget />
    </ErrorBoundary>
  </section>
</ErrorBoundary>
```

已经处于错误状态的边界不会重复触发（防止 fallback 自身抛错导致死循环）。

## 复位

把错误状态当作普通响应式状态管理即可。例如用「触发错误」的开关复位：

```tsx
const boom = ref(false)

function Bomber() {
  return <span>{boom.value ? (() => { throw new Error('x') })() : '正常'}</span>
}
```

## 下一步

- [Suspense](./suspense)：异步加载占位
- [异步组件](../components/async)：`lazy` 加载失败的处理
