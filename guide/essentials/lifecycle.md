---
description: 组件生命周期钩子：onMounted / onUpdated / onBeforeUnmount / onUnmounted。
---

# 生命周期 {#lifecycle}

ActView 提供 4 个生命周期钩子：

| 钩子 | 触发时机 |
| --- | --- |
| `onMounted(fn)` | 组件首次渲染并挂载到 DOM 之后 |
| `onUpdated(fn)` | 组件每次因响应式数据变化而重新渲染之后 |
| `onBeforeUnmount(fn)` | 组件即将卸载、DOM 即将移除之前 |
| `onUnmounted(fn)` | 组件卸载完成、effect 已停止之后 |

## 注册钩子

钩子**只能在组件 `setup`（函数组件体）中调用**——ActView 用模块级 `currentInstance` 上下文定位所属组件。在 setup 之外调用会得到一条警告并忽略：

```tsx
import { ref, onMounted, onUpdated, onBeforeUnmount, onUnmounted } from 'actview'

export function Timer() {
  const seconds = ref(0)
  let timer: number | undefined

  onMounted(() => {
    console.log('组件已挂载')
    timer = window.setInterval(() => seconds.value++, 1000)
  })

  onUpdated(() => {
    console.log('组件已更新，当前秒数：', seconds.value)
  })

  onBeforeUnmount(() => {
    console.log('即将卸载')
  })

  onUnmounted(() => {
    console.log('已卸载，清理定时器')
    window.clearInterval(timer)
  })

  return <p>已运行 {seconds.value} 秒</p>
}
```

## 典型的清理场景

`onUnmounted` 是最常用的钩子——清理定时器、取消订阅、移除事件监听：

```tsx
export function useMousePosition() {
  const x = ref(0)
  const y = ref(0)

  function onMove(e: MouseEvent) {
    x.value = e.clientX
    y.value = e.clientY
  }

  onMounted(() => window.addEventListener('mousemove', onMove))
  onUnmounted(() => window.removeEventListener('mousemove', onMove))

  return { x, y }
}
```

::: tip setup 内创建的响应式副作用会自动清理
在 setup 期间创建的 `watch` / `watchEffect` / `computed` 会注册进组件的 `EffectScope`，组件卸载时自动 `stop()`，无需手动清理。
:::

## 调用顺序

- **挂载**：子组件的 `onMounted` 先于父组件触发（深度优先，与 Vue 3 相反）。
- **更新**：同一次渲染批次中，`onUpdated` 在组件子树 patch 完成后触发。
- **卸载**：`onBeforeUnmount` → 停止组件 effect → `onUnmounted`。

## 与响应式状态配合

`onMounted` 常用于发起初始请求：

```tsx
import { ref, onMounted } from 'actview'

export function UserProfile() {
  const user = ref<{ name: string } | null>(null)

  onMounted(async () => {
    const res = await fetch('/api/user')
    user.value = await res.json()
  })

  return <div>{user.value ? `你好，${user.value.name}` : '加载中…'}</div>
}
```

## 下一步

- [响应式基础](./reactivity)：`watch` / `watchEffect` 与 `EffectScope`
- [组件基础](../components/component-basics)：setup 与 render 的生命周期关系
- [异步组件](../components/async)：配合 `Suspense` / `lazy()` 的加载场景
