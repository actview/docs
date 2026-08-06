---
description: 内置组件与工具：Teleport、Transition、KeepAlive、ErrorBoundary、Suspense、lazy。
---

# 内置组件 {#built-in-components}

## Teleport

把 children 渲染到指定 DOM 节点。

```tsx
<Teleport to="body">
  <div>弹窗内容</div>
</Teleport>
```

**props**：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `to` | `string \| Element \| null` | 目标容器：CSS 选择器 / DOM 元素 / `null`（内联到当前容器） |
| `children` | `any` | 传送的内容 |

`to` 为响应式值时，目标变化会自动迁移已挂载的 DOM。

## Transition

单个子节点的进入/离开过渡动画。

```tsx
<Transition name="fade">
  {show.value && <p>内容</p>}
</Transition>
```

**props**：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `name` | `string` | 类名前缀（默认 `v`），生成 `{name}-enter-from` 等 6 个过渡类 |
| `duration` | `number` | 过渡时长（毫秒），显式指定时不再读取 CSS |
| `children` | `any` | 单个子节点（多个时警告并取第一个） |

## KeepAlive

缓存子组件实例与 DOM，切换时避免销毁重建。

```tsx
<KeepAlive>
  {tab.value === 'a' ? <CompA key="a" /> : <CompB key="b" />}
</KeepAlive>
```

**props**：`children`（子组件需为单根元素）。缓存键为子节点的 `key` 或组件类型。

## ErrorBoundary

捕获子树渲染错误并显示 fallback。

```tsx
<ErrorBoundary fallback={<p>出错了</p>}>
  <DangerousWidget />
</ErrorBoundary>

{/* fallback 也可以是函数：接收错误对象 */}
<ErrorBoundary fallback={(err) => <p>{String(err)}</p>}>
  <Widget />
</ErrorBoundary>
```

**props**：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `fallback` | `VNode \| ((err: unknown) => VNode)` | 错误兜底内容 |
| `children` | `any` | 受保护的子树 |

## Suspense

等待子树中的异步组件（`lazy`）加载完成，期间显示 fallback。

```tsx
<Suspense fallback={<p>加载中…</p>}>
  <AsyncPage />
</Suspense>
```

**props**：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `fallback` | `VNode` | 加载期间的占位内容 |
| `children` | `any` | 包含异步组件的子树 |

## lazy()

创建异步组件：loader 返回 `Promise<{ default: 组件 }>`。

```ts
function lazy(loader: () => Promise<any>): 组件
```

```tsx
import { lazy } from 'actview'

// 动态 import（模块 default 导出组件）
const HeavyPage = lazy(() => import('./HeavyPage'))

// 任意 Promise
const AsyncCard = lazy(() =>
  new Promise((resolve) =>
    setTimeout(() => resolve({ default: MyComponent }), 1000)
  )
)
```

- 加载期间渲染 `null`（配合 `Suspense` 显示 fallback）；
- loader 失败（reject）时渲染阶段抛出错误，交给 `ErrorBoundary` 处理；
- 内部缓存已加载组件，多次渲染不会重复加载。

## 下一步

- [指南：内置组件](/guide/built-ins/teleport)：各内置组件的使用指南
- [指南：异步组件](/guide/components/async)：`lazy` + `Suspense` 详解
