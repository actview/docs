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

## toValue()

取值统一：ref 取 `.value`，getter 函数调用，其余原样返回。

```ts
function toValue<T>(source: T | Ref<T> | (() => T)): T
```

```tsx
import { toValue, ref } from 'actview'

toValue(1)         // 1
toValue(ref(1))    // 1
toValue(() => 2)   // 2
```

## shallowRef()

浅层 ref：对象值**不**深层包装，`.value` 整体替换才触发更新。

```ts
function shallowRef<T>(value: T): Ref<T>
```

```tsx
import { shallowRef, triggerRef } from 'actview'

const s = shallowRef({ n: 0 })
s.value.n = 1     // 不触发（浅层）
triggerRef(s)     // 手动触发依赖
```

## triggerRef()

手动触发 ref 依赖（`shallowRef` 内部属性变化不自动触发时使用）。

```ts
function triggerRef(ref: Ref): void
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

`reactive` 也支持 `Map` / `Set` / `WeakMap` / `WeakSet`：

```tsx
const map = reactive(new Map<string, number>())
map.set('a', 1)    // 触发（size/forEach/迭代均响应）
map.get('a')       // 1

const set = reactive(new Set<number>())
set.add(1)         // 触发
set.has(1)         // true
```

## shallowReadonly()

浅只读：仅第一层只读，嵌套可写。

```ts
function shallowReadonly<T extends object>(obj: T): Readonly<T>
```

```tsx
import { shallowReadonly } from 'actview'

const obj = shallowReadonly({ a: 1, nested: { b: 2 } })
obj.a = 2          // 警告，不生效
obj.nested.b = 3   // 可写（浅只读）
```

## 判型工具

| API | 说明 |
| --- | --- |
| `toRaw(v)` | 递归取原始对象 |
| `isReactive(v)` | 是否响应式代理（readonly(reactive) 也返回 true） |
| `isReadonly(v)` | 是否只读代理 |
| `isProxy(v)` | 是否响应式或只读代理 |
| `isShallow(v)` | 是否浅层代理（shallowReactive/shallowRef/shallowReadonly） |

```tsx
import { reactive, readonly, toRaw, isReactive, isReadonly, isProxy } from 'actview'

const raw = { a: 1 }
const r = reactive(raw)
toRaw(r) === raw        // true
isReactive(r)           // true
isReadonly(readonly(r)) // true
isProxy(r)              // true
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
  options?: {
    immediate?: boolean          // 初始立即执行一次
    deep?: boolean               // getter/ref 源深遍历；对象源默认 deep，deep:false 关闭
    flush?: 'pre' | 'post' | 'sync'  // 默认 pre（微任务）
    once?: boolean               // 回调只执行一次后自动 stop
  }
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

## onWatcherCleanup()

在 watch 回调执行期间注册清理函数（等价于回调第三参 `onCleanup`）。

```ts
function onWatcherCleanup(cleanupFn: () => void, failSilently?: boolean): void
```

```tsx
import { watch, onWatcherCleanup } from 'actview'

watch(() => state.id, () => {
  onWatcherCleanup(() => console.log('清理上一次副作用'))
  // ...
})
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
