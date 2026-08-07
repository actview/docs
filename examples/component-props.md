---
description: 组件与 Props 示例：父子通信与受控输入。
---

# 组件与 Props {#component-props}

演示组件的核心交互：父组件通过 props 传数据，子组件通过**回调 props** 上报事件（ActView 没有独立的 `emit` 机制）。

## 在线体验

真实运行的组件——修改输入框，`GreetCard` 的 props 精确更新；点击「重置」通过回调让父组件复位：

<script lang="tsx">
import { ref } from 'actview'

export function GreetCard(props: { name: string; onReset: () => void }) {
  return (
    <div class="av-card">
      <p class="av-card-text">你好，<strong>{props.name}</strong>！</p>
      <button onclick={props.onReset}>重置</button>
    </div>
  )
}

export function PropsDemo() {
  const name = ref('ActView')

  return (
    <div class="av-demo">
      <input
        value={name.value}
        oninput={(e) => (name.value = e.target.value)}
        placeholder="输入名字…"
      />
      <GreetCard name={name.value} onReset={() => (name.value = 'ActView')} />
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
.av-card {
  padding: 12px;
  margin-top: 8px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
}
.av-card-text {
  margin: 0 0 8px;
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

<PropsDemo />

## 完整代码

::: code-group

```tsx [src/Greeting.tsx]
export function Greeting(props: { name: string; onReset: () => void }) {
  return (
    <div class="av-card">
      <p class="av-card-text">你好，<strong>{props.name}</strong>！</p>
      <button onclick={props.onReset}>重置</button>
    </div>
  )
}
```

```tsx [src/App.tsx]
import { ref } from 'actview'
import { Greeting } from './Greeting'

export function App() {
  const name = ref('ActView')

  return (
    <div class="av-demo">
      <input
        value={name.value}
        oninput={(e) => (name.value = e.target.value)}
        placeholder="输入名字…"
      />
      {/* props：name 传数据，onReset 传回调 */}
      <Greeting name={name.value} onReset={() => (name.value = 'ActView')} />
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

- `setup` 只执行一次：父组件 `name` 变化时，渲染器增量更新 props 并调度子组件更新，**不会重建子组件**；
- 事件就是回调 props：`onReset` 由子组件在合适时机调用，数据流始终单向；
- props 遵循单向数据流，子组件不要直接修改 `props.name`。

## 相关文档

- [组件基础](../guide/components/component-basics)：setup + render 模型
- [Props](../guide/components/props)：传参与更新机制
- [组件事件](../guide/components/events)：回调 props 通信
