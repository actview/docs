---
description: 使用 @actview/router 进行页面路由：createRouter、RouterLink、RouterView。
---

# 路由 {#routing}

ActView 内置路由包 `@actview/router`：路由状态是响应式的，`RouterView` 渲染时读取它——路由变化自动触发组件切换，无需手动刷新。

## 安装

```bash
pnpm add @actview/router
```

## 定义路由

```ts
// src/router.ts
import { createRouter, createWebHistory } from '@actview/router'
import { HomePage } from './pages/HomePage'
import { AboutPage } from './pages/AboutPage'
import { UserPage } from './pages/UserPage'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/about', component: AboutPage },
    { path: '/user/:id', component: UserPage } // 动态段
  ]
})
```

- `createWebHistory()`：基于 History API（`pushState` + `popstate`）的浏览器历史；
- `createMemoryHistory()`：内存历史（不操作浏览器地址栏），适合测试与 SSR；
- `RouteRecord = { path, component, name? }`。

## 在入口注册路由

`createRouter` 会把实例写入模块级单例 `currentRouter`。在入口文件中副作用导入 `router.ts` 完成注册：

```tsx
// src/main.tsx
import { createApp } from 'actview'
import { App } from './App'
import './router' // 副作用导入：完成路由注册

createApp(App).mount('#app')
```

## 使用 RouterLink / RouterView

```tsx
// src/App.tsx
import { RouterLink, RouterView } from '@actview/router'

export function App() {
  return (
    <div>
      <nav>
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/about">关于</RouterLink>
        <RouterLink to="/user/42">用户 42</RouterLink>
      </nav>

      {/* 路由出口：渲染当前路径匹配的组件 */}
      <RouterView />
    </div>
  )
}
```

- `RouterLink` 渲染为 `<a href={to}>`，点击时 `preventDefault` 并调用 `router.push(to)`；`class` / `style` 等其余 props 透传到 `<a>`；
- `RouterView` 每次渲染读取 `currentRoute` 并匹配路由，把 **`path` / `params` / `query` 作为 props** 传给匹配组件：

```tsx
// src/pages/UserPage.tsx
export function UserPage(props: { params: Record<string, string> }) {
  return <p>用户 ID：{props.params.id}</p>
}
```

## 动态段 `:param`

路由路径中的 `:name` 段会捕获对应值到 `params`：

```tsx
routes: [
  { path: '/user/:id', component: UserPage }
]

// 访问 /user/42 → UserPage 收到 props.params = { id: '42' }
```

## query 参数

```tsx
// 编程式导航 + query
router.push({ path: '/list', query: { page: 2, keyword: 'actview' } })

// 页面中读取
export function ListPage(props: { query: Record<string, string> }) {
  return <p>当前页：{props.query.page}</p>
}
```

`currentRoute` 是一个 reactive 对象，包含 `path` / `query` / `params` / `fullPath`，可以在任何组件中读取（会收集响应式依赖）：

```tsx
import { currentRouter } from '@actview/router'

export function Breadcrumb() {
  // 路由变化时此组件自动更新
  return <p>当前路径：{currentRouter.currentRoute.fullPath}</p>
}
```

## 编程式导航

```tsx
import { currentRouter } from '@actview/router'

currentRouter.push('/about')          // 压入历史
currentRouter.push({ path: '/list', query: { page: 1 } })
currentRouter.replace('/about')       // 替换当前历史记录
currentRouter.back()                  // 后退
currentRouter.forward()               // 前进
currentRouter.go(-2)                  // 前进/后退 N 步
```

## 未匹配路径

没有路由匹配时，`RouterView` 渲染 `null`（空白）。可在兜底位置显示 404 内容：

```tsx
export function App() {
  return (
    <div>
      <RouterView />
      {/* RouterView 未匹配时渲染 null，其余内容照常 */}
    </div>
  )
}
```

## 导航守卫

```tsx
// 全局前置守卫：返回 false 取消导航，返回 { path } 重定向
router.beforeEach((to, from) => {
  if (to.path === '/admin' && !isLoggedIn.value) return '/login'
})

// 全局后置钩子
router.afterEach((to) => {
  document.title = `${to.path} - 我的站点`
})
```

路由级守卫用 `beforeEnter`：

```tsx
routes: [
  { path: '/admin', component: AdminPage, beforeEnter: () => isLoggedIn.value || '/login' }
]
```

## 嵌套路由

用 `children` 定义嵌套路由，父组件里放嵌套 `<RouterView />`：

```tsx
routes: [
  {
    path: '/user/:id',
    component: UserLayout,
    children: [
      { path: 'profile', component: UserProfile },
      { path: 'posts', component: UserPosts }
    ]
  }
]
```

```tsx
// UserLayout 里嵌套 RouterView，渲染 children 匹配的子组件
export function UserLayout(props: { params: Record<string, string> }) {
  return (
    <div>
      <p>用户：{props.params.id}</p>
      <RouterView />
    </div>
  )
}
```

## 懒加载

`component` 为函数时按需加载，配合 `<Suspense>` 显示 fallback：

```tsx
routes: [
  { path: '/heavy', component: () => import('./HeavyPage') }
]
```

```tsx
<Suspense fallback={<p>加载中…</p>}>
  <RouterView />
</Suspense>
```

## 重定向

```tsx
routes: [
  { path: '/old', redirect: '/new' }
]
```

## 下一步

- [服务端渲染](./ssr)：`renderToString` 生成静态 HTML
- [异步组件](../components/async)：路由组件的懒加载
