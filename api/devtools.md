---
description: DevTools API：initDevTools、mountPanel（@actview/devtools）。
---

# DevTools {#devtools}

`@actview/devtools` 收集组件树与响应式事件流，暴露全局 hook 供调试面板 / 浏览器扩展接入。

## initDevTools()

启动埋点：收集组件树 + 事件流，暴露 `window.__ACTVIEW_DEVTOOLS_GLOBAL_HOOK__`（幂等）。

```ts
function initDevTools(): void
```

```tsx
import { initDevTools } from '@actview/devtools'

// 应用入口，开发环境启用
if (import.meta.env.DEV) {
  initDevTools()
}
```

## mountPanel()

在页面挂载调试面板浮层（右下角，展示组件树 + 事件流），返回卸载函数。

```ts
function mountPanel(container?: HTMLElement): () => void
```

```tsx
import { initDevTools, mountPanel } from '@actview/devtools'

initDevTools()
const unmount = mountPanel()  // 右下角浮层
// unmount() 卸载面板
```

## 全局 Hook

`initDevTools()` 后，`window.__ACTVIEW_DEVTOOLS_GLOBAL_HOOK__` 提供：

| 方法 | 说明 |
| --- | --- |
| `getComponentTree()` | 组件树节点数组（`{ id, name, parentId, children }`） |
| `getEventLog()` | 事件流（`mount`/`update`/`unmount`/`track`/`trigger`） |
| `subscribe(cb)` | 订阅快照变化，返回取消函数 |
| `reset()` | 清空数据 |

```ts
// 浏览器扩展接入示例
const hook = window.__ACTVIEW_DEVTOOLS_GLOBAL_HOOK__
const tree = hook.getComponentTree()
const events = hook.getEventLog()
```

## 类型

| 类型 | 说明 |
| --- | --- |
| `TreeNode` | `{ id, name, parentId, children }` |
| `EventEntry` | `{ type, time, id?, name?, key? }` |
| `DevtoolsSnapshot` | `{ tree, events }` |

## 下一步

- [指南：DevTools](/guide/scaling-up/devtools)
