---
description: 组件事件：通过回调 props 实现子组件向父组件通信。
---

# 组件事件 {#events}

ActView 没有独立的 `emit` 机制——**子组件向父组件通信 = 调用父组件传入的回调 props**。这是纯 JSX 框架最自然的事件模型。

## 基本用法

父组件把一个函数作为 props 传给子组件，子组件在合适时机调用它：

```tsx
// src/SearchInput.tsx —— 子组件
export function SearchInput(props: {
  value: string
  onSearch: (keyword: string) => void
}) {
  return (
    <input
      value={props.value}
      oninput={(e) => {
        // 把输入内容"上报"给父组件（简单起见每次输入都回调）
        props.onSearch(e.target.value)
      }}
    />
  )
}
```

```tsx
// src/App.tsx —— 父组件
import { ref } from 'actview'
import { SearchInput } from './SearchInput'

export function App() {
  const keyword = ref('')

  function handleSearch(kw: string) {
    keyword.value = kw
    console.log('搜索：', kw)
  }

  return (
    <div>
      <SearchInput value={keyword.value} onSearch={handleSearch} />
      <p>当前关键词：{keyword.value}</p>
    </div>
  )
}
```

## 命名约定

回调 props 建议统一使用 `onXxx` 命名（`onSearch`、`onChange`、`onSubmit`），与 DOM 事件保持一致，读代码时一目了然。

::: tip 与 DOM 事件的区别
- 组件 props 中的 `onXxx` 是**普通回调函数**，由子组件在逻辑中调用；
- 原生元素上的 `onclick` / `oninput` 是 **DOM 事件监听**，由浏览器触发。

两者的触发方与语义不同，但用法上都是传函数，不需要刻意区分。
:::

## 带参数的回调

回调可以携带任意参数（数据、事件对象、甚至多个值）：

```tsx
// 子组件：提交表单时上报数据
export function LoginForm(props: {
  onSubmit: (data: { username: string; password: string }) => void
}) {
  function handleSubmit(e: Event) {
    e.preventDefault()
    props.onSubmit({ username: 'admin', password: '123456' })
  }

  return (
    <form onsubmit={handleSubmit}>
      <input name="username" placeholder="用户名" />
      <input name="password" type="password" placeholder="密码" />
      <button type="submit">登录</button>
    </form>
  )
}
```

## 可选的回调

回调可能没传时，调用前先判空：

```tsx
export function DeleteButton(props: { onDelete?: () => void }) {
  return (
    <button
      onclick={() => {
        props.onDelete?.() // 可选调用
      }}
    >
      删除
    </button>
  )
}
```

## 结合 v-model 模式（受控组件）

「value + oninput」组合是最常见的「子组件受控」模式，父组件持有状态：

```tsx
function TextField(props: {
  label: string
  value: string
  oninput: (e: FormEvent<HTMLInputElement>) => void
}) {
  return (
    <label>
      {props.label}：
      <input value={props.value} oninput={props.oninput} />
    </label>
  )
}

export function Profile() {
  const name = ref('')
  return (
    <TextField
      label="姓名"
      value={name.value}
      oninput={(e) => (name.value = e.target.value)}
    />
  )
}
```

## 下一步

- [Props](./props)：props 的声明、传递与更新机制
- [内容与插槽](./slots)：`children` 传递任意内容
