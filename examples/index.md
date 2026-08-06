---
description: ActView 示例集合：从计数器到路由标签页，全部可直接拷贝运行。
---

# 示例 {#examples}

下面是一组完整的 ActView 示例，覆盖响应式、组件、插槽、异步加载与路由等核心能力。每个示例都包含完整的 `App.tsx` / `main.tsx` 代码，可拷贝到 [快速上手](../guide/quick-start) 创建的项目中直接运行。

## 基础

| 示例 | 说明 |
| --- | --- |
| [计数器](./counter) | `ref` + 事件处理：加/减/重置 |
| [温度转换](./temperature-converter) | `computed`：摄氏与华氏双向换算 |
| [待办清单](./todo-list) | `reactive` 数组 + keyed 列表 + 增删改 |
| [搜索过滤](./search-filter) | `computed` 过滤 + 受控输入框 |

## 组件

| 示例 | 说明 |
| --- | --- |
| [组件与 Props](./component-props) | props 传参与事件回调 |
| [插槽面板](./slot-panel) | `children` 默认插槽与具名插槽 |

## 进阶

| 示例 | 说明 |
| --- | --- |
| [异步加载](./async-loading) | `lazy` + `Suspense` + `ErrorBoundary` |
| [路由标签页](./router-tabs) | `createRouter` / `RouterLink` / `RouterView` |
| [秒表](./stopwatch) | 生命周期钩子 + 定时器清理 |
| [主题切换](./toggle-theme) | 类样式绑定 + `Transition` 过渡 |

::: tip 如何运行
所有示例基于同一个工程骨架：`pnpm create vite`（vanilla-ts）+ 安装 `actview` / `@actview/plugin` / `@actview/jsx`，并配置 `vite.config.ts` 与 `tsconfig.json`。详见 [快速上手](../guide/quick-start)。
:::
