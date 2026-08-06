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

::: tip 更多示例即将上线
组件（Props / 插槽）与进阶（异步加载 / 路由标签页 / 秒表 / 主题切换）示例正在补充中。
:::

::: tip 如何运行
所有示例基于同一个工程骨架：`pnpm create vite`（vanilla-ts）+ 安装 `actview` / `@actview/plugin` / `@actview/jsx`，并配置 `vite.config.ts` 与 `tsconfig.json`。详见 [快速上手](../guide/quick-start)。
:::
