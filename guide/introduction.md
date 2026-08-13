---
description: 认识 ActView —— 一个轻量级、响应式驱动的 JSX 前端框架。
---

# 什么是 ActView？ {#what-is-actview}

ActView 是一个**轻量级、响应式驱动的 JSX 前端框架**。

它的名字由两个生态交汇而来：

- **Act** —— 取自 **React** 的后三个字母。ActView 继承了 React 的 JSX 写法：灵活自由，不需要记忆 `v-if`、`v-for`、`v-model` 等大量模板指令，条件、循环、事件绑定都可以直接用**原生 JavaScript 表达式**完成；
- **View** —— 与 **Vue** 的发音相近。ActView 继承了 Vue 的响应式系统：`ref` / `reactive` / `computed` / `watch` 等，数据变化自动驱动视图更新；相比 React 的 `useEffect` 等 API，更容易理解，简单、直观。


下面是一个最基本的示例：

```tsx
import { ref, createApp } from 'actview'
function App() {
  const count = ref(0)
  return (
    <button onclick={() => count.value++}>
      {count.value}
    </button>
  )
}
createApp(App).mount("#app")

```

结果展示：

<script lang="tsx">
import { ref } from 'actview'
function Counter() {
  const count = ref(0)
  return (
    <button class="counter-btn" onclick={() => count.value++}>
      {count.value}
    </button>
  )
}
</script>

<Counter />

<style>
.counter-btn {
  padding: 8px 20px;
  font-size: 18px;
  border: none;
  border-radius: 8px;
  background: #42b883;
  color: #fff;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(66, 184, 131, 0.4);
  min-width: 65px;
}
.counter-btn:hover {
  background: #33a06f;
}
</style>

上面的示例展示了 ActView 的两个核心功能：

- **JSX 声明式渲染**：ActView 使用 JSX 来描述 UI 与状态之间的关系——没有模板语法、没有 `{{ }}` 插值，条件、循环、事件绑定都是**原生 JavaScript 表达式**，灵活且类型安全；
- **响应性**：ActView 的 `ref` / `reactive` / `computed` / `watch` 等 API 会自动跟踪 JavaScript 状态，并在其发生变化时响应式地更新 DOM。

## 核心特性

### ⚡ 响应式系统

基于 Proxy 的依赖收集与触发（`track` / `trigger`），提供：

- `ref` / `reactive` / `shallowReactive` / `readonly` / `markRaw`
- `computed`（惰性求值 + 脏标记缓存）
- `watch` / `watchEffect`（微任务批量触发，返回停止函数）
- `EffectScope` 作用域管理，组件卸载时自动清理所有 effect

### 🧩 JSX 组件模型

ActView 使用 JSX 作为组件 UI 描述方式，无需额外学习模板语法或大量指令（如 v-if、v-for、v-model 等）。条件判断、列表渲染、事件绑定均基于原生 JavaScript 表达式完成，在保持灵活组合能力的同时，获得完整的 TypeScript 类型支持。

不同于传统直接返回 JSX 的函数组件，ActView 在构建阶段通过 Babel 插件 @actview/plugin 对组件进行编译转换，将组件逻辑自动拆分为 setup 与 render 两个阶段：

setup 阶段：负责初始化组件状态、创建响应式数据，仅在组件挂载时执行一次；
render 阶段：负责根据当前状态生成 UI 描述，在组件首次渲染及响应式依赖变化时重新执行。

基于这种编译时组件拆分机制，ActView 实现了组件级响应式更新模型：当组件内部状态发生变化时，仅触发当前组件的 render 执行，并通过 Virtual DOM diff 更新对应 DOM 节点，而无需重新执行父组件或整棵组件树的渲染流程，从而实现更精细、高效的更新粒度。

```tsx
// 你写的源码（普通 JSX 函数组件）
function App() {
  const count = ref(0)
  return (
    <button onclick={() => count.value++}>
      {count.value}
    </button>
  )
}

// 构建后的产物（示意）：函数体被拆成 setup + render 两部分
const App = defineComponent(function () {
  const count = ref(0) // setup：组件挂载时只执行一次

  return () => (       // render：挂载时与依赖更新时都会执行，生成 UI 描述
    <button onclick={() => count.value++}>
      {count.value}
    </button>
  )
})
```

转换后，组件被拆成两个阶段：

- **setup**：整个生命周期中**只执行一次**——创建响应式状态、注册生命周期钩子、创建侦听器；
- **render**：**挂载时和每次依赖更新时都会执行**——读取数据、产出 VNode，与旧树做 diff。

这正是 ActView 与普通 JSX 写法的核心区别：你写的还是同一个函数，但**构建期的代码转换**赋予了它「setup 只跑一次、挂载与依赖更新只重跑渲染函数」的组件语义。


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


## 现在开始

准备好动手了吗？直接跳到 [快速上手](./quick-start)，开始构建你的第一个 ActView 应用。
