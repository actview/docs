---
description: 响应式进阶 API：EffectScope、getCurrentScope 等。
---

# 响应式进阶 {#reactivity-advanced}

## EffectScope

管理一组 effect（`watch` / `watchEffect` / `computed` / `runEffect` 等）的生命周期，可以一次性停止全部。

```ts
class EffectScope {
  on(): void
  off(): void
  run<T>(fn: () => T): T | undefined
  stop(): void
}
```

```tsx
import { EffectScope, watch, computed } from 'actview'

const scope = new EffectScope()

scope.run(() => {
  const count = ref(0)
  watch(count, (n) => console.log(n))
  const double = computed(() => count.value * 2)
})

scope.stop() // 一次性停止 scope 内所有 effect
```

组件实例自带 `scope`：`setup` 期间创建的侦听器/计算属性自动注册，组件卸载时统一停止。

## getCurrentScope()

返回当前活动的 `EffectScope`（没有则为 `undefined`）。

```ts
function getCurrentScope(): EffectScope | undefined
```

```tsx
import { getCurrentScope } from 'actview'

// 在组件 setup 中调用：返回组件自身的 scope
const scope = getCurrentScope()
```

## effectScope()

创建一个作用域，用 `scope.run(fn)` 在作用域激活状态下执行 fn（期间创建的 effect 注册进该 scope）。

```ts
function effectScope(detached?: boolean): EffectScope
```

```tsx
import { effectScope, onScopeDispose, watch } from 'actview'

const scope = effectScope()

scope.run(() => {
  watch(() => state.count, (n) => console.log(n))
  onScopeDispose(() => console.log('scope 已清理'))
})

scope.stop() // 停止 effect + 执行 onScopeDispose 回调
```

## onScopeDispose()

在当前作用域注册清理函数，作用域 `stop()` 时执行。

```ts
function onScopeDispose(fn: () => void): void
```

## runEffect()

创建 effect 并**立即同步执行一次**；可选 `scheduler` 控制后续触发方式（默认同步重跑）。

```ts
function runEffect(fn: () => void, options?: { scheduler?: (effect) => void }): ReactiveEffect
```

```tsx
import { runEffect } from 'actview'

const state = reactive({ count: 0 })
const effect = runEffect(() => {
  console.log('count =', state.count)
})

state.count++ // 同步重跑 effect

effect.stop() // 停止
```

> 组件渲染即 `runEffect(update, { scheduler: queueJob })`——首帧同步渲染，之后入微任务队列批量更新。

## ReactiveEffect

底层 effect 类，一般不需要直接使用。

```ts
class ReactiveEffect {
  deps: Dep[]
  active: boolean
  scheduler?: (effect: ReactiveEffect) => void
  run(): any
  stop(): void
}
```

## nextTick()

返回本轮响应式更新（微任务 flush）结束后的 Promise。

```ts
function nextTick<T = void>(cb?: () => T): Promise<T | void>
```

```tsx
import { ref, nextTick } from 'actview'

const count = ref(0)
count.value++
await nextTick() // DOM 已更新
```

## 调度批处理

组件 effect 带 `scheduler: queueJob`：更新进入微任务队列（Set 去重），同帧内多次修改合并为一次刷新。底层 API：

```ts
function queueJob(effect: ReactiveEffect): void
```

## pauseTracking() / resetTracking()

暂停/恢复依赖收集（数组变更方法内部使用，一般无需手动调用）。

```ts
function pauseTracking(): void
function resetTracking(): void
```
