---
description: 待办清单示例：reactive 数组、keyed 列表、增删与过滤。
---

# 待办清单 {#todo-list}

经典 TODO 应用：添加、完成、删除，以及按状态过滤。覆盖 `reactive` 数组的变更方法、`keyed` 列表渲染与 `computed` 过滤。

## 在线体验

真实运行的组件——添加任务、勾选完成、删除、切换过滤：

<script lang="tsx">
import { ref, reactive, computed } from 'actview'

interface TodoItem {
  id: number
  text: string
  done: boolean
}

const todos = reactive<TodoItem[]>([
  { id: 1, text: '学习 ActView', done: true },
  { id: 2, text: '写一个示例', done: false }
])
const todoInput = ref('')
const todoFilter = ref<'all' | 'active' | 'done'>('all')
let todoNextId = 3

export function TodoDemo() {
  const visible = computed(() => {
    if (todoFilter.value === 'active') return todos.filter((t) => !t.done)
    if (todoFilter.value === 'done') return todos.filter((t) => t.done)
    return todos
  })
  const remaining = computed(() => todos.filter((t) => !t.done).length)

  return (
    <div
      style={{
        fontFamily: 'system-ui, sans-serif',
        padding: '16px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        background: '#f8fafc'
      }}
    >
      <div>
        <input
          value={todoInput.value}
          oninput={(e) => (todoInput.value = e.target.value)}
          onkeydown={(e) => {
            if (e.key !== 'Enter') return
            const text = todoInput.value.trim()
            if (!text) return
            todos.push({ id: todoNextId++, text, done: false })
            todoInput.value = ''
          }}
          placeholder="输入任务，回车添加"
        />
        <button
          onclick={() => {
            const text = todoInput.value.trim()
            if (!text) return
            todos.push({ id: todoNextId++, text, done: false })
            todoInput.value = ''
          }}
        >
          添加
        </button>
      </div>

      <p style={{ opacity: 0.7 }}>剩余 {remaining.value} 项未完成</p>

      <div>
        {(['all', 'active', 'done'] as const).map((f) => (
          <button
            key={f}
            style={{ fontWeight: todoFilter.value === f ? 'bold' : 'normal' }}
            onclick={() => (todoFilter.value = f)}
          >
            {{ all: '全部', active: '未完成', done: '已完成' }[f]}
          </button>
        ))}
      </div>

      <ul>
        {visible.value.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.done}
              onchange={(e) => (todo.done = e.target.checked)}
            />
            <span
              style={{
                textDecoration: todo.done ? 'line-through' : 'none',
                opacity: todo.done ? 0.6 : 1
              }}
            >
              {todo.text}
            </span>
            <button
              onclick={() => {
                const index = todos.findIndex((t) => t.id === todo.id)
                if (index >= 0) todos.splice(index, 1)
              }}
            >
              删除
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
</script>

<TodoDemo />

## 完整代码

::: code-group

```tsx [src/App.tsx]
import { ref, reactive, computed } from 'actview'

interface Todo {
  id: number
  text: string
  done: boolean
}

type Filter = 'all' | 'active' | 'done'

export function App() {
  const todos = reactive<Todo[]>([
    { id: 1, text: '学习 ActView', done: true },
    { id: 2, text: '写一个示例', done: false }
  ])
  const input = ref('')
  const filter = ref<Filter>('all')
  let nextId = 3

  function addTodo() {
    const text = input.value.trim()
    if (!text) return
    todos.push({ id: nextId++, text, done: false }) // 变更方法自动触发更新
    input.value = ''
  }

  function removeTodo(id: number) {
    const index = todos.findIndex((t) => t.id === id)
    if (index >= 0) todos.splice(index, 1)
  }

  const visible = computed(() => {
    if (filter.value === 'active') return todos.filter((t) => !t.done)
    if (filter.value === 'done') return todos.filter((t) => t.done)
    return todos
  })

  const remaining = computed(() => todos.filter((t) => !t.done).length)

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '420px' }}>
      <h1>待办清单</h1>

      <div>
        <input
          value={input.value}
          oninput={(e) => (input.value = e.target.value)}
          onkeydown={(e) => e.key === 'Enter' && addTodo()}
          placeholder="输入任务，回车添加"
        />
        <button onclick={addTodo}>添加</button>
      </div>

      <p style={{ opacity: 0.7 }}>剩余 {remaining.value} 项未完成</p>

      <div>
        {(['all', 'active', 'done'] as Filter[]).map((f) => (
          <button
            key={f}
            style={{ fontWeight: filter.value === f ? 'bold' : 'normal' }}
            onclick={() => (filter.value = f)}
          >
            {{ all: '全部', active: '未完成', done: '已完成' }[f]}
          </button>
        ))}
      </div>

      <ul>
        {visible.value.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.done}
              onchange={(e) => (todo.done = e.target.checked)}
            />
            <span
              style={{
                textDecoration: todo.done ? 'line-through' : 'none',
                opacity: todo.done ? 0.6 : 1
              }}
            >
              {todo.text}
            </span>
            <button onclick={() => removeTodo(todo.id)}>删除</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
```

```tsx [src/main.tsx]
import { createApp } from 'actview'
import { App } from './App'

createApp(App).mount('#app')
```

:::

## 要点

- `todos.push(...)` / `todos.splice(...)` 等**数组变更方法已 instrument**，调用即触发更新；
- 列表项必须有稳定的 `key`（这里用 `id`），diff 才能正确复用与重排；
- 过滤逻辑放在 `computed` 里：`filter` 或 `todos` 变化时自动重算，渲染直接消费 `visible.value`。

## 相关文档

- [列表渲染](../guide/essentials/list)：`map` + `key`
- [计算属性](../guide/essentials/computed)：过滤后的派生列表
- [表单绑定](../guide/essentials/forms)：复选框与输入框
