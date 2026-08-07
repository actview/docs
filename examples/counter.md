---
description: 计数器示例：ref 响应式状态与事件处理。
---

# 计数器 {#counter}

最基础的响应式示例：`ref` 保存计数，按钮事件修改状态，组件自动更新。

## 在线体验

下面的计数器就是**当前页面真实运行的 ActView 组件**——由 `<script lang="tsx">` 块定义、Markdown 正文渲染，点击按钮试试：

<script lang="tsx">
import { ref } from 'actview'

export function CounterDemo() {
  const count = ref(0)

  return (
    <div class="av-demo av-demo-center">
      <p class="av-count">{count.value}</p>
      <div>
        <button onclick={() => count.value--}>-1</button>
        <button onclick={() => count.value++}>+1</button>
        <button onclick={() => (count.value = 0)}>重置</button>
      </div>
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
.av-demo-center {
  text-align: center;
}
.av-count {
  font-size: 40px;
  margin: 8px 0;
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

<CounterDemo />


## 完整代码

::: code-group

```tsx [src/App.tsx]
import { ref } from 'actview'

export function App() {
  const count = ref(0)

  return (
    <div class="av-demo av-demo-center">
      <p class="av-count">{count.value}</p>
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
