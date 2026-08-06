---
description: 异步组件：lazy + Suspense 懒加载，ErrorBoundary 处理加载失败。
---

# 异步组件 {#async}

当某个组件体积较大或不需要首屏加载时，可以用 `lazy()` 把它变成**异步组件**：按需加载，加载期间显示 fallback。

## 基本用法

```tsx
import { lazy, Suspense } from 'actview'

// 异步组件：loader 返回 Promise<{ default: 组件 }>
const HeavyPage = lazy(() => import('./HeavyPage'))

export function App() {
  return (
    <Suspense fallback={<p>页面加载中…</p>}>
      <HeavyPage />
    </Suspense>
  )
}
```

- `lazy(loader)`：loader 返回一个 Promise；加载完成后从模块中取 `default` 作为组件；
- `<Suspense fallback={…}>`：包裹异步组件，加载期间显示 `fallback`，加载完成后渲染真实组件。

## 手动模拟异步加载

`lazy` 不要求一定是 `import()`，任意 Promise 都可以：

```tsx
import { lazy, defineComponent, Suspense } from 'actview'

const AsyncCard = lazy(
  () =>
    new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            default: defineComponent(function Loaded() {
              return () => <div>异步加载完成 🎉</div>
            })
          }),
        1000
      )
    )
)

export function App() {
  return (
    <Suspense fallback={<span>加载中…</span>}>
      <AsyncCard />
    </Suspense>
  )
}
```

::: tip loader 返回格式
loader 需要 resolve 一个 `{ default: 组件 }` 对象（与 ES 模块的 `import()` 行为一致）。组件必须是 `defineComponent` 产物或会被 Babel 插件转换的函数组件。`lazy` 内部取 `m.default ?? m` 兜底。
:::

## 加载失败：配合 `ErrorBoundary`

`lazy` 的 loader 抛错（Promise reject）时，异步组件渲染时会抛出该错误。用 `ErrorBoundary` 捕获并展示 fallback：

```tsx
import { lazy, Suspense, ErrorBoundary } from 'actview'

// loader 可能失败的异步组件
const FragilePage = lazy(() =>
  fetch('/api/config')
    .then(() => import('./FragilePage'))
    .catch(() => {
      throw new Error('配置加载失败')
    })
)

export function App() {
  return (
    <ErrorBoundary
      fallback={<p style={{ color: 'red' }}>页面加载失败，请稍后重试</p>}
    >
      <Suspense fallback={<p>加载中…</p>}>
        <FragilePage />
      </Suspense>
    </ErrorBoundary>
  )
}
```

`ErrorBoundary` 会捕获其子树（包括异步组件）在渲染期间的任何错误，并展示 `fallback`（可以是 VNode，也可以是 `(err) => VNode` 函数）。详见 [ErrorBoundary](../built-ins/error-boundary)。

## 常见问题

**Q：异步组件没有包在 `Suspense` 里会怎样？**
加载期间渲染 `null`（占位），加载完成后直接渲染真实组件，不会报错——只是没有 loading 效果。

**Q：加载完成后组件状态会丢吗？**
不会。`lazy` 内部缓存已加载的组件，`loaded` 为 ref 状态，加载完成后组件替换为真实组件并正常建立实例。

## 下一步

- [内置组件：Suspense](../built-ins/suspense)：等待异步组件的机制
- [内置组件：ErrorBoundary](../built-ins/error-boundary)：渲染错误兜底
