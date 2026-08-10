---
description: 待办清单示例：reactive 数组、keyed 列表渲染与增删切换。
---

# 待办清单 {#todo-list}

一个 TODO 应用：添加、完成、删除以及状态切换。用到 `reactive` 改变数据源、`keyed` 列表渲染和 `computed` 过滤。

## 在线体验

下面的待办清单就是**当前页面真实运行的 ActView 组件**，点击「查看源码」可以看到完整的组件代码：

:::demo
todo-list/basic
:::

## 要点

- `todos.push(...)` / `todos.splice(...)` 是**响应式数组原生方法**（已被 instrument），调用即触发视图更新；
- 列表渲染必须为每一项提供稳定的 `key`（这里用 `id`），diff 才能正确追踪元素的增删与移动；
- 过滤逻辑放在 `computed` 里：`filter` 或 `todos` 变化时自动计算，渲染直接读取 `visible.value`。

## 相关文档

- [列表渲染](../guide/essentials/list)：`map` + `key`
- [计算属性](../guide/essentials/computed)：过滤与派生数据
- [表单绑定](../guide/essentials/forms)：输入框与复选框
