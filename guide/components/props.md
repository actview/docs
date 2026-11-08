---
description: 组件 Props：声明、传递、更新机制与单向数据流。
---

# Props {#props}

Props 是父组件传给子组件的数据。在 ActView 中，props 就是组件（setup 函数）的**第一个参数**。

## 声明与使用

```tsx
// src/Greeting.tsx
export function Greeting(props: { name: string }) {
  return () => <p>你好，{props.name}！</p>
}
```

::: tip 类型即声明
ActView 没有单独的 props 声明语法——直接用 TypeScript 参数类型声明即可，编辑器会给出完整提示。`defineComponent` 的类型定义会自动从 setup 第一参数推导出该组件的 props 类型。
:::

## 传递 props

```tsx
// src/App.tsx
import { ref } from 'actview'
import { Greeting } from './Greeting'

export function App() {
  const name = ref('ActView')

  return (
    <div>
      {/* 静态值 */}
      <Greeting name="世界" />

      {/* 动态值（响应式） */}
      <Greeting name={name.value} />

      {/* 展开对象 */}
      <Greeting {...{ name: name.value }} />
    </div>
  )
}
```

## 更新机制：setup 只执行一次

子组件的 `setup`（函数体）**在整个生命周期中只执行一次**。父组件传参变化时：

1. 父组件重渲染，生成带新 props 的子组件 VNode；
2. 渲染器对比新旧 props，有差异则**增量写入**子组件的 props 对象，并手动调度子组件更新；
3. 子组件重新执行 render，读取到新 props，精确更新 DOM。

```tsx
// src/PropsDemo.tsx
import { reactive } from 'actview'

let setupCount = 0

function Greet(props: { name: string }) {
  setupCount++
  return (
    <div>
      <strong>{props.name}</strong>
      <span>（setup 已执行 {setupCount} 次）</span>
    </div>
  )
}

export function PropsDemo() {
  const state = reactive({ name: 'actview' })

  return (
    <div>
      <input value={state.name} oninput={(e) => (state.name = e.target.value)} />
      <Greet name={state.name} />
    </div>
  )
}
```

修改输入框 → 子组件只更新文本内容，`setupCount` 保持不变——组件实例与 DOM 被复用而非重建。

::: tip props 是普通对象
props 不是响应式代理，而是普通对象 + 父组件显式调度更新（这也是 Vue 的做法）。因此**不要在子组件内部直接修改 props**，修改不会生效且会破坏数据流。
:::

## 单向数据流

props 遵循**单向数据流**：父组件是唯一的数据来源，子组件只能读取、不能修改。

```tsx
function Counter(props: { initial: number }) {
  // ✅ 用 props 初始化本地状态
  const count = ref(props.initial)

  // ❌ 不要这样做：修改 props 不会生效
  // props.initial = 999

  return <button onclick={() => count.value++}>{count.value}</button>
}
```

## 默认值

用解构 + 默认值即可：

```tsx
export function Greeting(props: { name?: string }) {
  const { name = '陌生人' } = props
  return <p>你好，{name}！</p>
}
```

## 透传 props

组件收到的 props 全量进入 `setup`。要把 `class` / `style` / `on*` 等落到根元素，用 JSX 展开 `{...props}`（见 [组件基础](./component-basics)）——框架不自动透传。

## 下一步

- [组件事件](./events)：用回调 props 实现子 → 父通信
- [内容与插槽](./slots)：`children` 传递任意内容
