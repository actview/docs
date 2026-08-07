---
description: 异步加载示例：lazy + Suspense 加载态与 ErrorBoundary 失败兜底。
---

# 异步加载 {#async-loading}

用 `lazy` + `Suspense` 实现组件按需加载：加载期间显示 fallback；加载失败由 `ErrorBoundary` 兜底。

## 在线体验

真实运行的组件——点击触发懒加载，`Suspense` 显示加载态，完成后渲染真实组件：

<script lang="tsx">
import { lazy, Suspense, defineComponent } from 'actview'

// lazy：loader 返回 Promise<{ default: 组件 }>，模拟 1.2s 异步加载
const AsyncCardDemo = lazy(
  () =>
    new Promise((resolve) =>
      setTimeout(
        () =>
          resolve({
            default: defineComponent(function Loaded() {
              return () => (
                <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '8px' }}>
                  🎉 异步组件加载完成
                </div>
              )
            })
          }),
        1200
      )
    )
)

export function AsyncDemo() {
  return (
    <div
      style={{
        fontFamily: 'system-ui, sans-serif',
        padding: '16px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        background: '#f8fafc'
      }}
    >
      <Suspense fallback={<p style={{ color: '#94a3b8' }}>⏳ 正在加载异步组件…</p>}>
        <AsyncCardDemo />
      </Suspense>
    </div>
  )
}
</script>

<AsyncDemo />

## 完整代码

::: code-group

```tsx [src/HeavyCard.tsx]
import { defineComponent } from 'actview'

// 模拟一个"重量级"组件（真实场景可能是动态 import 的页面）
export const HeavyCard = defineComponent(function () {
  return () => (
    <div style={{ padding: '16px', background: '#fef3c7', borderRadius: '8px' }}>
      🎉 异步组件加载完成
    </div>
  )
})
```

```tsx [src/App.tsx]
import { ref, lazy, Suspense, ErrorBoundary } from 'actview'
import { HeavyCard } from './HeavyCard'

// lazy：loader 返回 Promise<{ default: 组件 }>
const AsyncCard = lazy(() => new Promise((resolve) => setTimeout(() => resolve({ default: HeavyCard }), 1500)))

// 一个"会失败"的异步组件
const FragileCard = lazy(() =>
  new Promise((_, reject) => setTimeout(() => reject(new Error('资源加载失败')), 1000))
)

export function App() {
  const showFragile = ref(false)

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <h1>异步加载</h1>

      <Suspense fallback={<p style={{ color: '#94a3b8' }}>⏳ 正在加载异步组件…</p>}>
        <AsyncCard />
      </Suspense>

      <button
        style={{ marginTop: '16px' }}
        onclick={() => (showFragile.value = !showFragile.value)}
      >
        加载一个会失败的组件
      </button>

      {showFragile.value && (
        <ErrorBoundary fallback={<p style={{ color: '#dc2626' }}>⚠️ 加载失败，请稍后重试</p>}>
          <Suspense fallback={<p style={{ color: '#94a3b8' }}>⏳ 加载中…</p>}>
            <FragileCard />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  )
}
```

```tsx [src/main.tsx]
import { createApp } from 'actview'
import { App } from './App'

createApp(App).mount('#app')
```

:::

## 要点

- `lazy(loader)` 的 loader 需要 resolve `{ default: 组件 }`（与 `import()` 模块格式一致），组件必须是 `defineComponent` 产物（或用函数组件会被插件转换）；
- `Suspense` 在异步组件未完成时显示 `fallback`，全部完成后渲染真实内容；
- loader reject 时组件渲染抛错，`ErrorBoundary` 捕获并显示失败兜底；
- 生产中直接写 `lazy(() => import('./HeavyPage'))` 即可实现路由级代码分割。

## 相关文档

- [异步组件](../guide/components/async)：`lazy` 详解
- [Suspense](../guide/built-ins/suspense)：加载占位
- [ErrorBoundary](../guide/built-ins/error-boundary)：错误兜底
