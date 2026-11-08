---
description: ActView 组件模型：函数组件、setup 与 render、组件复用。
---

# 组件基础 {#component-basics}

ActView 中，**组件就是返回 JSX 的函数**。组件允许你把 UI 拆分为独立、可复用的部分，并各自管理自己的响应式状态。

## 定义一个组件

最简单的组件就是一个返回 JSX 的函数：

```tsx
// src/HelloButton.tsx
import { ref } from 'actview'

export function HelloButton() {
  const count = ref(0)

  return (
    <button onclick={() => count.value++}>
      点击了 {count.value} 次
    </button>
  )
}
```

`actviewPlugin`（Vite 插件，基于 Babel）会在构建时把这样的函数组件自动改写为 `defineComponent` 产物，获得 **setup + render** 的二分结构：

```tsx
// 你写的源码
export function HelloButton() {
  const count = ref(0)
  return <button onclick={() => count.value++}>{count.value}</button>
}

// 构建后的产物（示意）
export const HelloButton = defineComponent(function () {
  const count = ref(0)
  return () => <button onclick={() => count.value++}>{count.value}</button>
})
```

要点：

- **函数体 = setup**：只在组件首次挂载时执行一次，用来创建响应式状态、注册生命周期钩子；
- **返回值 = render**：被自动包成 render 函数，每次渲染执行，读取响应式数据并产出 VNode。

## 使用组件

组件在 JSX 中按名称使用（PascalCase）：

```tsx
// src/App.tsx
import { HelloButton } from './HelloButton'

export function App() {
  return (
    <div>
      <h1>我的应用</h1>
      <HelloButton />
      <HelloButton />
    </div>
  )
}
```

同一个组件可以多次使用，每次使用都是**独立的实例**：各自的 `count` 状态互不影响。

::: tip 为什么要求 PascalCase
Babel 插件只转换「首字母大写」的函数组件；`<hello-button>` / 小写标签会被当作原生元素处理。如果需要在 JSX 中直接使用一个未转换的组件对象，可显式 `defineComponent`：

```tsx
import { defineComponent } from 'actview'

export const MyButton = defineComponent((props: { label: string }) => {
  return () => <button>{props.label}</button>
})
```
:::

## 组件复用

组件被渲染在多个位置时，各自拥有独立的响应式状态与 DOM：

```tsx
export function App() {
  return (
    <div>
      <HelloButton /> {/* 实例 A：独立 count */}
      <HelloButton /> {/* 实例 B：独立 count */}
    </div>
  )
}
```

只有当组件被**移除后重新插入**（例如 `v-if` 切换、列表项被删除再添加）时，才会创建新实例——此时 `setup` 会重新执行、状态会重置。

## 组件与响应式

组件的更新链路：组件内部或父组件修改响应式数据 → 触发组件 effect → 重新执行 render → 与旧 VNode 树 diff → 最小化更新 DOM。

```tsx
import { reactive } from 'actview'

export function Timer() {
  const state = reactive({ seconds: 0 })
  let timer: number | undefined

  // 首次挂载后开始计时（生命周期钩子只能写在 setup 中）
  // 见「生命周期」一章
  // onMounted(() => { timer = setInterval(() => state.seconds++, 1000) })
  // onUnmounted(() => clearInterval(timer))

  return <p>已运行 {state.seconds} 秒</p>
}
```

## 透传 props（显式 `{...props}`）

组件收到的 props **全量**进入 `setup`（`key` / `ref` 除外，`children` 在 `props.children`）。框架**不自动透传**——要把 `class` / `style` 等落到根元素，用 JSX 展开 `{...props}`：

```tsx
// src/HelloButton.tsx
export function HelloButton(props: any) {
  return <button {...props}>点我</button>
}
```

```tsx
<HelloButton class="big-button" style={{ marginTop: '8px' }} />
```

规则：

- **不显式 `{...props}`，class/style 不落到根元素**（这是刻意设计：落点是用户显式行为）；
- class 拼接需要手动处理：

```tsx
export function Btn({ class: cls, ...rest }: any) {
  return <button class={['btn', cls].filter(Boolean).join(' ')} {...rest}>点我</button>
}
```

- `key` / `ref` 是特殊属性，不进 `props`（`ref` 走模板引用回调）。

> 之前（旧版本）有「Attribute Fallthrough 自动透传」，现已移除——对齐 React 的显式透传语义，数据流更清晰、条件渲染/Fragment 多根不再有「根元素识别」问题。

## 下一步

- [Props](./props)：向组件传参
- [组件事件](./events)：子组件如何通知父组件
- [内容与插槽](./slots)：`children` 与具名插槽
- [异步组件](./async)：`lazy` + `Suspense` 懒加载
