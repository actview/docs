# ActView 官方文档

[ActView](https://github.com/ALiuYiLin/JSX-Demo) 框架的官方文档站点，参考 [vue3 docs](https://vuejs.org) 的结构与风格编写，使用 **ActPress**（`@actview/press`）构建。

## 技术栈

- **站点生成器**：ActPress（`@actview/press`，本地 `file:` 引用 `C:\code\vitepress`）
- **框架**：ActView（`actview` / `@actview/core` / `@actview/jsx` / `@actview/router` / `@actview/plugin`）
- **包管理**：pnpm

## 快速开始

```bash
pnpm install
pnpm dev      # 本地开发（http://localhost:5173）
pnpm build    # 静态站点构建，输出到 .vitepress/dist
pnpm preview  # 预览构建产物
```

## 文档结构

```
index.md                     首页（hero）
.vitepress/config.ts         站点配置（导航、侧边栏）
guide/                       指南
├─ introduction.md           什么是 ActView
├─ quick-start.md            快速上手
├─ essentials/               基础（响应式/计算属性/条件/列表/事件/表单/类样式/生命周期）
├─ components/               组件（基础/Props/事件/插槽/异步组件）
├─ built-ins/                内置组件（Teleport/Transition/KeepAlive/ErrorBoundary/Suspense）
├─ scaling-up/               规模化（路由/SSR）
├─ typescript.md             TypeScript
└─ in-depth/                 深入（渲染机制/响应式原理/渲染函数）
api/                         API 参考（响应式/应用/组合式/内置组件/渲染函数/SSR/路由/类型）
public/                      静态资源
plan.md                      实施计划（不作为站点页面）
```

## 内容来源

所有 API 名称、签名与行为均以 [JSX-Demo](https://github.com/ALiuYiLin/JSX-Demo)（ActView 框架源码）为准。修改文档时请与 `packages/*` 源码核对。

## 链接检查

```bash
node .vitepress/check-links.mjs
```

构建（`pnpm build`）默认开启死链检查（`ignoreDeadLinks` 未开启），引入新页面时请同步更新侧边栏与相关链接。
