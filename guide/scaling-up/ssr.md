---
description: 服务端渲染：renderToString 生成静态 HTML。
---

# 服务端渲染 {#ssr}

ActView 提供 `renderToString(vnode)`：把 VNode 树序列化为 HTML 字符串。它是**纯函数**，不依赖 DOM，可以在 Node.js 环境中直接运行——用于静态站点生成或服务端预渲染。

## 基本用法

```tsx
import { renderToString } from 'actview'
import { App } from './App'

const html = renderToString(<App />)
// "<div class="app"><h1>Hello ActView</h1>…</div>"
```

在 Node 中（无 JSX 的 .ts 环境）可以用 `createElement` 或 `jsx`：

```tsx
import { renderToString } from 'actview'
import { createElement } from '@actview/jsx'

const html = renderToString(createElement('div', { class: 'app' }, 'Hello'))
```

## 序列化规则

- **组件**：执行 `setup(props)` 拿到 render 并调用（构建期静态渲染）；生命周期钩子（`onMounted` 等）可注册但**不会执行**（与 Vue SSR 语义一致）；
- **事件 props（`on*`）**：不输出；
- **`className`**：输出为 `class`；
- **`style`**：对象/字符串序列化为内联样式；
- **布尔属性**：`true` 输出空属性（如 `<input disabled>`），`false` / `null` / `undefined` 跳过；
- **void 元素**（`img` / `br` / `input` 等）：输出自闭合标签。

## 响应式与 SSR 的关系

`renderToString` 是**一次性快照**：它输出组件在调用时刻的状态，不含交互逻辑（事件不输出）。服务端/静态生成的 HTML 到浏览器后由客户端 `createApp(...).mount(...)` 接管交互（水合，hydrate）。

```tsx
// 服务端（Node）：输出静态 HTML
const html = renderToString(<App />)

// 客户端（浏览器）：接管交互
createApp(App).mount('#app')
```

::: warning 没有内置水合机制
ActView 目前没有 `hydrate` API——客户端挂载会重新渲染整个树。静态生成的 HTML 用于 SEO / 首屏直出时，注意避免客户端重建造成内容闪烁（可先隐藏容器再挂载）。
:::

## 使用场景

- **静态站点生成**：在构建脚本中把每个路由渲染为 HTML 文件（配合 `@actview/router` 的 `createMemoryHistory` 预渲染路由页面）；
- **服务端响应**：Express / Hono 等 Node 服务中直接返回 `renderToString` 结果；
- **测试**：无 DOM 环境下断言组件输出。

```tsx
// 预渲染示例：遍历路由生成 HTML 文件
import { createRouter, createMemoryHistory } from '@actview/router'
import { renderToString } from 'actview'
import { routes } from './routes'

const router = createRouter({
  history: createMemoryHistory(),
  routes
})

for (const route of routes) {
  router.push(route.path)
  const html = renderToString(<App />)
  writeFileSync(`dist/${route.path.slice(1) || 'index'}.html`, html)
}
```

## 下一步

- [路由](./routing)：`createMemoryHistory` 与预渲染
- [渲染机制](../in-depth/rendering-mechanism)：VNode 与渲染管线
