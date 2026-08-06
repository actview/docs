---
description: 在 JSX 中实现条件渲染：逻辑与、三元表达式、变量切换。
---

# 条件渲染 {#conditional}

ActView 没有 `v-if` / `v-show` 指令，条件渲染直接使用 JSX 表达式。

## `&&` —— 渲染或什么都不渲染

当条件为真时渲染元素，为假时渲染 `false`（什么也不输出）：

```tsx
import { ref } from 'actview'

export function Notification() {
  const hasMessage = ref(false)

  return (
    <div>
      {hasMessage.value && <p>你有一条新消息！</p>}
      <button onclick={() => (hasMessage.value = !hasMessage.value)}>
        切换消息
      </button>
    </div>
  )
}
```

::: warning 注意 `0` 与空字符串
JSX 中 `{0 && <p>…</p>}` 会渲染出 `0`。如果条件本身可能是 `0`，请显式转成布尔值：

```tsx
{count.value > 0 && <p>有 {count.value} 条</p>}
{/* count 为 0 时渲染 false，不会显示 0 */}
```
:::

## 三元表达式 —— 二选一

```tsx
import { ref } from 'actview'

export function Status() {
  const isLoggedIn = ref(false)

  return (
    <div>
      {isLoggedIn.value ? <p>欢迎回来！</p> : <button onclick={() => (isLoggedIn.value = true)}>登录</button>}
    </div>
  )
}
```

## 多分支 —— 函数返回

分支较多时，把逻辑提取到函数中返回 JSX：

```tsx
import { ref } from 'actview'

const role = ref<'admin' | 'user' | 'guest'>('guest')

function renderRole() {
  if (role.value === 'admin') return <p>管理员</p>
  if (role.value === 'user') return <p>普通用户</p>
  return <p>访客</p>
}

export function RoleBadge() {
  return <div>{renderRole()}</div>
}
```

## 为什么没有 `v-show`

`v-show` 靠 CSS `display` 切换。ActView 没有内置指令，等价写法是直接控制 `style`：

```tsx
import { ref } from 'actview'

export function Collapsible() {
  const visible = ref(true)

  return (
    <div>
      <div style={{ display: visible.value ? 'block' : 'none' }}>内容区域</div>
      <button onclick={() => (visible.value = !visible.value)}>折叠</button>
    </div>
  )
}
```

## 下一步

- [列表渲染](./list)：`map` + `key` 渲染列表
- [类与样式绑定](./class-and-style)：条件类名与样式
