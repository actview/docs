---
description: 从 Vue 迁移到 ActView：响应式 API 一一对应，模板指令转 JSX 表达式。
---

# 从 Vue 迁移 {#from-vue}

如果你熟悉 Vue 3，ActView 的**响应式 API 几乎一一对应**（`reactive` / `ref` / `computed` / `watch` 同名同义）。最大的不同在于**视图层**：Vue 用模板语法（`v-if` / `v-for`），ActView 用 JSX。

## 一、核心差异：模板 → JSX

| | Vue 3 | ActView |
| --- | --- | --- |
| 视图 | 模板（`v-if` / `v-for` / `v-model`） | JSX（原生 JS 表达式） |
| 组件定义 | SFC / `defineComponent({ setup })` | 函数组件 / `defineComponent(setup)` |
| 组件属性 | `props` 声明 + `emits` 声明 | TS 类型 + props 回调函数 |
| 未声明属性 | 自动 attrs 透传 | 显式 `{...props}` 透传 |
| 双向绑定 | `v-model` | `value` + `onInput` |

## 二、几乎一样的地方（响应式 / 组合式）

响应式 API **同名同义**，迁移时基本不用改：

```ts
import { reactive, ref, computed, watch, watchEffect } from 'actview'  // 同 Vue

const count = ref(0)                    // 同 Vue
const state = reactive({ list: [] })    // 同 Vue
const double = computed(() => count.value * 2)  // 同 Vue
watch(count, (n, o) => {})              // 同 Vue
```

组合式 API 与生命周期钩子也一一对应：

| Vue 3 | ActView |
| --- | --- |
| `setup()` | 函数组件体（`setup` 即组件函数体） |
| `onMounted` / `onUpdated` / `onBeforeUnmount` / `onUnmounted` | 同名 |
| `onBeforeMount` / `onActivated` / `onDeactivated` / `onErrorCaptured` | 同名 |
| `provide` / `inject` | `provide` / `useInjects` |
| `nextTick` | `nextTick` |
| `computed` / `watch` / `watchEffect` | 同名 |

## 三、模板指令 → JSX 表达式

| Vue 模板 | ActView JSX |
| --- | --- |
| `v-if="ok"` | `{ok && <div/>}` |
| `v-if="ok" v-else` | `{ok ? <A/> : <B/>}` |
| `v-for="item in items" :key="item.id"` | `{items.map(item => <li key={item.id}>{item}</li>)}` |
| `v-bind:title="t"` / `:title="t"` | `title={t}` |
| `v-on:click="fn"` / `@click="fn"` | `onClick={fn}` |
| `v-model="text"` | `value={text.value} onInput={(e) => text.value = e.target.value}` |
| `v-show="ok"` | `style={{ display: ok ? '' : 'none' }}` |
| `v-html="html"` | `dangerouslySetInnerHTML={{ __html: html }}` |
| `<slot />` | `{props.children}` |
| `#header="scope"` | `props.slots.header(scope)` |

### 组件示例

```vue
<!-- Vue SFC -->
<template>
  <button :class="{ active: isActive }" @click="toggle">
    {{ label }}：{{ count }}
  </button>
</template>
<script setup>
import { ref, computed } from 'vue'
const props = defineProps({ label: String })
const emit = defineEmits(['toggle'])
const count = ref(0)
const isActive = computed(() => count.value > 0)
function toggle() { count.value++; emit('toggle', count.value) }
</script>
```

```tsx
// ActView（等价）
export type BtnProps = { label: string; onToggle?: (n: number) => void }
export function Btn(props: BtnProps) {
  const count = ref(0)
  const isActive = computed(() => count.value > 0)
  function toggle() {
    count.value++
    props.onToggle?.(count.value)
  }
  return (
    <button class={isActive.value ? 'active' : ''} onClick={toggle}>
      {props.label}：{count.value}
    </button>
  )
}
```

## 四、需要转换的地方

### 1. props 声明 → TS 类型 + 回调

```tsx
// Vue：props 声明 + emits
defineProps({ label: String })
const emit = defineEmits(['change'])

// ActView：TS 类型 + props 回调函数
export type BtnProps = { label: string; onChange?: (v: string) => void }
function Btn(props: BtnProps) {
  return <button onClick={() => props.onChange?.('x')}>{props.label}</button>
}
```

没有 `emits` 概念——子组件通知父组件，就是父组件传一个回调函数 prop。

### 2. 双向绑定：v-model → value + onInput

```tsx
// Vue
<input v-model="text" />

// ActView
<input value={text.value} onInput={(e) => (text.value = e.target.value)} />
```

### 3. 未声明属性：自动透传 → 显式 {...props}

```tsx
// Vue：class/style 自动落到根元素
<MyBtn class="btn-primary" />

// ActView：props 全量进 setup，需要显式透传
function MyBtn(props: any) {
  return <button {...props}>点我</button>
}
```

### 4. Options API → 组合式

```tsx
// Vue Options API
export default {
  data() { return { count: 0 } },
  computed: { double() { return this.count * 2 } },
  methods: { inc() { this.count++ } }
}

// ActView（组合式，无 Options API）
export function Counter() {
  const count = ref(0)
  const double = computed(() => count.value * 2)
  const inc = () => count.value++
  return <div>{double.value}<button onClick={inc}>+1</button></div>
}
```

### 5. 内置组件

| Vue 3 | ActView |
| --- | --- |
| `<Teleport to="...">` | `<Teleport to="...">` |
| `<Transition name="fade">` | `<Transition name="fade">`（支持 `mode` / `appear` / JS 钩子） |
| `<TransitionGroup name="list">` | `<TransitionGroup name="list">` |
| `<KeepAlive include="A">` | `<KeepAlive include="A">`（支持 `include`/`exclude`/`max`） |
| `<Suspense>` | `<Suspense>`（支持异步 setup） |
| `defineAsyncComponent` | `lazy(() => import(...))` |

## 五、需要注意的差异

| 差异 | 说明 |
| --- | --- |
| 无模板 / 无 SFC | 视图全是 JSX，`v-if` 等指令用 JS 表达式 |
| 无 Options API | 只有组合式 `setup` |
| 无 `emits` | 用 props 回调函数 |
| 无 attrs 自动透传 | 显式 `{...props}` |
| 无 `v-model` | `value` + `onInput` |
| ref 不自动解包 | `reactive({ n: ref(1) }).n` 是 ref 本体，需 `.value` |
| 无 `customRef` / `shallowReadonly` 之外的部分 API | 见 [API 参考](/api/reactivity-core) |

## 六、常见陷阱

| 错误写法 | 问题 | 正确写法 |
| --- | --- | --- |
| `const { x } = props` 再渲染 | setup 只执行一次，闭包捕获旧值 | JSX 里读 `props.x` |
| `state = {...}`（reactive 整体重赋值） | 丢失代理 | 改属性，或 `ref({...})` 后 `.value = {...}` |
| `v-if` / `v-for` | JSX 里没有这些指令 | `&&` / 三元 / `map` |
| `emit('x')` | 无 emits | 父组件传 `onX` 回调 |

## 下一步

- [从 React 迁移](./from-react)
- [快速上手](../quick-start)
- [响应式基础](../essentials/reactivity)
