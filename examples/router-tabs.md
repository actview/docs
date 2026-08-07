---
description: 路由标签页示例：createRouter + RouterLink + RouterView。
---

# 路由标签页 {#router-tabs}

用 `@actview/router` 做一个多标签页应用：点击导航切换页面组件，路由状态是响应式的。

## 在线体验

真实运行的组件——使用 `createRouter` + `createMemoryHistory`（内存历史）在页面内演示路由切换：

<script lang="tsx">
import { createRouter, createMemoryHistory, RouterLink, RouterView } from '@actview/router'
import { defineComponent } from 'actview'

const HomeDemo = defineComponent(function () {
  return () => <div>🏠 首页：欢迎使用 ActView 路由！</div>
})
const ProfileDemo = defineComponent(function () {
  return () => <div>👤 个人资料页</div>
})
const SettingsDemo = defineComponent(function () {
  return () => <div>⚙️ 设置页</div>
})

createRouter({
  history: createMemoryHistory('/'),
  routes: [
    { path: '/', component: HomeDemo },
    { path: '/profile', component: ProfileDemo },
    { path: '/settings', component: SettingsDemo }
  ]
})

const tabs = [
  { path: '/', label: '首页' },
  { path: '/profile', label: '个人资料' },
  { path: '/settings', label: '设置' }
]

export function RouterDemo() {
  return (
    <div
      style={{
        fontFamily: 'system-ui, sans-serif',
        padding: '16px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        background: '#f8fafc'
      }}
    >
      <nav>
        {tabs.map((tab) => (
          <RouterLink
            key={tab.path}
            to={tab.path}
            style={{ marginRight: '12px', textDecoration: 'none' }}
          >
            {tab.label}
          </RouterLink>
        ))}
      </nav>
      <main style={{ marginTop: '12px' }}>
        <RouterView />
      </main>
    </div>
  )
}
</script>

<RouterDemo />

## 完整代码

::: code-group

```tsx [src/router.ts]
import { createRouter, createWebHistory } from '@actview/router'
import { HomePage } from './pages/HomePage'
import { ProfilePage } from './pages/ProfilePage'
import { SettingsPage } from './pages/SettingsPage'

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: HomePage },
    { path: '/profile', component: ProfilePage },
    { path: '/settings', component: SettingsPage }
  ]
})
```

```tsx [src/App.tsx]
import { RouterLink, RouterView } from '@actview/router'
import './router' // 副作用导入：注册 currentRouter 单例

const tabs = [
  { path: '/', label: '首页' },
  { path: '/profile', label: '个人资料' },
  { path: '/settings', label: '设置' }
]

export function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '480px' }}>
      <h1>路由标签页</h1>

      <nav>
        {tabs.map((tab) => (
          <RouterLink
            key={tab.path}
            to={tab.path}
            style={{ marginRight: '8px', textDecoration: 'none' }}
          >
            {tab.label}
          </RouterLink>
        ))}
      </nav>

      <main style={{ marginTop: '16px' }}>
        <RouterView />
      </main>
    </div>
  )
}
```

```tsx [src/pages/HomePage.tsx]
export function HomePage() {
  return <div>🏠 首页：欢迎使用 ActView 路由！</div>
}
```

```tsx [src/pages/ProfilePage.tsx]
export function ProfilePage() {
  return <div>👤 个人资料页</div>
}
```

```tsx [src/pages/SettingsPage.tsx]
export function SettingsPage() {
  return <div>⚙️ 设置页</div>
}
```

```tsx [src/main.tsx]
import { createApp } from 'actview'
import { App } from './App'

createApp(App).mount('#app')
```

:::

## 要点

- `createRouter` 把实例写入 `currentRouter` 单例，`RouterLink` / `RouterView` 依赖它——所以 `router.ts` 必须在入口被副作用导入；
- `RouterView` 每次渲染读取 `currentRoute`（响应式）并匹配路由，切换组件走 patch replace；
- 路由组件会收到 `path` / `params` / `query` 三个 props，可读取当前路由信息。

## 相关文档

- [路由](../guide/scaling-up/routing)：完整路由指南
- [API：路由](../api/router)：createRouter / RouterLink / RouterView
