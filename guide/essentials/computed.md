---
description: computed 计算属性：惰性求值、结果缓存、自动追踪依赖。
---

# 计算属性 {#computed}

## 基本用法

`computed()` 接收一个 getter 函数，返回一个只读的 `ComputedRef`。它与普通函数调用的区别在于两点：**惰性求值**与**结果缓存**。

```tsx
import { ref, computed } from 'actview'

const price = ref(10)
const quantity = ref(2)

const total = computed(() => price.value * quantity.value)
```

- **惰性**：`total` 不会在定义时立即求值，只有第一次读取 `total.value` 时才计算；
- **缓存**：只要依赖（`price` / `quantity`）没有变化，重复读取 `total.value` 直接返回缓存结果，getter 不会重新执行；
- **自动追踪**：getter 中读取的响应式数据会被记录为依赖，任一依赖变化后，下次读取会重新计算。

```tsx
console.log(total.value) // 20 —— 首次读取，执行 getter
console.log(total.value) // 20 —— 缓存命中，不执行 getter

price.value = 20
console.log(total.value) // 40 —— 依赖变化，重新计算
```

## 依赖计算属性

`computed` 可以链式依赖另一个 `computed`，依赖关系自动串联：

```tsx
const base = ref(1)
const double = computed(() => base.value * 2)
const quadruple = computed(() => double.value * 2)

console.log(quadruple.value) // 4
base.value = 5
console.log(quadruple.value) // 20
```

## 在组件中使用

计算属性最常见的用途是把模板中的复杂表达式抽出来，保持 JSX 简洁：

```tsx
import { ref, reactive, computed } from 'actview'

export function Cart() {
  const items = reactive([
    { name: '苹果', price: 5, count: 3 },
    { name: '香蕉', price: 3, count: 2 }
  ])

  const total = computed(() =>
    items.reduce((sum, item) => sum + item.price * item.count, 0)
  )

  return (
    <div>
      <ul>
        {items.map((item) => (
          <li>
            {item.name} × {item.count}
            <button onclick={() => item.count++}>+</button>
          </li>
        ))}
      </ul>
      <p>合计：{total.value}</p>
    </div>
  )
}
```

## 计算属性 vs 方法

| | 每次渲染 | 缓存 |
| --- | --- | --- |
| `computed(() => …)` | 否，依赖未变时复用上次结果 | ✅ |
| 普通函数 `fn()` | 是，每次渲染都重新执行 | ❌ |

如果某个值不会变化、或你确实希望每次都重新计算，直接使用普通函数即可；否则优先 `computed`。

## 计算属性 vs `watch`

- **`computed`**：根据已有状态**派生**新值，聚焦「计算」；计算结果可直接用于渲染。
- **`watch`**：观察状态变化后执行**副作用**（请求、日志、手动操作 DOM 等），聚焦「响应」。

```tsx
// 用 computed 派生
const fullName = computed(() => `${first.value} ${last.value}`)

// 用 watch 做副作用
watch(fullName, (name) => {
  console.log('姓名变化：', name)
})
```

## 下一步

- [响应式基础](./reactivity)：`ref` / `reactive` / `watch` / `watchEffect`
- [响应式原理](../in-depth/reactivity-in-depth)：脏标记与惰性求值的实现细节
