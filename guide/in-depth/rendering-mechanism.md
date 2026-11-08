---
description: 深入渲染机制：VNode、patch 与 diff 的工作原理。
---

# 渲染机制 {#rendering-mechanism}

理解 ActView 的渲染机制只需要一句话：

> **组件 = 响应式 effect 包裹的一个 `render()` 函数**。

`render()` 读取响应式数据生成 VNode；effect 在数据变化时自动重跑 `render + patch`，把新旧 VNode 树 diff 成最小 DOM 操作。

```
数据变化 → trigger → 组件 effect 重跑
                     ├─ render()  读取数据 → 生成新 VNode 树
                     └─ patch()   新旧 VNode diff → 更新真实 DOM
```

## VNode

JSX 编译产物（`jsx()` 调用）就是 VNode——一个与 React 形状兼容的普通对象：

```ts
{
  $$typeof: Symbol.for('react.element'),
  type,        // 标签字符串 | Fragment symbol | 组件对象（{ __setup }）
  key,         // 列表复用标识
  ref,
  props        // 属性 + children
}
```

`type` 决定 diff 策略，`key` 决定列表复用，`el` 字段（挂载后填充）是 VNode 与真实 DOM 之间的桥——patch 复用时通过 `el` 找到旧节点，只改属性/children 而不是重建。

## patch：四种情况

`patch(oldVNode, newVNode, container)` 是 diff 的唯一入口：

| 情况 | 策略 |
| --- | --- |
| `oldVNode == null` | 挂载：创建 DOM 并插入容器 |
| `newVNode == null` | 卸载 |
| `type` 与 `key` 都相同 | 更新：复用 `el`，递归 diff props / children |
| 其余 | 替换：`replaceChild` 换掉旧节点 |

更新时按 `type` 分派四种节点：**组件**（`{ __setup }` 对象）、**文本**、**Fragment**、**原生元素**。

## 组件更新（patchComponent）

props 用**普通对象**，由父组件显式调度更新（这是关键设计决策，见下）：

1. 父组件重渲染 → 生成带新 props 的子组件 VNode；
2. `patchComponent` 对比新旧 props：
   - 相同 → 复用旧实例，什么都不做；
   - 不同 → `updateProps` 增量写入，值有变化 → 调用 `instance.update()`；
3. 子组件 effect 重跑 → 子 `render()` 读到新 props → 子 patch → DOM 精确更新。

**`setup` 在整个生命周期只执行一次**：props 更新走 `update()` 而不是重新挂载，因此子组件的内部状态与 DOM 全部复用。

::: details 为什么 props 不用 reactive？
第一版用 `reactive` 包装 props，踩到严重的 effect 递归问题：`patchComponent` 对比时读取 `instance.props` 会把**父 effect** 误收集进子 props 的依赖；写入新值时 `trigger` 出父 effect → 父 effect 递归重入 → 子组件莫名重挂。修复方案就是 props 用普通对象 + 父组件显式调用 `update()`——这也是 Vue 的做法。
:::

## keyed diff

新列表出现 `key` 时启用 keyed diff（否则退回同索引 diff）：

1. 建立「旧 key → index」映射；
2. 遍历新列表：key 命中 → patch 复用；未命中 → 先创建；
3. 卸载未复用的旧节点；
4. 按新顺序 `appendChild` 重排（对已挂载节点是"移动"）。

依赖的关键事实：`appendChild` 一个已挂载节点 = 移动它。因此「先 patch 复用，再整体按新顺序 append」能以最少操作完成增删重排，组件节点同样适用（复用旧实例，只改位置）。

## 属性更新

`patchProps` 先删除旧 props 中已不存在的属性，再设置/更新新 props。`setProp` 按属性类型分派：

| 属性 | 处理 |
| --- | --- |
| `on*` 事件 | `addEventListener` + invoker（见下） |
| `class` / `className` | `el.className` |
| `style` | 字符串走 `cssText`，对象 `Object.assign(el.style, …)` |
| `value` / `checked` / `disabled` / `readonly` | 走 property（受控 input 保留光标） |
| 其余 | `setAttribute` / `removeAttribute` |

### 事件：invoker 模式

同一元素同一事件只 `addEventListener` 一次，handler 更新时只替换内部 `invoker.value`；传 `null` / `undefined` 时解绑。事件名规则：`onClick` → `click`、`onClickCapture` → `click` + capture，最终统一转小写。

## 挂载流程（mountComponent）

```
1. 创建实例：props 拷贝为普通对象，scope = new EffectScope()
2. setCurrentInstance(instance) → setup(props) → 返回 render
3. update()：render() → patch(旧子树, 新子树) → 触发 updated / mounted
4. runEffect(update, { scheduler: queueJob }) → 立即执行首次挂载
5. invokeHooks(mounted)
```

- render effect 注册进组件 scope，卸载时自动停止；
- 首次渲染后进入 `mounted` 态，之后每次重渲染触发 `updated`；
- `onMounted` 由子组件先于父组件触发（同步挂载顺序，与 Vue 3 相反）。

## 卸载

`unmount` 依次：`beforeUnmount` 钩子 → 停止 scope 内全部 effect（render effect + setup 期间的 watch/computed）→ `unmounted` 钩子。卸载时识别 `__keepAlive` 缓存分支与 Teleport / Transition 分支，分别处理。

## 下一步

- [响应式原理](./reactivity-in-depth)：track / trigger / 批处理如何驱动渲染
- [渲染函数与 JSX](./render-function)：手动调用 `render` / `patch`
