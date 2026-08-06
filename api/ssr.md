---
description: 服务端渲染 API：renderToString。
---

# 服务端渲染 {#ssr}

## renderToString()

把 VNode 树序列化为 HTML 字符串。纯函数，不依赖 DOM，可在 Node.js 中运行。

```ts
function renderToString(vnode: VNode): string
```

```tsx
import { renderToString } from 'actview'
import { App } from './App'

const html = renderToString(<App />)
// '<div class="app"><h1>Hello ActView</h1>…</div>'
```

在无 JSX 环境（`.ts`）中用 `createElement`：

```tsx
import { renderToString } from 'actview'
import { createElement } from '@actview/jsx'

const html = renderToString(createElement('div', { class: 'app' }, 'Hello'))
```

## 行为规则

| 输入 | 输出 |
| --- | --- |
| 组件（`{ __setup }` 或函数） | 执行 `setup(props)` 拿 render 并调用，递归序列化 |
| 生命周期钩子 | 可注册但**不执行**（SSR 语义） |
| 事件 props（`on*`） | 不输出 |
| `className` | 输出为 `class` |
| `style`（对象/字符串） | 序列化为内联样式 |
| 布尔属性 `true` | 空属性（`<input disabled>`） |
| `false` / `null` / `undefined` | 跳过 |
| void 元素（`img` / `br` / `input` 等） | 自闭合标签 |

## 使用场景

```tsx
// 静态站点生成：遍历路由预渲染 HTML
import { createRouter, createMemoryHistory } from '@actview/router'
import { renderToString } from 'actview'
import { App } from './App'
import { routes } from './routes'

const router = createRouter({ history: createMemoryHistory(), routes })

for (const route of routes) {
  router.push(route.path)
  const html = renderToString(<App />)
  writeFileSync(`dist/${route.path.slice(1) || 'index'}.html`, html)
}
```

::: warning 无内置水合
ActView 没有 `hydrate` API；客户端 `createApp(...).mount(...)` 会重新渲染整棵树。静态 HTML 用于 SEO / 首屏直出时注意避免闪烁。
:::

## 下一步

- [指南：SSR](/guide/scaling-up/ssr)：预渲染完整示例
- [应用实例](./application)：`createApp` 客户端挂载
