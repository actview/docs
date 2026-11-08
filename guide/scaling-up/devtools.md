---
description: 使用 @actview/devtools 调试组件树与响应式事件流。
---

# DevTools {#devtools}

`@actview/devtools` 收集组件树与响应式事件流，提供调试面板浮层与全局 hook。

## 安装

```bash
pnpm add @actview/devtools
```

## 启用

```tsx
// src/main.tsx
import { createApp } from 'actview'
import { initDevTools, mountPanel } from '@actview/devtools'
import { App } from './App'

if (import.meta.env.DEV) {
  initDevTools()
  mountPanel() // 右下角浮层面板（组件树 + 事件流）
}

createApp(App).mount('#app')
```

## 调试面板

`mountPanel()` 在页面右下角显示浮层：

- **组件树**：按父子关系缩进显示组件名 + 实例 id（组件名来自 `defineComponent(fn, name)` 或 Babel 自动传递）
- **事件流**：最近 20 条响应式事件（`mount`/`update`/`unmount`/`track`/`trigger`）

## 全局 Hook

`initDevTools()` 后，`window.__ACTVIEW_DEVTOOLS_GLOBAL_HOOK__` 可供浏览器扩展等外部工具接入：

```ts
const hook = window.__ACTVIEW_DEVTOOLS_GLOBAL_HOOK__

hook.getComponentTree()   // 组件树节点 [{ id, name, parentId, children }]
hook.getEventLog()        // 事件流 [{ type, time, id?, name?, key? }]
hook.subscribe((snap) => { /* 快照变化 */ })
hook.reset()              // 清空
```

## 下一步

- [API：DevTools](/api/devtools)
- [组件基础](../components/component-basics)
