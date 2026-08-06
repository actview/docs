---
description: 类型参考：VNode、ComponentType、PropsOf、HtmlProps、InputProps、FormEvent。
---

# 类型参考 {#utility-types}

以下类型均从 `@actview/jsx` 或 `actview` 导出（`import type { … }`）。

## VNode

VNode 描述对象。

```ts
interface VNode<Type = VNodeTypes> {
  $$typeof: symbol
  type: Type
  key: VNodeKey
  ref: any
  props: Record<string, any> | null
  el?: Node | null // 渲染后指向真实 DOM
}
```

```ts
import type { VNode } from '@actview/jsx'

function renderNode(node: VNode) {
  // …
}
```

## VNodeTypes

VNode `type` 字段允许的类型。

```ts
type VNodeTypes = string | symbol | ((props: any) => any)
// 原生标签 | Fragment | 组件
```

## VNodeChild / VNodeChildren

children 允许的值。

```ts
type VNodeChild = VNode | string | number | boolean | null | undefined
type VNodeChildren = VNodeChild | VNodeChild[]
```

## ComponentType

组件类型：`defineComponent` 产物（`{ __setup }` + call signature）。

```ts
type ComponentType<P = any> = {
  __setup: (props: P) => any
} & ((props: P) => any)
```

```ts
import type { ComponentType } from '@actview/jsx'

function renderWidget(Comp: ComponentType) {
  return createElement(Comp, {})
}
```

## PropsOf

从组件类型推导 props（取 `__setup` 的第一个参数）。

```ts
type PropsOf<T> = T extends { __setup: (props: infer P) => any }
  ? P
  : T extends (props: infer P) => any
    ? P
    : {}
```

```ts
import type { PropsOf } from '@actview/jsx'
import { Greeting } from './Greeting'

type GreetingProps = PropsOf<typeof Greeting> // { name: string }
```

## FormEvent

表单事件：`target` 上带 `value` / `checked` 等输入属性。

```ts
interface FormEvent extends Event {
  target: EventTarget & {
    value: string
    checked: boolean
  }
}
```

```tsx
import type { FormEvent } from '@actview/jsx'

<input
  oninput={(e: FormEvent<HTMLInputElement>) => {
    text.value = e.target.value
  }}
/>
```

## HtmlProps

通用 HTML 元素属性（含全部事件）。可作为自定义组件 props 的基类。

```ts
interface HtmlProps {
  id?: string
  class?: string
  className?: string
  style?: string | Record<string, string | number>
  // …标准属性

  // 事件：小写与 camelCase 均可
  onclick?: (e: MouseEvent) => void
  oninput?: (e: FormEvent) => void
  onClick?: (e: MouseEvent) => void
  onInput?: (e: FormEvent) => void
  onClickCapture?: (e: MouseEvent) => void

  [key: `data-${string}`]: unknown
  [key: string]: unknown
}
```

## InputProps

`input` 元素属性：`type` 收窄为具体联合类型，带表单校验属性。

```ts
interface InputProps extends HtmlProps {
  type?:
    | 'text' | 'password' | 'email' | 'number' | 'checkbox' | 'radio'
    | 'file' | 'submit' | 'reset' | 'button' | 'range' | 'date'
    | 'time' | 'color' | 'hidden' | 'search' | 'tel' | 'url'
    | 'month' | 'week' | 'datetime-local'
  value?: string | number | readonly string[]
  checked?: boolean
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  min?: number | string
  max?: number | string
  step?: number | string
  // …
}
```

## 全局 JSX 命名空间

`@actview/jsx` 入口副作用声明全局 `JSX` 命名空间：

```ts
declare global {
  namespace JSX {
    type Element = VNode
    type ElementType = VNodeTypes | ComponentType
    interface IntrinsicElements {
      input: InputProps
      [tag: string]: HtmlProps
    }
  }
}
```

配置 `"jsxImportSource": "@actview/jsx"` 后即可获得完整 JSX 类型检查。

## 下一步

- [指南：TypeScript](/guide/typescript)：类型系统详解
- [API：响应式核心](./reactivity-core)：`Ref` / `ComputedRef` 等
