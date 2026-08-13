# react和vue都有什么问题？

## React 的优势

React 最大的特点是 **JSX + JavaScript 编程模型**。开发者可以直接使用 JavaScript 表达式描述 UI，将 UI 看作状态的函数，逻辑组合能力强，同时 TypeScript 支持也比较完善。

## React 的不足

### 更新模型偏粗粒度

React 的更新以组件为基本单位，当状态变化时，会触发组件重新执行 render，然后通过 Fiber diff 找出需要更新的节点。虽然有虚拟 DOM 优化，但对于复杂组件树，仍然可能产生较多无效计算，需要借助 `memo`、`useMemo`、`useCallback` 等手段优化。

### Hooks 带来一定心智负担

Hooks 解决了函数组件状态管理问题，但也引入了一些规则和复杂性，例如：

- Hooks 调用顺序必须保持一致；
- 依赖数组容易出错；
- 闭包导致状态引用问题；
- 复杂逻辑需要拆分多个 hooks。

对大型项目维护要求较高。

## Vue 的优势

Vue 的核心优势是 **响应式系统**。

Vue3 基于 Proxy 实现细粒度依赖追踪，可以精确知道哪些状态影响哪些组件，当数据变化时，只更新相关组件和 DOM 节点，因此更新粒度更细，性能优化成本更低。

同时 Vue 提供了：

- 更直观的生命周期；
- 更明确的组件结构；
- 更简单的数据流模型。

整体学习成本和维护成本较低。

## Vue 的不足

### 模板语法和指令体系较多

Vue 提供了大量模板能力，例如 `v-if`、`v-for`、`v-model`、`computed`、`watch` 等。

这些语法降低了开发难度，但也增加了需要学习和记忆的内容，同时模板表达能力相比纯 JavaScript 有一定限制。

### 生态和 TypeScript 体验依赖工具链

Vue3 已经通过 Composition API 和 Volar 对 TypeScript 提供了较好的支持，但由于模板需要经过编译转换，部分场景下类型推导和 JavaScript 代码之间的一致性不如纯 JSX 直接。

## ActView 的设计目标

ActView 的设计目标是**结合 React 和 Vue 的优势**，解决两者在开发体验和更新模型上的不足。主要有以下几个特点：

### 1. JSX 驱动 UI，保持 JavaScript 原生表达能力

ActView 使用 JSX 作为 UI 描述方式，不引入额外模板语法。开发者可以直接使用 JavaScript 表达式描述 UI：

- 条件渲染使用 `if` / 三元表达式；
- 列表渲染使用原生 `map`；
- 事件绑定直接使用函数；
- 逻辑复用使用普通 JavaScript 函数。

相比模板语法，JSX 具有更强的表达能力，同时配合 TypeScript 可以获得完整的类型提示和编译期检查。

### 2. 编译时拆分组件，实现 setup 与 render 分离

不同于 React 函数组件每次 render 都重新执行整个组件函数，ActView 在构建阶段通过 Babel 插件对组件进行转换，将组件拆分为：

- **setup 阶段**：负责创建状态、初始化逻辑，仅在组件挂载时执行一次；
- **render 阶段**：负责根据当前状态生成 UI 描述，在首次渲染和依赖变化时执行。

例如：

```tsx
function Counter() {
  const count = ref(0)

  return () => (
    <button>{count.value}</button>
  )
}
```

编译后类似：

```tsx
defineComponent({
  setup() {
    const count = ref(0)

    return {
      render() {
        return <button>{count.value}</button>
      }
    }
  }
})
```

这样既保留了 React 函数组件的书写体验，又避免了组件函数重复执行带来的状态创建和逻辑初始化问题。

### 3. 基于响应式依赖追踪，实现组件级更新

ActView 使用类似 Vue 的响应式系统，通过依赖收集和触发机制追踪状态与 UI 的关系。当组件中的响应式数据发生变化：

```
state change
      ↓
触发对应组件 render
      ↓
生成新的 Virtual DOM
      ↓
diff
      ↓
更新真实 DOM
```

更新范围只限制在依赖该状态的组件内部，而不会导致父组件或无关子组件重新执行。

相比 React：

```
state update
      ↓
component render
      ↓
Fiber reconcile
      ↓
寻找变化节点
```

ActView 通过响应式依赖关系提前确定更新范围，减少无效 render。

### 4. 更低的组件开发心智负担

ActView 不需要：

- 手动管理 `useMemo`；
- 手动维护 `useCallback`；
- 频繁考虑 hooks 依赖数组；
- 为性能优化添加大量缓存代码。

开发者只需要关注：

- 定义状态；
- 描述 UI；
- 修改状态。

框架负责：

- 依赖收集；
- 更新调度；
- UI 重渲染；
- DOM diff。

让组件逻辑更加接近业务本身。

### 5. React 的开发体验 + Vue 的响应式模型

ActView 希望提供一种融合式开发体验：

| 维度 | React | Vue | ActView |
| --- | --- | --- | --- |
| UI 描述 | JSX | Template | JSX |
| 逻辑表达 | JavaScript | 模板 + JS | JavaScript |
| 状态系统 | Hooks | Reactive | Reactive |
| 更新粒度 | 组件 render | 依赖组件 | 依赖组件 |
| 状态初始化 | render 执行 | setup | setup |
| TS 支持 | 强 | 较强 | 强 |

## 总结

ActView 通过 JSX 保留 React 的灵活表达能力，通过编译时组件拆分结合响应式系统，引入 Vue 的细粒度更新模型。开发者可以使用熟悉的 JavaScript 方式编写 UI，同时享受自动依赖追踪带来的高性能更新和更低的维护成本。

## 项目地址

欢迎提交 [issue 和 PR](https://github.com/ALiuYiLin/actview)。
