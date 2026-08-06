---
description: 用 map + key 渲染列表，理解 ActView 的 keyed diff。
---

# 列表渲染 {#list}

ActView 没有 `v-for`，列表渲染使用 `Array.map` + JSX 表达式。

## 用 `map` 渲染列表

```tsx
import { reactive } from 'actview'

export function TodoList() {
  const todos = reactive([
    { id: 1, text: '学习 ActView' },
    { id: 2, text: '写文档' },
    { id: 3, text: '发布' }
  ])

  return (
    <ul>
      {todos.map((todo) => (
        <li key={todo.id}>{todo.text}</li>
      ))}
    </ul>
  )
}
```

::: warning 每个列表项必须带 `key`
`key` 用于在 diff 时识别「哪个节点被移动/复用」。没有 `key` 时按位置对比，插入/删除中间项会导致节点复用错乱（如输入框内容串位）。`key` 应使用稳定且唯一的标识（如 `id`），避免使用数组索引。
:::

## 修改列表

ActView 对数组的变更方法（`push` / `pop` / `shift` / `unshift` / `splice` / `sort` / `reverse`）做了 instrument，调用即可触发更新：

```tsx
import { reactive } from 'actview'

export function TodoApp() {
  const todos = reactive([
    { id: 1, text: '学习 ActView', done: false }
  ])
  let nextId = 2

  function addTodo() {
    todos.push({ id: nextId++, text: `任务 ${nextId - 1}` })
  }

  return (
    <div>
      <button onclick={addTodo}>添加任务</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.done}
              onchange={(e) => (todo.done = e.target.checked)}
            />
            {todo.text}
          </li>
        ))}
      </ul>
    </div>
  )
}
```

### 替换整个数组

直接给整个数组赋新引用同样触发更新：

```tsx
todos.value = todos.value.filter((t) => !t.done) // ref 数组
// 或对 reactive 数组整体赋值
state.todos = state.todos.filter((t) => !t.done)
```

## 多层嵌套列表

嵌套 `map` 即可，内层同样需要 `key`：

```tsx
{groups.map((group) => (
  <section key={group.id}>
    <h3>{group.title}</h3>
    <ul>
      {group.items.map((item) => (
        <li key={item.id}>{item.name}</li>
      ))}
    </ul>
  </section>
))}
```

## 与 `computed` 结合：过滤后的列表

```tsx
import { ref, reactive, computed } from 'actview'

export function FilteredList() {
  const keyword = ref('')
  const items = reactive(['ActView', 'VitePress', 'JavaScript', 'TypeScript'])

  const filtered = computed(() =>
    items.filter((item) => item.toLowerCase().includes(keyword.value.toLowerCase()))
  )

  return (
    <div>
      <input value={keyword.value} oninput={(e) => (keyword.value = e.target.value)} placeholder="搜索…" />
      <ul>
        {filtered.value.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  )
}
```

## 下一步

- [条件渲染](./conditional)：`&&` / 三元表达式
- [事件处理](./event-handling)：为列表项绑定交互
- [渲染机制](../in-depth/rendering-mechanism)：keyed diff 的实现原理
