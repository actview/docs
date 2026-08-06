---
description: class 与 style 的绑定方式：静态字符串、条件类名、样式对象。
---

# 类与样式绑定 {#class-and-style}

## 绑定 `class`

`class` 与 `className` 均可使用，底层都是设置 `el.className`：

```tsx
// 静态类名
<div class="card">卡片</div>

// 动态类名
const active = ref(false)
<div class={active.value ? 'card active' : 'card'}>卡片</div>
```

ActView 没有 `:class` 对象/数组语法，条件类名用 JSX 表达式拼接即可：

```tsx
const status = ref<'success' | 'error'>('success')

<div class={`badge badge-${status.value}`}>状态</div>

// 多个布尔条件
const isDark = ref(false)
const isBordered = ref(true)
<div class={['card', isDark.value && 'dark', isBordered.value && 'bordered'].filter(Boolean).join(' ')}>
  卡片
</div>
```

## 绑定 `style`

`style` 支持**字符串**与**对象**两种形式：

```tsx
// 字符串
<div style="color: red; font-size: 14px">文本</div>

// 对象（更常用，配合响应式）
const color = ref('red')
<div style={{ color: color.value, fontSize: '14px', padding: '8px' }}>文本</div>
```

对象形式使用 **camelCase** 属性名（`fontSize`、`backgroundColor`），内部通过 `Object.assign(el.style, …)` 应用。

```tsx
// 条件样式
const active = ref(false)
<div style={{ fontWeight: active.value ? 'bold' : 'normal' }}>文本</div>

// 自定义属性（CSS 变量）
<div style={{ '--main-color': '#3ecf8e' } as Record<string, string>}>文本</div>
```

## 动态类名 + 动态样式的完整示例

```tsx
import { ref } from 'actview'

export function Switch() {
  const on = ref(false)

  return (
    <button
      class={`switch ${on.value ? 'switch-on' : 'switch-off'}`}
      style={{
        background: on.value ? '#3ecf8e' : '#e2e8f0',
        transition: 'background 0.2s'
      }}
      onclick={() => (on.value = !on.value)}
    >
      {on.value ? '开' : '关'}
    </button>
  )
}
```

## 下一步

- [条件渲染](./conditional)：`&&` / 三元表达式控制渲染
- [列表渲染](./list)：批量渲染带样式的列表项
