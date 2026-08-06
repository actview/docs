---
description: 从零搭建一个 ActView 应用，编写你的第一个响应式组件。
---

# 快速上手 {#quick-start}

本节将带你从零搭建一个 ActView 应用，并编写第一个响应式组件。开始之前，请确保本机已安装 [Node.js](https://nodejs.org/)（建议 20+）与 [pnpm](https://pnpm.io/)。

## 创建项目

用 Vite 创建一个全新的项目（选择 **vanilla-ts** 模板）：

```bash
pnpm create vite my-actview-app --template vanilla-ts
cd my-actview-app
```

::: tip 为什么用 Vite？
ActView 的编译插件（`actviewPlugin`）是一个 Vite 插件，负责在构建时把函数组件改写为 `defineComponent` 产物。配合 Vite 的 esbuild 自动 JSX 转换，开箱即用。
:::

## 安装依赖

```bash
pnpm add actview @actview/plugin @actview/jsx @actview/router
```

| 包 | 用途 |
| --- | --- |
| `actview` | 框架统一入口（`createApp`、`ref`、`reactive` 等） |
| `@actview/plugin` | Vite 插件：函数组件 → `defineComponent` 转换 |
| `@actview/jsx` | JSX 运行时与全局 JSX 类型 |
| `@actview/router` | 路由（可选，需要时再装） |

## 配置构建工具

### `vite.config.ts`

```ts
import { defineConfig } from 'vite'
import { actviewPlugin } from '@actview/plugin'

export default defineConfig({
  plugins: [actviewPlugin()]
})
```

### `tsconfig.json`

让 TypeScript 使用 `@actview/jsx` 作为 JSX 运行时，从而获得完整的组件与元素类型提示：

```json
{
  "compilerOptions": {
    "target": "es2023",
    "module": "esnext",
    "lib": ["ES2023", "DOM"],
    "types": ["vite/client"],
    "moduleResolution": "bundler",
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "jsxImportSource": "@actview/jsx",
    "skipLibCheck": true
  },
  "include": ["src"]
}
```

::: tip 它做了什么？
`"jsx": "react-jsx"` 让 esbuild 采用 automatic JSX transform，把 `<div>…</div>` 编译为对 `@actview/jsx` 的 `jsx()` 调用；`@actview/jsx` 的入口副作用加载全局 JSX 类型声明，因此 `IntrinsicElements`（如 `onclick`、`class`、`style` 等属性）都有类型检查。
:::

## 编写第一个应用

清空 `src/` 下的示例文件，创建以下文件：

### `index.html`

```html
<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ActView App</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

### `src/main.tsx`

```tsx
import { createApp } from 'actview'
import { App } from './App'

createApp(App).mount('#app')
```

### `src/App.tsx`

```tsx
import { ref } from 'actview'

export function App() {
  const count = ref(0)

  return (
    <div>
      <h1>你好，ActView</h1>
      <p>计数：{count.value}</p>
      <button onclick={() => count.value++}>+1</button>
    </div>
  )
}
```

现在运行：

```bash
pnpm dev
```

打开浏览器，点击 `+1` 按钮——计数会立即更新。这就是 ActView 的核心链路：`count.value++` → 响应式触发 → 组件 effect 重跑 `render + patch` → DOM 精确更新。

::: warning 注意 `.value`
在 JSX 中读取 `ref` 的值必须显式写 `count.value`——没有模板自动解包。
:::

## 组件与 Props

ActView 中组件就是返回 JSX 的函数。用 `defineComponent` 显式声明组件，并通过函数参数接收 props：

```tsx
// src/Greeting.tsx
import { defineComponent } from 'actview'

export const Greeting = defineComponent((props: { name: string }) => {
  return () => <p>你好，{props.name}！</p>
})
```

在 `App.tsx` 中使用它：

```tsx
import { ref } from 'actview'
import { Greeting } from './Greeting'

export function App() {
  const name = ref('ActView')

  return (
    <div>
      <Greeting name={name.value} />
      <input value={name.value} oninput={(e) => (name.value = e.target.value)} />
    </div>
  )
}
```

> 关于 props 的更新机制、事件与插槽，详见 [组件基础](./components/component-basics)。

## 条件渲染与列表渲染

没有 `v-if` / `v-for`，直接使用 JSX 表达式：

```tsx
import { ref, reactive } from 'actview'

export function TodoList() {
  const todos = reactive([
    { id: 1, text: '学习 ActView', done: false },
    { id: 2, text: '写文档', done: true }
  ])
  const showDone = ref(true)

  return (
    <div>
      {showDone.value && <p>共 {todos.length} 项</p>}
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} class={todo.done ? 'done' : ''}>
            <input
              type="checkbox"
              checked={todo.done}
              onchange={(e) => (todo.done = e.target.checked)}
            />
            {todo.text}
          </li>
        ))}
      </ul>
      <button onclick={() => (showDone.value = !showDone.value)}>
        显示/隐藏统计
      </button>
    </div>
  )
}
```

::: tip 列表必须带 `key`
`map` 渲染列表时为每个元素提供 `key`，diff 才能最小化移动与复用 DOM 节点。详见 [列表渲染](./essentials/list)。
:::

## 添加路由（可选）

```tsx
// src/router.ts
import { createRouter, createWebHistory } from '@actview/router'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/about', component: AboutPage }
  ]
})
```

在根组件中使用 `RouterLink` 与 `RouterView`：

```tsx
import { RouterLink, RouterView } from '@actview/router'

export function App() {
  return (
    <div>
      <nav>
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/about">关于</RouterLink>
      </nav>
      <RouterView />
    </div>
  )
}
```

::: tip 注意
`router.ts` 需要在入口文件中被副作用导入（`import './router'`），这样 `createRouter` 才会把单例注册到 `currentRouter`，`RouterView` 才能读取到它。详见 [路由](./scaling-up/routing)。
:::

## 下一步

- [响应式基础](./essentials/reactivity)：深入理解 `ref` / `reactive` / `computed` / `watch`
- [组件基础](./components/component-basics)：Props、事件、插槽与异步组件
- [内置组件](./built-ins/teleport)：Teleport、Transition、KeepAlive、ErrorBoundary、Suspense
- [API 参考](/api/reactivity-core)：完整的 API 速查
