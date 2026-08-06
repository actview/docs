---
description: 计数器示例：ref 响应式状态与事件处理。
---

# 计数器 {#counter}

最基础的响应式示例：`ref` 保存计数，按钮事件修改状态，组件自动更新。

## 代码

::: code-group

```tsx [src/App.tsx]
import { ref } from 'actview'

export function App() {
  const count = ref(0)

  return (
    <div style={{ textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
      <h1>计数器</h1>
      <p style={{ fontSize: '48px', margin: '16px 0' }}>{count.value}</p>
      <div>
        <button onclick={() => count.value--}>-1</button>
        <button onclick={() => count.value++}>+1</button>
        <button onclick={() => (count.value = 0)}>重置</button>
      </div>
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

- `count.value` 是唯一的数据源：读取（渲染）与写入（事件）都走同一个 ref；
- 修改 `count.value` 后，组件 effect 自动重跑 `render + patch`，无需手动操作 DOM；
- 在 JSX 中读取必须显式写 `.value`。

## 相关文档

- [响应式基础](../guide/essentials/reactivity)：`ref` / `reactive`
- [事件处理](../guide/essentials/event-handling)：`onclick` 等
