---
description: 状态管理 API：defineStore、applyPlugin、resetStore 等（@actview/store）。
---

# 状态管理 {#store}

`@actview/store` 是组合式状态管理库：用 `reactive` / `computed` 定义状态，`defineStore` 提供单例与类型推导。

## defineStore()

定义 store，返回 `useStore` 函数（懒创建单例）。

```ts
function defineStore<Setup extends () => any>(
  id: string,
  setup: Setup
): (() => ReturnType<Setup>) & { $id: string }
```

```tsx
import { reactive, computed } from 'actview'
import { defineStore } from '@actview/store'

export const useCounter = defineStore('counter', () => {
  const state = reactive({ count: 0 })
  const double = computed(() => state.count * 2)
  function inc() {
    state.count++
  }
  return { state, double, inc }
})
```

```tsx
// 使用：单例，多次调用返回同一实例
const counter = useCounter()
counter.inc()
counter.state.count   // 1
counter.double.value  // 2
```

- **单例**：同 id 跨模块复用（多个文件 import 同一个 `useCounter` 返回同一实例）
- **类型推导**：`useCounter()` 返回类型 = setup 返回类型（零样板）
- **响应式**：`reactive` / `computed` 天然响应式，组件读取自动追踪

## applyPlugin()

注册插件，store 创建时调用 `fn({ id, state })`。

```ts
function applyPlugin(plugin: StorePlugin): void

interface StorePlugin {
  (ctx: { id: string; state: any }): void
}
```

```tsx
import { watch } from 'actview'
import { applyPlugin } from '@actview/store'

// 持久化插件示例
applyPlugin(({ id, state }) => {
  const saved = localStorage.getItem(id)
  if (saved) Object.assign(state, JSON.parse(saved))
  watch(state, () => localStorage.setItem(id, JSON.stringify(state)), { deep: true })
})
```

## resetStore() / resetAllStores()

```ts
function resetStore(id: string): void      // 重置指定 store（下次 useStore 重新 setup）
function resetAllStores(): void            // 重置全部（测试隔离）
```

## getActiveStoreIds() / getStore()

```ts
function getActiveStoreIds(): string[]             // 已创建的 store id 列表
function getStore(id: string): StoreContext | undefined  // 取实例
```

## 类型

| 类型 | 说明 |
| --- | --- |
| `StoreContext` | `{ id: string; state: any }` |
| `StorePlugin` | `(ctx: StoreContext) => void` |

## 下一步

- [指南：状态管理](/guide/scaling-up/state-management)
- [响应式核心](./reactivity-core)
