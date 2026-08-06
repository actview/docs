---
description: Suspense：等待异步组件加载，加载期间显示 fallback。
---

# Suspense {#suspense}

`Suspense` 用于等待子树中的**异步组件**加载完成：加载期间显示 `fallback`，加载完成后渲染真实内容。

## 基本用法

```tsx
import { lazy, Suspense } from 'actview'

const HeavyPage = lazy(() => import('./HeavyPage'))

export function App() {
  return (
    <Suspense fallback={<p>页面加载中…</p>}>
      <HeavyPage />
    </Suspense>
  )
}
```

流程：

1. `Suspense` 挂载后，子树中的 `lazy` 组件向它注册；
2. 任一异步组件未加载完成 → `pending` 为真 → 显示 `fallback`；
3. 全部加载完成 → `pending` 为假 → 渲染真实内容（`children`）。

## 多个异步组件

一个 `Suspense` 内可以有多个 `lazy` 组件，全部加载完成后才显示内容：

```tsx
<Suspense fallback={<p>加载中…</p>}>
  <Header />
  <Main />
  <Footer />
</Suspense>
```

其中 `Header` / `Main` / `Footer` 都是 `lazy()` 创建的异步组件。

## 没有 Suspense 时

`lazy` 组件在没有 `Suspense` 包裹时也可以工作：加载期间渲染 `null` 占位，加载完成后直接渲染真实组件——只是没有 loading 提示。

## 与 ErrorBoundary 组合

异步加载可能失败，用 `ErrorBoundary` 包住 `Suspense` 提供失败兜底：

```tsx
<ErrorBoundary fallback={<p>加载失败</p>}>
  <Suspense fallback={<p>加载中…</p>}>
    <HeavyPage />
  </Suspense>
</ErrorBoundary>
```

## 下一步

- [异步组件](../components/async)：`lazy()` 的详细用法
- [ErrorBoundary](./error-boundary)：渲染错误兜底
