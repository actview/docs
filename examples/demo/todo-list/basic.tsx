import { ref, reactive, computed } from 'actview'
import '../common.css?scoped'

interface TodoItem {
  id: number
  text: string
  done: boolean
}

export default function Basic() {
  const todos = reactive<TodoItem[]>([
    { id: 1, text: '学习 ActView', done: true },
    { id: 2, text: '写一个示例', done: false }
  ])
  const todoInput = ref('')
  const todoFilter = ref<'all' | 'active' | 'done'>('all')
  let todoNextId = 3

  const visible = computed(() => {
    if (todoFilter.value === 'active') return todos.filter((t) => !t.done)
    if (todoFilter.value === 'done') return todos.filter((t) => t.done)
    return todos
  })
  const remaining = computed(() => todos.filter((t) => !t.done).length)

  const addTodo = () => {
    const text = todoInput.value.trim()
    if (!text) return
    todos.push({ id: todoNextId++, text, done: false })
    todoInput.value = ''
  }

  return (
    <div class="av-demo">
      <div>
        <input
          value={todoInput.value}
          oninput={(e) => (todoInput.value = e.target.value)}
          onkeydown={(e) => {
            if (e.key !== 'Enter') return
            addTodo()
          }}
          placeholder="输入任务，回车添加"
        />
        <button onclick={addTodo}>添加</button>
      </div>

      <p class="av-muted">剩余 {remaining.value} 项未完成</p>

      <div>
        {(['all', 'active', 'done'] as const).map((f) => (
          <button
            key={f}
            class="av-filter"
            style={{ fontWeight: todoFilter.value === f ? 'bold' : 'normal' }}
            onclick={() => (todoFilter.value = f)}
          >
            {{ all: '全部', active: '未完成', done: '已完成' }[f]}
          </button>
        ))}
      </div>

      <ul class="av-list">
        {visible.value.map((todo) => (
          <li key={todo.id}>
            <input
              type="checkbox"
              checked={todo.done}
              onchange={(e) => (todo.done = e.target.checked)}
            />
            <span class={todo.done ? 'av-done' : ''}>{todo.text}</span>
            <button
              class="av-danger"
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
