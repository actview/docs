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
                <div class="av-card av-card-ok">🎉 异步组件加载完成</div>
              )
            })
          }),
        1200
      )
    )
)

export function AsyncDemo() {
  return (
    <div class="av-demo">
      <Suspense fallback={<p class="av-muted">⏳ 正在加载异步组件…</p>}>
        <AsyncCardDemo />
      </Suspense>
    </div>
  )
}
</script>

<style>
.av-demo {
  font-family: system-ui, -apple-system, sans-serif;
  padding: 16px;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}
.av-muted {
  opacity: 0.7;
  margin: 0;
}
.av-card {
  padding: 12px;
  margin-top: 8px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
}
.av-card-ok {
  border-color: var(--vp-c-brand);
  color: var(--vp-c-brand);
}
.av-error {
  color: var(--vp-c-danger-1);
}
.av-demo button {
  margin-right: 6px;
  padding: 6px 14px;
  font-size: 14px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-brand);
  color: #fff;
  cursor: pointer;
}
.av-demo button:hover {
  filter: brightness(1.1);
}
.av-demo input {
  padding: 6px 10px;
  font-size: 14px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}
</style>

<AsyncDemo />

## 完整代码

::: code-group

```tsx [src/HeavyCard.tsx]
import { defineComponent } from 'actview'

// 模拟一个"重量级"组件（真实场景可能是动态 import 的页面）
export const HeavyCard = defineComponent(function () {
  return () => <div class="av-card av-card-ok">🎉 异步组件加载完成</div>
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
    <div class="av-demo">
      <Suspense fallback={<p class="av-muted">⏳ 正在加载异步组件…</p>}>
        <AsyncCard />
      </Suspense>

      <button
        style={{ marginTop: '16px' }}
        onclick={() => (showFragile.value = !showFragile.value)}
      >
        加载一个会失败的组件
      </button>

      {showFragile.value && (
        <ErrorBoundary fallback={<p class="av-error">⚠️ 加载失败，请稍后重试</p>}>
          <Suspense fallback={<p class="av-muted">⏳ 加载中…</p>}>
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
