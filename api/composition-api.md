---
description: 组合式 API：defineComponent、setup、生命周期钩子。
---

# 组合式 API {#composition-api}

## defineComponent()

把「setup 函数」包装为组件对象（`{ __setup }`），并在类型层面伪装 call signature 以通过 JSX 类型检查。

```ts
function defineComponent<Setup extends (...args: any[]) => any>(setup: Setup)
// 返回 { __setup: setup } & ((...args: Parameters<Setup>) => ReturnType<Setup>)
```

```tsx
import { defineComponent } from 'actview'

export const Greeting = defineComponent((props: { name: string }) => {
  // 函数体 = setup：只执行一次，可创建状态、注册钩子
  return () => <p>你好，{props.name}！</p> // 返回 render 函数
})
```

> 大多数情况你不需要手动调用：`actviewPlugin` 会在构建时把函数组件自动转为 `defineComponent` 产物。

## setup

组件核心结构：`setup(props) => render`。

```tsx
export const Counter = defineComponent(() => {
  const count = ref(0) // setup：创建状态（只执行一次）

  return () => (
    // render：每次渲染执行，读取响应式数据
    <button onclick={() => count.value++}>{count.value}</button>
  )
})
```

- **setup**：组件首次挂载时执行一次；创建响应式状态、注册生命周期钩子、创建侦听器；
- **render**：每次渲染执行；读取数据、产出 VNode；
- 数据变化 → effect 重跑 render + patch，setup 不再执行。

## 生命周期钩子

钩子只能在 setup 中调用（模块级 `currentInstance` 上下文定位组件）。

```ts
function onMounted(fn: () => void): void
function onUpdated(fn: () => void): void
function onBeforeUnmount(fn: () => void): void
function onUnmounted(fn: () => void): void
```

| 钩子 | 时机 |
| --- | --- |
| `onMounted` | 首次渲染并挂载到 DOM 后（子组件先于父组件触发） |
| `onUpdated` | 每次响应式重渲染后 |
| `onBeforeUnmount` | 即将卸载、DOM 移除前 |
| `onUnmounted` | 卸载完成、effect 停止后 |

```tsx
import { ref, onMounted, onUnmounted } from 'actview'

export function Timer() {
  const seconds = ref(0)
  let timer: number | undefined

  onMounted(() => {
    timer = window.setInterval(() => seconds.value++, 1000)
  })
  onUnmounted(() => window.clearInterval(timer))

  return <p>{seconds.value}s</p>
}
```

## 组合式函数（Composable）

把「状态 + 逻辑 + 钩子」抽成可复用的函数，返回响应式状态：

```tsx
// src/useMouse.ts
import { ref, onMounted, onUnmounted } from 'actview'

export function useMouse() {
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

```tsx
// 使用
import { useMouse } from './useMouse'

export function MouseTracker() {
  const { x, y } = useMouse()
  return <p>鼠标位置：{x.value}, {y.value}</p>
}
```

## getCurrentInstance()

返回当前组件的实例（仅在 setup 期间可用），供高级场景使用。

```ts
function getCurrentInstance(): ComponentInstance | null
```
