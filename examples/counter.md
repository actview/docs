---
description: 计数器示例：ref 响应式状态与事件处理。
---

# 计数器 {#counter}

最基础的响应式示例：`ref` 保存计数，按钮事件修改状态，组件自动更新。

## 在线体验

下面的计数器就是**当前页面真实运行的 ActView 组件**，点击「查看源码」可以看到完整的组件代码，点击按钮试试：

:::demo
counter/basic
:::

## 要点

- `count.value` 是唯一的数据源：读取（渲染）与写入（事件）都走同一个 ref；
- 修改 `count.value` 后，组件 effect 自动重跑 `render + patch`，无需手动操作 DOM；
- 在 JSX 中读取必须显式写 `.value`。

## 相关文档

- [响应式基础](../guide/essentials/reactivity)：`ref` / `reactive`
- [事件处理](../guide/essentials/event-handling)：`onclick` 等
