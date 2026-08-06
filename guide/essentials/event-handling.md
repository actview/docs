---
description: 在 JSX 中监听 DOM 事件：onclick、onInput、捕获阶段。
---

# 事件处理 {#event-handling}

## 监听事件

ActView 的事件 props 以 `on` 开头，后面接**小写 DOM 事件名**（如 `click`、`input`、`change`）。也可以使用驼峰形式（如 `onClick`），最终都会归一化为小写事件名。

```tsx
import { ref } from 'actview'

export function Counter() {
  const count = ref(0)

  return (
    <div>
      <p>计数：{count.value}</p>
      <button onclick={() => count.value++}>+1</button>
      <button onClick={() => count.value--}>-1</button>
    </div>
  )
}
```

::: tip 推荐风格
项目源码统一使用小写事件名（`onclick`、`oninput`、`onchange`），与 DOM 事件名一一对应，文档示例沿用此风格。
:::

## 事件对象

事件处理函数接收原生 `Event` 对象：

```tsx
function handleClick(e: MouseEvent) {
  console.log(e.target, e.clientX, e.clientY)
}

return <button onclick={handleClick}>点击</button>
```

## 内联 vs 具名函数

```tsx
// 内联箭头函数（简单逻辑）
<button onclick={() => count.value++}>+1</button>

// 具名函数（复杂逻辑，可复用）
function reset() {
  count.value = 0
  console.log('已重置')
}
<button onclick={reset}>重置</button>

// 带参数
function setCount(n: number) {
  count.value = n
}
<button onclick={() => setCount(10)}>设为 10</button>
```

## 捕获阶段：`onXxxCapture`

使用 `Capture` 后缀监听捕获阶段（从外向内）：

```tsx
export function EventPhase() {
  function onPhase() {
    console.log('捕获阶段触发（先于冒泡）')
  }

  return (
    <div onclickcapture={onPhase}>
      <button>点击我</button>
    </div>
  )
}
```

事件名 `onClickCapture` / `onclickcapture` 均可，内部通过 `addEventListener(event, handler, true)` 注册。

## 事件更新与解绑

ActView 采用 Vue 3 的 **invoker 模式**：同一元素同一事件只绑定一次 `addEventListener`，handler 更新时仅替换内部引用；handler 传 `null` / `undefined` 时自动解绑。因此你无需关心重复绑定或手动移除事件。

```tsx
import { ref } from 'actview'

export function ToggleHandler() {
  const enabled = ref(true)

  return (
    <button onclick={enabled.value ? () => console.log('on') : null}>
      点击（{enabled.value ? '有处理函数' : '无处理函数'}）
    </button>
  )
}
```

## 修饰符

ActView 没有 `v-on` 的事件修饰符（`.stop` / `.prevent` 等）。需要时直接在函数里调用原生方法：

```tsx
// 阻止默认行为
function onSubmit(e: Event) {
  e.preventDefault()
  // …提交逻辑
}

// 阻止冒泡
function onInnerClick(e: MouseEvent) {
  e.stopPropagation()
}

return (
  <form onsubmit={onSubmit}>
    <div onclick={() => console.log('外层')}>
      <button onclick={onInnerClick}>内层按钮</button>
    </div>
  </form>
)
```

## 表单相关事件

```tsx
const text = ref('')
const checked = ref(false)

<input
  value={text.value}
  oninput={(e) => (text.value = e.target.value)}
/>

<input
  type="checkbox"
  checked={checked.value}
  onchange={(e) => (checked.value = e.target.checked)}
/>
```

::: tip 类型提示
`e.target` 在 TSX 中默认是 `EventTarget`。需要访问 `value` / `checked` 时，ActView 提供了 `FormEvent` 类型（其 `target` 已声明 `value` / `checked` 属性）：

```tsx
import type { FormEvent } from '@actview/jsx'

<input oninput={(e: FormEvent<HTMLInputElement>) => (text.value = e.target.value)} />
```
:::

## 下一步

- [表单绑定](./forms)：完整的输入控件绑定模式
- [组件事件](../components/events)：子组件如何向父组件通信
