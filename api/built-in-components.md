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
| `mode` | `'out-in'` | 旧节点离开动画完成后新节点再进入 |
| `appear` | `boolean` | 首次挂载也播放进入动画（默认不播放） |
| `onBeforeEnter`/`onEnter`/`onAfterEnter`/`onBeforeLeave`/`onLeave`/`onAfterLeave` | `(el, done?) => void` | JS 钩子（有 `onEnter`/`onLeave` 时优先于 CSS 类） |
| `children` | `any` | 单个子节点（多个时警告并取第一个） |

```tsx
// mode="out-in"：切换时旧内容先离开，再进入新内容
<Transition name="fade" mode="out-in">
  {show.value ? <A /> : <B />}
</Transition>

// JS 钩子
<Transition
  appear
  onEnter={(el, done) => { el.animate([...]); done() }}
  onAfterEnter={() => {}}
>
  <div>内容</div>
</Transition>
```

## TransitionGroup

列表增删过渡：列表项移除时播放离开动画后延迟移除。

```tsx
<TransitionGroup name="list">
  {items.value.map((it) => <div key={it.id}>{it.name}</div>)}
</TransitionGroup>
```

**props**：`name`（类名前缀）、`children`（列表）。

## KeepAlive

缓存子组件实例与 DOM，切换时避免销毁重建。

```tsx
<KeepAlive include="CompA,CompB" max={10}>
  {tab.value === 'a' ? <CompA key="a" /> : <CompB key="b" />}
</KeepAlive>
```

**props**：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `include` | `string \| string[] \| RegExp` | 仅缓存匹配（组件名）的组件 |
| `exclude` | `string \| string[] \| RegExp` | 排除匹配的组件（不缓存） |
| `max` | `number` | 最大缓存数，超出 LRU 淘汰最旧 |

> 组件名来源：`defineComponent(fn, name)` 第二参数，或 Babel 从函数名/变量名自动传递。

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

等待子树中的异步组件加载完成，期间显示 fallback。支持 `lazy()` 异步组件和**异步 setup**（`setup` 返回 `Promise<render>`）。

```tsx
<Suspense fallback={<p>加载中…</p>}>
  <AsyncPage />
</Suspense>
```

```tsx
// 异步 setup（top-level await）
const AsyncPage = defineComponent(async function () {
  const data = await fetch('/api/data')
  return () => <div>{data}</div>
})
```

**props**：

| 属性 | 类型 | 说明 |
| --- | --- | --- |
| `fallback` | `VNode` | 加载期间的占位内容 |
| `children` | `any` | 包含异步组件的子树 |

> 支持嵌套：内层 `Suspense` 独立显示自己的 fallback。

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
