---
description: 认识 ActView —— 一个轻量级、响应式驱动的 JSX 前端框架。
---

# 什么是 ActView？ {#what-is-actview}

ActView 是一个**轻量级、响应式驱动的 JSX 前端框架**。它把 Vue 风格的响应式系统（`ref` / `reactive` / `computed` / `watch`）与 React 风格的 JSX 组件模型结合起来：

- 没有模板编译器、没有 `{{ }}` 插值、没有 `v-*` 指令；
- 组件就是返回 JSX 的函数，配合 `defineComponent` 获得 **setup + render** 的二分结构；
- 数据变化时，组件内部由响应式 effect 自动驱动「重新渲染 + 虚拟 DOM diff」，无需任何手动订阅。

> 一句话概括核心设计：**组件 = 响应式 effect 包裹的一个 `render()` 函数**。
> `render()` 负责把响应式数据读出来生成 VNode，effect 负责在数据变化时自动重跑 `render + patch`。响应式系统管「何时重跑」，diff 管「怎么最小化更新 DOM」。

## 核心特性

### ⚡ 响应式系统

基于 Proxy 的依赖收集与触发（`track` / `trigger`），提供：

- `ref` / `reactive` / `shallowReactive` / `readonly` / `markRaw`
- `computed`（惰性求值 + 脏标记缓存）
- `watch` / `watchEffect`（微任务批量触发，返回停止函数）
- `EffectScope` 作用域管理，组件卸载时自动清理所有 effect

### 🧩 纯 JSX 组件模型

组件用普通函数书写，`actview` 的编译插件（基于 Babel）会在构建时把函数组件改写为 `defineComponent` 产物：

```tsx
// 你写的源码
function App() {
  return <div>hello</div>
}

// 构建后的产物（示意）
const App = defineComponent(function () {
  return () => <div>hello</div>
})
```

`setup` 在整个生命周期中**只执行一次**并返回 render 函数；render 每次渲染读取响应式数据、产出 VNode，与旧 VNode 树做 diff（支持 `key` 的最小移动复用）。

### 🪶 轻量小巧

运行时（`@actview/core`）+ JSX 层（`@actview/jsx`）+ 路由（`@actview/router`）分层清晰，源码易读，非常适合学习「响应式系统 + 虚拟 DOM + 组件化」三者如何协作，也适合作为轻量单页应用的运行时。

### 🛡️ 内置组件

开箱即用：

| 组件 | 作用 |
| --- | --- |
| `Teleport` | 将内容渲染到指定 DOM 节点 |
| `Transition` | 单个节点进入/离开过渡 |
| `KeepAlive` | 组件实例与 DOM 缓存 |
| `ErrorBoundary` | 捕获子树渲染错误并展示 fallback |
| `Suspense` | 配合 `lazy()` 等待异步组件 |
| `lazy()` | 异步加载组件 |

### 🧪 SSR 支持

`renderToString(vnode)` 是纯函数序列化，不依赖 DOM，可在 Node 端直接生成静态 HTML。

### 🚦 内置路由

`@actview/router` 提供 `createRouter` / `createWebHistory` / `createMemoryHistory` / `RouterLink` / `RouterView`。路由状态 `currentRoute` 本身是响应式的——路由变化自动触发组件切换。

## 没有的东西（设计取舍）

ActView 刻意**没有**以下 Vue 特性，遇到时请改用 JSX 等价写法：

| Vue 特性 | ActView 中的替代 |
| --- | --- |
| `{{ expr }}` 插值 | JSX 表达式 `{expr}` |
| `v-if` / `v-for` | `&&` / 三元表达式 / `Array.map` + `key` |
| `v-model` | `value` + `oninput` 手动绑定 |
| `v-bind` / `v-on` | 普通 JSX 属性 / `onclick` 等事件 |
| 模板 refs（`ref="x"`） | 直接操作 `el` / 事件回调 |
| `provide` / `inject` | 暂无内置实现，可用模块级共享状态 |
| 自定义指令 | 无（不需要，直接用 JSX 属性） |

## 包结构

| 包 | 说明 |
| --- | --- |
| `actview` | 框架统一入口，聚合转发 `@actview/core` 的全部 API |
| `@actview/core` | 运行时：响应式系统、组件模型、渲染器、内置组件、SSR |
| `@actview/jsx` | JSX 运行时与全局类型（`jsx` / `jsxs` / `createElement` / `Fragment`） |
| `@actview/router` | 响应式路由 |
| `@actview/plugin` | 编译期插件（`actviewPlugin` vite 插件 / `defineComponentPlugin` Babel 插件） |
| `@actview/create-cli` | 脚手架工具：一条命令创建 TypeScript + Vite + ActView 项目 |

## 现在开始

准备好动手了吗？直接跳到 [快速上手](./quick-start)，开始构建你的第一个 ActView 应用。
