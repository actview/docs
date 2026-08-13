---
description: 使用 @actview/store 管理全局状态：defineStore 单例 + 插件。
---

# 状态管理 {#state-management}

ActView 的响应式内核已经很强，跨组件共享状态用**组合式 store** 即可：一个返回响应式状态的函数 + 单例缓存。

## 安装

```bash
pnpm add @actview/store
```

## 定义 store

```ts
// src/stores/counter.ts
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

## 使用 store

```tsx
import { useCounter } from './stores/counter'

export function Counter() {
  const counter = useCounter() // 单例：多次调用返回同一实例
  return (
    <button onClick={counter.inc}>
      {counter.state.count}（double: {counter.double.value}）
    </button>
  )
}
```

- **单例**：同 id 跨模块复用，多个组件 import 同一个 `useCounter` 返回同一实例
- **类型推导**：`useCounter()` 返回类型 = setup 返回类型
- **响应式**：`reactive` / `computed` 天然响应式，组件读取自动追踪

## 插件（持久化示例）

```ts
// src/stores/plugins.ts
import { watch } from 'actview'
import { applyPlugin } from '@actview/store'

applyPlugin(({ id, state }) => {
  const saved = localStorage.getItem(id)
  if (saved) Object.assign(state, JSON.parse(saved))
  watch(state, () => localStorage.setItem(id, JSON.stringify(state)), { deep: true })
})
```

## 测试隔离

```ts
import { resetAllStores } from '@actview/store'

beforeEach(resetAllStores)
```

## 对比 provide / inject

- `provide` / `inject`：组件树内传数据（主题、配置），随组件生命周期
- `@actview/store`：全局共享状态，独立于组件树，可测试、可持久化

## 下一步

- [API：状态管理](/api/store)
- [响应式基础](../essentials/reactivity)
