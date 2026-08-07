---
layout: home

hero:
  name: ActView
  text: 响应式前端开发框架
  tagline: 拥有类似 Vue 的响应式 API，并具备 JSX 写法的前端开发框架。
  actions:
    - theme: brand
      text: 快速上手
      link: /guide/quick-start
    - theme: alt
      text: 什么是 ActView？
      link: /guide/introduction

features:
  - icon: ⚡
    title: 响应式驱动
    details: ref / reactive / computed / watch，数据变化自动触发组件重渲染，无需手动订阅。
  - icon: 🧩
    title: 纯 JSX
    details: 相比 Vue SFC 无需记忆 v-if、v-for、v-model 等模板指令——条件、循环、事件绑定都是原生 JavaScript 表达式，类型安全、组合灵活，一条 JSX 语法走天下。
  - icon: 🪶
    title: 轻量小巧
    details: 运行时 + 响应式 + 路由分层清晰，源码易读，适合学习与二次开发。
  - icon: 🚦
    title: 内置路由
    details: createRouter / RouterLink / RouterView，路由状态本身是响应式的。
  - icon: 🧪
    title: SSR 支持
    details: renderToString 纯函数序列化，可在 Node 端生成静态 HTML。
  - icon: 🛡️
    title: 内置组件
    details: Teleport、Transition、KeepAlive、ErrorBoundary、Suspense 开箱即用。
---
