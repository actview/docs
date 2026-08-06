---
layout: home

hero:
  name: ActView
  text: 轻量级响应式 JSX 框架
  tagline: 基于 Proxy 信号响应式系统与虚拟 DOM diff，让函数组件自动更新。没有模板编译器，没有 v-* 指令，只有 TypeScript 与 JSX。
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
    details: 组件就是返回 JSX 的函数，配合 defineComponent 获得 Vue 风格 setup + render 结构。
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
