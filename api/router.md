---
description: 路由 API：createRouter、createWebHistory、RouterLink、RouterView。
---

# 路由 {#router}

## createRouter()

创建路由实例。`currentRoute` 是响应式状态，路由变化自动驱动组件切换。

```ts
function createRouter(options: RouterOptions): Router

interface RouterOptions {
  history: RouterHistory
  routes: RouteRecord[]
}

interface RouteRecord {
  path: string
  component: any
  name?: string
}
```

```tsx
import { createRouter, createWebHistory } from '@actview/router'
import { HomePage } from './pages/HomePage'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/user/:id', component: UserPage }
  ]
})
```

`createRouter` 会写入模块级单例 `currentRouter`（`RouterView` / `RouterLink` 依赖它），入口文件需副作用导入路由模块。

## createWebHistory()

基于 History API（`pushState` + `popstate`）的浏览器历史。

```ts
function createWebHistory(base = ''): RouterHistory
```

## createMemoryHistory()

内存历史：不操作浏览器地址栏，适合测试与 SSR 预渲染。

```ts
function createMemoryHistory(initial = '/'): RouterHistory
```

```tsx
import { createRouter, createMemoryHistory } from '@actview/router'

const router = createRouter({
  history: createMemoryHistory('/'),
  routes
})
```

## Router

```ts
interface Router {
  currentRoute: RouteLocation
  push(to: string | RouteLocationRaw): void
  replace(to: string | RouteLocationRaw): void
  back(): void
  forward(): void
  go(delta: number): void
  resolve(to: string | RouteLocationRaw): { fullPath: string }
  match(path: string): MatchedRoute | null
}

interface RouteLocation {
  path: string
  query: Record<string, string>
  params: Record<string, string>
  fullPath: string
}

interface RouteLocationRaw {
  path?: string
  query?: Record<string, string | number | boolean>
}

interface MatchedRoute {
  record: RouteRecord
  path: string
  params: Record<string, string>
}
```

```tsx
import { currentRouter } from '@actview/router'

currentRouter.push('/about')
currentRouter.push({ path: '/list', query: { page: 2 } })
currentRouter.replace('/about')
currentRouter.back()
currentRouter.go(-1)

// 读取当前路由（响应式）
console.log(currentRouter.currentRoute.fullPath)
```

## RouterLink

渲染为 `<a>`，点击时拦截默认跳转并调用 `router.push(to)`；其余 props 透传到 `<a>`。

```tsx
<RouterLink to="/about" class="nav-link">关于</RouterLink>
```

## RouterView

路由出口：每次渲染读取 `currentRoute` 并匹配路由，把 `path` / `params` / `query` 作为 props 传给匹配组件；未匹配时渲染 `null`。

```tsx
<RouterView />
```

```tsx
// 页面组件接收路由数据
export function UserPage(props: { params: Record<string, string> }) {
  return <p>用户：{props.params.id}</p>
}
```

## 下一步

- [指南：路由](/guide/scaling-up/routing)：完整路由示例与限制
- [指南：SSR](/guide/scaling-up/ssr)：`createMemoryHistory` 预渲染
