---
description: 使用 ref / reactive / watch / watchEffect 管理响应式状态。
---

# 响应式基础 {#reactivity}

ActView 的响应式系统基于 **Proxy 代理 + 依赖收集（track/trigger）**：读取数据时收集依赖，修改数据时触发依赖，组件与 `watch`/`computed` 随之自动更新。

## 声明响应式状态

### `ref` —— 基础类型与任意值

`ref()` 包装任意值（数字、字符串、布尔、对象……），通过 `.value` 读写：

```tsx
import { ref } from 'actview'

const count = ref(0)

count.value++          // 写入
console.log(count.value) // 读取 → 0
```

在 JSX 中读取时必须显式写 `.value`（没有模板自动解包）：

```tsx
import { ref } from 'actview'

export function Counter() {
  const count = ref(0)
  return <button onclick={() => count.value++}>{count.value}</button>
}
```

`ref` 传入对象时，内部会用 `reactive` 深度代理该对象（见下文）。

### `reactive` —— 对象与数组

```tsx
import { reactive } from 'actview'

const state = reactive({
  count: 0,
  todos: [{ id: 1, text: '学习 ActView' }]
})

state.count++                        // 触发更新
state.todos.push({ id: 2, text: '写文档' }) // 数组变更方法同样触发更新
```

`reactive()` 返回的代理是**深度的**：嵌套对象与数组访问时也会被代理。重复调用 `reactive(proxy)` 幂等返回同一个代理。

::: tip 数组变更方法可用
`push` / `pop` / `shift` / `unshift` / `splice` / `sort` / `reverse` 已做 instrument（执行期间暂停依赖收集、结束后正确触发依赖），可以直接调用。
:::

### `shallowReactive` / `readonly` / `markRaw`

```tsx
import { shallowReactive, readonly, markRaw } from 'actview'

// 只代理第一层：嵌套对象保持原值，不响应
const shallow = shallowReactive({ nested: { n: 1 } })

// 只读代理：任何修改（含嵌套）被拦截并 console.warn
const frozen = readonly({ count: 0 })

// 标记为原始值：reactive/readonly 遇到它时跳过代理
const raw = markRaw({ secret: 'no-proxy' })
```

## 计算属性与侦听器

`computed` 惰性求值并缓存结果，只有依赖变化时才重新计算：

```tsx
import { ref, computed } from 'actview'

const price = ref(10)
const quantity = ref(2)

const total = computed(() => price.value * quantity.value)

console.log(total.value) // 20
price.value = 20
console.log(total.value) // 40（依赖变化后自动重算）
```

`watch` 侦听一个或多个数据源，变化时执行回调（异步微任务触发）：

```tsx
import { ref, watch } from 'actview'

const count = ref(0)

const stop = watch(count, (newVal, oldVal) => {
  console.log(`count: ${oldVal} -> ${newVal}`)
})

count.value++ // 触发回调
stop()        // 停止侦听
```

`watch` 支持多种数据源：

```tsx
// 侦听 getter 函数
watch(() => state.count, (v) => console.log(v))

// 侦听 reactive 对象的某个属性
watch(() => state.todos.length, (v) => console.log('todos 数量：', v))

// 同时侦听多个来源
watch([count, () => state.name], ([c, n], [oldC, oldN]) => {})

// immediate：立即执行一次
watch(count, (v) => console.log(v), { immediate: true })
```

`watchEffect` 立即执行一次，并自动收集其中读取到的所有响应式依赖：

```tsx
import { ref, watchEffect } from 'actview'

const count = ref(0)

watchEffect(() => {
  console.log('count 现在是', count.value) // 立即输出一次
})

count.value++ // 再输出一次
```

::: tip 在 setup 中创建的侦听器会自动清理
组件 `setup` 执行期间创建的 `watch` / `watchEffect` / `computed` 会注册进组件的 `EffectScope`，组件卸载时自动停止，无需手动 `stop()`。
:::

## 等待 DOM 更新：`nextTick`

响应式更新是**异步批量**的：同一次修改触发的多个 effect 会进入微任务队列去重后统一刷新。如果需要等本轮更新完成后再做操作，使用 `nextTick`：

```tsx
import { ref, nextTick } from 'actview'

const count = ref(0)

async function inc() {
  count.value++
  await nextTick() // 等待本轮 DOM 更新完成
  console.log('DOM 已更新')
}
```

## 把对象转为 refs：`toRef` / `toRefs`

```tsx
import { reactive, toRef, toRefs } from 'actview'

const state = reactive({ count: 0, name: 'actview' })

// 单个属性 → ref（读写委托源对象）
const countRef = toRef(state, 'count')
countRef.value++ // 等价于 state.count++

// 全部属性 → refs
const { count, name } = toRefs(state)
```

## 下一步

- [计算属性](./computed)：`computed` 的缓存与依赖追踪细节
- [生命周期](./lifecycle)：`onMounted` / `onUpdated` / `onBeforeUnmount` / `onUnmounted`
- [响应式原理](../in-depth/reactivity-in-depth)：`track` / `trigger` / `EffectScope` 是如何工作的
