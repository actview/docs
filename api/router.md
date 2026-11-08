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
  component?: any                       // 组件 或 () => import() 懒加载
  name?: string
  redirect?: string | { path: string }  // 重定向
  meta?: Record<string, any>            // 路由元信息
  beforeEnter?: NavigationGuard         // 路由级守卫
  children?: RouteRecord[]              // 嵌套路由
}
```

```tsx
import { createRouter, createWebHistory } from '@actview/router'
import { HomePage } from './pages/HomePage'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    {
      path: '/user/:id',
      component: UserLayout,
      children: [
        { path: 'profile', component: UserProfile },
        { path: 'posts', component: UserPosts }
      ]
    },
    { path: '/old', redirect: '/new' }
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
  match(path: string): MatchedRoute[] | null
  beforeEach(guard: NavigationGuard): () => void   // 全局前置守卫，返回取消函数
  afterEach(hook: (to, from) => void): () => void   // 全局后置钩子
}

interface RouteLocation {
  path: string
  query: Record<string, string>
  params: Record<string, string>
  fullPath: string
  matched: MatchedRoute[]     // 根到叶子的匹配链（嵌套路由）
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

type NavigationGuard = (to, from) =>
  void | boolean | string | { path: string } | Promise<any>
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

## 导航守卫

```tsx
// 全局前置守卫：返回 false 取消导航，返回 { path } 重定向
router.beforeEach((to, from) => {
  if (to.path === '/admin' && !isLoggedIn) return '/login'
})

// 全局后置钩子
router.afterEach((to) => {
  document.title = `${to.path} - 我的站点`
})

// 路由级守卫
routes: [
  { path: '/admin', component: AdminPage, beforeEnter: () => isLoggedIn || '/login' }
]
```

守卫返回 `false` 取消、`string`/`{ path }` 重定向、Promise 异步。

## 嵌套路由

`RouteRecord.children` 定义嵌套路由，子组件里放嵌套 `<RouterView />` 渲染下一层匹配：

```tsx
// UserLayout 里嵌套 RouterView
export function UserLayout(props: { params: Record<string, string> }) {
  return (
    <div>
      <p>用户：{props.params.id}</p>
      <RouterView /> {/* 渲染 children 里匹配的子组件 */}
    </div>
  )
}
```

## 懒加载

`component` 为函数时按需加载（配合 `<Suspense>` 显示 fallback）：

```tsx
routes: [
  { path: '/heavy', component: () => import('./HeavyPage') }
]

// 用 Suspense 包裹 RouterView
<Suspense fallback={<p>加载中…</p>}>
  <RouterView />
</Suspense>
```

## 下一步

- [指南：路由](/guide/scaling-up/routing)：完整路由示例与限制
- [指南：SSR](/guide/scaling-up/ssr)：`createMemoryHistory` 预渲染
