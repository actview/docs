---
description: 响应式核心 API：ref、computed、reactive、watch 等。
---

# 响应式核心 {#reactivity-core}

## ref()

包装任意值为响应式引用，通过 `.value` 读写。

```ts
function ref<T>(value: T): Ref<T>
```

```tsx
import { ref } from 'actview'

const count = ref(0)
count.value++            // 写入触发更新
console.log(count.value) // 读取收集依赖

// 对象值自动深度响应式
const obj = ref({ nested: { n: 1 } })
obj.value.nested.n = 2   // 触发更新
```

## isRef()

判断一个值是否为 ref。

```ts
function isRef(v: any): v is Ref
```

```tsx
import { isRef } from 'actview'

isRef(ref(0)) // true
isRef(0)      // false
```

## unref()

ref 取 `.value`，非 ref 原样返回。

```ts
function unref<T>(ref: T | Ref<T>): T
```

```tsx
import { ref, unref } from 'actview'

unref(ref(1)) // 1
unref(1)      // 1
```

## reactive()

深度响应式代理：普通对象与数组的嵌套结构均可响应。

```ts
function reactive<T extends object>(obj: T): T
```

```tsx
import { reactive } from 'actview'

const state = reactive({ count: 0, todos: [] })
state.count++                          // 触发
state.todos.push({ id: 1 })            // 数组变更方法触发
reactive(state) === state              // 幂等：重复代理返回原代理
```

## shallowReactive()

只代理第一层，嵌套对象保持原值（不响应）。

```ts
function shallowReactive<T extends object>(obj: T): T
```

```tsx
import { shallowReactive } from 'actview'

const state = shallowReactive({ nested: { n: 1 } })
state.nested.n = 2 // 不触发更新（nested 未代理）
```

## readonly()

深度只读代理：任何修改（含嵌套）被拦截并 `console.warn`；可读、可被跟踪。

```ts
function readonly<T extends object>(obj: T): Readonly<T>
```

```tsx
import { readonly } from 'actview'

const frozen = readonly({ count: 0 })
frozen.count = 1 // 警告，不生效
```

## markRaw()

标记对象为原始值：`reactive` / `readonly` 遇到时跳过代理。

```ts
function markRaw<T extends object>(obj: T): T
```

```tsx
import { markRaw } from 'actview'

const raw = markRaw({ secret: 'no-proxy' })
const state = reactive({ data: raw })
state.data.secret = 'x' // 不响应
```

## computed()

惰性求值 + 缓存的计算属性。

```ts
function computed<T>(getter: () => T): ComputedRef<T>
```

```tsx
import { ref, computed } from 'actview'

const price = ref(10)
const total = computed(() => price.value * 2)

total.value // 20（首次求值）
total.value // 20（缓存）
price.value = 20
total.value // 40（依赖变化后重算）
```

## watch()

侦听一个或多个响应式源，变化时执行回调（异步微任务触发）。

```ts
function watch<T>(
  source: WatchSource<T> | WatchSource<T>[] | Array<Ref<any> | (() => any)>,
  cb: (newVal: any, oldVal: any, onCleanup: WatchCleanup) => void,
  options?: { immediate?: boolean }
): () => void
```

```tsx
import { ref, watch } from 'actview'

const count = ref(0)
const stop = watch(count, (n, o) => console.log(n, o))

// getter 源
watch(() => state.count, (n) => console.log(n))

// 多个源
watch([count, () => state.name], ([c, n], [oc, on]) => {})

// 对象源：默认深度监听（遍历全部属性）
watch(state, (n) => console.log('state 变了'))

// immediate：立即执行一次（oldValue 为 undefined）
watch(count, (n, o) => console.log(n, o), { immediate: true })

// 回调第三参 onCleanup：下一次触发前清理上次副作用
watch(id, async (newId, _old, onCleanup) => {
  let cancelled = false
  onCleanup(() => (cancelled = true))
  const data = await fetchData(newId)
  if (!cancelled) state.data = data
})

stop() // 停止侦听
```

## watchEffect()

立即执行一次并自动收集依赖，依赖变化后异步重新执行。

```ts
function watchEffect(effect: () => void): () => void
```

```tsx
import { ref, watchEffect } from 'actview'

const count = ref(0)
const stop = watchEffect(() => {
  console.log('count =', count.value)
})

count.value++ // 异步触发再次执行
stop()
```

## toRef() / toRefs()

把对象属性转为 ref，读写委托源对象（保持响应式）。

```ts
function toRef<T extends object, K extends keyof T>(object: T, key: K): Ref<T[K]>
function toRefs<T extends object>(object: T): { [K in keyof T]: Ref<T[K]> }
```

```tsx
import { reactive, toRef, toRefs } from 'actview'

const state = reactive({ count: 0, name: 'a' })

const count = toRef(state, 'count')
count.value++ // 等价于 state.count++

const { count: c, name } = toRefs(state)
c.value = 10  // 写回 state.count
```

## 类型

| 类型 | 说明 |
| --- | --- |
| `Ref<T>` | `{ value: T; __v_isRef: true }` |
| `ComputedRef<T>` | 只读 Ref（`readonly value: T`） |
| `WatchOptions` | `{ immediate?: boolean }` |
| `WatchCleanup` | `(fn: () => void) => void` |
| `WatchSource<T>` | `T \| Ref<T> \| (() => T)` |
