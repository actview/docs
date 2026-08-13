---
description: TypeScript 支持：JSX 类型、组件 props 类型、内置类型工具。
---

# TypeScript {#typescript}

ActView 使用 TypeScript 编写，类型支持开箱即用：JSX 有完整的元素与事件类型，组件 props 从 `setup` 参数自动推导。

## JSX 类型

`@actview/jsx` 的入口副作用加载全局 `JSX` 命名空间声明（`IntrinsicElements` 等）。只要 `tsconfig.json` 配置了 `jsxImportSource`，编辑器就会为 JSX 提供类型检查：

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@actview/jsx"
  }
}
```

- 原生元素：**全量 HTML 标签**（约 110 个）属性有完整提示（`class`、`style`、`onclick`、`value`……）；
- **SVG 元素**（`svg`/`path`/`circle`/`g` 等约 50 个）有专属属性类型（`viewBox`/`fill`/`cx`/`d`……）；
- **ARIA 属性**：所有 `aria-*` 自动允许（模板索引签名）；
- **自定义属性**：用 `data-*`（如 `data-testid`）；任意属性会类型报错；
- 事件处理器参数是原生事件类型（`MouseEvent` / `KeyboardEvent` / `FormEvent`），无需手动标注。

## 组件 props 类型

### 函数组件（Babel 转换）

直接给参数标注类型：

```tsx
// src/Button.tsx
export function Button(props: { label: string; disabled?: boolean }) {
  return <button disabled={props.disabled}>{props.label}</button>
}
```

### defineComponent

```tsx
import { defineComponent } from 'actview'

export const Greeting = defineComponent((props: { name: string }) => {
  return () => <p>你好，{props.name}！</p>
})
```

使用组件时，props 类型自动检查：

```tsx
<Greeting name="ActView" />       // ✅
<Greeting />                      // ❌ 缺少 name
<Greeting name={42} />            // ❌ 类型错误
```

## 内置类型工具

`@actview/jsx` 导出的类型（`import type { … } from '@actview/jsx'`）：

| 类型 | 说明 |
| --- | --- |
| `VNode` | VNode 描述对象（`type` / `key` / `props` / `el`） |
| `VNodeTypes` | `string \| symbol \| ((props) => any)` |
| `VNodeChild` / `VNodeChildren` | children 允许的值 |
| `ComponentType<P>` | 组件类型（`{ __setup }` + call signature） |
| `PropsOf<T>` | 从组件类型推导 props（取 `__setup` 第一参数） |
| `FormEvent` | 表单事件（`target` 带 `value` / `checked`） |
| `HTMLAttributes` | 通用 HTML 元素属性（含 ARIA / 全部事件 / `data-*`） |
| `SVGAttributes` | SVG 元素属性（`viewBox` / `fill` / `stroke` / `d`……） |
| `DOMAttributes` | 全部 DOM 事件处理器 |
| `AnchorHTMLAttributes` / `InputHTMLAttributes` / … | 各元素专属属性 |

### 组件 props 严格化

组件 props 检查是 `P & HTMLAttributes`：声明类型必填，额外仅允许 HTML 属性（`class`/`style`/`on*`/`data-*`/`aria-*`），任意自定义 prop 报错：

```tsx
<Greeting name="x" class="btn" onClick={...} />  // ✅
<Greeting name="x" foo="bar" />                   // ❌ foo 未声明，且不是 HTML 属性
```

### PropsOf 示例

```tsx
import type { PropsOf, ComponentType } from '@actview/jsx'

// 从组件推导 props 类型
type GreetingProps = PropsOf<typeof Greeting>
//   → { name: string }

// 声明「接收任意 ActView 组件」的参数
function renderWidget(Comp: ComponentType, props: PropsOf<typeof Comp>) {
  return createElement(Comp, props)
}
```

## 表单事件类型

`e.target` 默认是 `EventTarget`，没有 `value` / `checked`。用 `FormEvent` 标注即可获得完整类型：

```tsx
import { ref } from 'actview'
import type { FormEvent } from '@actview/jsx'

const text = ref('')

<input
  value={text.value}
  oninput={(e: FormEvent<HTMLInputElement>) => {
    text.value = e.target.value // ✅ 有类型提示
  }}
/>
```

## 样式对象类型

`style` 接受 `string | Record<string, string | number>`：

```tsx
const style = { fontSize: '14px', lineHeight: 1.6 } // ✅ 字面量类型推断正常
<div style={style}>文本</div>
```

CSS 变量需要断言：

```tsx
<div style={{ '--main-color': '#3ecf8e' } as Record<string, string>}>文本</div>
```

## tsconfig 推荐配置

```json
{
  "compilerOptions": {
    "target": "es2023",
    "module": "esnext",
    "moduleResolution": "bundler",
    "lib": ["ES2023", "DOM"],
    "types": ["vite/client"],
    "strict": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "jsxImportSource": "@actview/jsx",
    "verbatimModuleSyntax": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

## 下一步

- [快速上手](./quick-start)：完整工程配置
- [组件基础](./components/component-basics)：组件与 props
