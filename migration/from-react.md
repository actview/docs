---
description: 从 React 迁移到 ActView：写法相似点、关键差异与常见陷阱。
---

# 从 React 迁移 {#from-react}

如果你熟悉 React，ActView 的 JSX 组件写法会让你非常亲切——**几乎一样的 JSX 语法、函数组件、props、条件渲染、列表渲染**。最大的不同在于**状态与更新机制**：React 用 Hooks + 每次渲染重跑函数，ActView 用响应式数据 + 组件函数只执行一次。

## 一、核心差异：组件函数只执行一次

这是所有迁移差异的根源，务必先理解：

| | React | ActView |
| --- | --- | --- |
| 组件函数体 | **每次渲染都重新执行** | **只执行一次（setup 阶段）** |
| 返回的 JSX | 每次渲染生成新 VNode | 包成 `render` 函数，**每次更新时执行** |
| 状态 | `useState` / `useReducer` | 响应式 `ref` / `reactive` |
| 更新驱动 | 重新执行函数 | 响应式依赖追踪 + 局部重渲染 |

```tsx
// React
function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>{count}</button>
}
```

```tsx
// ActView（等价）
function Counter() {
  const count = ref(0)                      // ① setup：只执行一次
  return <button onClick={() => count.value++}>{count.value}</button>  // ② render：每次更新执行
}
```

**结论**：需要"每次渲染重算"的东西，要么写进 JSX 表达式（render 函数内），要么用 `computed`；不能写在组件函数体的 setup 层。

## 二、写法几乎一样的地方

### JSX 语法

```tsx
// 属性、子元素、自闭合、Fragment、条件、列表——写法完全一致
function App(props: { user: User }) {
  return (
    <div className="app">                      {/* className 兼容，推荐用 class */}
      <header>{props.user.name}</header>
      {props.user.vip ? <Badge /> : null}      {/* 条件渲染 */}
      <ul>
        {props.user.tags.map((t) => <li key={t}>{t}</li>)}  {/* 列表渲染 + key */}
      </ul>
      <span aria-label="提示" data-tip="hi">…</span>
    </div>
  )
}
```

### 函数组件 + props

```tsx
export type CardProps = { title: string; onClick?: () => void }
export function Card(props: CardProps) {
  return <button onClick={props.onClick}>{props.title}</button>
}
```

props 形状由 TS 类型声明，父组件传参自动类型检查。

### 事件

```tsx
<button onClick={handleClick} onFocusCapture={onFocus}>ok</button>
```

事件处理器参数是原生 `MouseEvent` / `KeyboardEvent` 等（**没有 React 合成事件**，`e.target` 就是 DOM 元素）。

## 三、需要转换的地方

### 1. 状态：useState → ref / reactive

| React | ActView |
| --- | --- |
| `const [x, setX] = useState(0)` | `const x = ref(0)`；读 `x.value`、写 `x.value = 1` |
| `const [obj, setObj] = useState({...})` | `const obj = reactive({...})`；属性直接改 |
| `setX(x + 1)` | `x.value++`（直接改，自动触发更新） |

```tsx
// 基本类型用 ref（必须 .value）
const count = ref(0)
count.value++

// 对象/数组用 reactive（直接改属性）
const state = reactive({ items: [], loading: false })
state.items.push(item)
state.loading = true
```

### 2. 派生：useMemo → computed

```tsx
// React
const double = useMemo(() => count * 2, [count])

// ActView：自动依赖追踪，无需 deps 数组
const double = computed(() => count.value * 2)
double.value
```

### 3. 副作用：useEffect → watch / 生命周期

```tsx
// React
useEffect(() => {
  sideEffect()
  return cleanup
}, [dep])

// ActView：依赖明确用 watch
watch(dep, (nv, ov, onCleanup) => {
  sideEffect()
  onCleanup(cleanup)
})

// 只挂载/卸载一次用生命周期
onMounted(() => sideEffect())
onUnmounted(() => cleanup())
```

### 4. DOM 引用：useRef → 模板引用

```tsx
// React
const el = useRef<HTMLDivElement>(null)
return <div ref={el} />

// ActView：props.ref（函数或 { value }）
let el: HTMLElement | null = null
return <div ref={(n) => (el = n)} />
```

### 5. Context：useContext → provide / useInjects

```tsx
// 祖先
provide('theme', themeRef)

// 后代
const theme = useInjects('theme')
```

### 6. 不需要 useCallback

React 需要 `useCallback` 保证回调引用稳定；ActView 的 setup 只执行一次，**闭包天然稳定**，直接定义函数即可。

## 四、完整对照表

| React | ActView | 说明 |
| --- | --- | --- |
| `useState` / `useReducer` | `ref` / `reactive` | 无 reducer 语义 |
| `useMemo` | `computed` | 自动依赖追踪 |
| `useEffect` | `watch` / `watchEffect` / 生命周期 | 见上 |
| `useRef` | `ref` / `props.ref` | DOM 引用用模板引用 |
| `useCallback` | 不需要 | setup 闭包天然稳定 |
| `useContext` | `provide` / `useInjects` | string key |
| `memo` | `v-memo` 指令 / `<solid>` | 组件级 memo 无 |
| `lazy` + `Suspense` | `lazy` + `Suspense` | 几乎一致 |
| 错误边界 | `<ErrorBoundary>` | fallback 可函数化 |
| `dangerouslySetInnerHTML` | `dangerouslySetInnerHTML` | 同名 |

## 五、常见陷阱

| 错误写法 | 问题 | 正确写法 |
| --- | --- | --- |
| `let count = 0` 直接渲染 | 普通变量不响应 | `const count = ref(0)` |
| 组件函数体里写派生 `const d = a + b` | setup 只执行一次，d 永远是旧值 | `computed(() => a + b)` 或写进 JSX |
| `const { x } = props` 再渲染 | 闭包捕获旧 props | JSX 里读 `props.x` |
| `state = {...}`（reactive 整体重赋值） | 丢失代理 | 改属性，或用 `ref({...})` 后 `.value = {...}` |
| 事件里改普通变量 | 不触发更新 | 改 `ref.value` / `reactive` 属性 |
| `return function() {...}` | 渲染函数形态已废弃 | `return <JSX/>` |

## 六、内置组件对照

| React | ActView |
| --- | --- |
| `React.Fragment` / `<>...</>` | `Fragment` / `<>...</>` |
| `React.lazy` + `<Suspense>` | `lazy()` + `<Suspense>` |
| 错误边界（class 组件） | `<ErrorBoundary fallback={...}>` |
| `ReactDOM.createPortal` | `<Teleport to="...">` |
| —（无内置过渡） | `<Transition>` / `<TransitionGroup>` |
| —（无内置缓存） | `<KeepAlive>` |
