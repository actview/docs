---
description: 渲染函数与 JSX API：jsx、createElement、render、patch、unmount。
---

# 渲染函数与 JSX {#render-function}

## JSX 运行时（@actview/jsx）

`"jsxImportSource": "@actview/jsx"` 时，JSX 编译为对这些函数的调用。

```ts
function jsx(type, props, maybeKey?): VNode
function jsxs(type, props, maybeKey?): VNode
function jsxDEV(type, props, maybeKey?): VNode
```

```tsx
// <div class="card">hello</div>
jsx('div', { class: 'card', children: 'hello' })
```

## createElement()

经典形式的元素创建。

```ts
function createElement(type, config, ...children): VNode
```

```tsx
import { createElement } from '@actview/jsx'

createElement('p', { class: 'hi' }, 'hello')
createElement(MyComponent, { name: 'a' }, child1, child2)
```

## Fragment

片段组件：渲染多个根节点（不透传属性）。

```tsx
import { Fragment } from '@actview/jsx'

function List() {
  return (
    <Fragment>
      <li>一</li>
      <li>二</li>
    </Fragment>
  )
}
```

## isValidElement()

判断一个值是否为 VNode。

```ts
function isValidElement(obj): boolean
```

```tsx
import { isValidElement, jsx } from '@actview/jsx'

isValidElement(jsx('div', {})) // true
isValidElement({})             // false
```

## render()

把 VNode 渲染（挂载/更新）到容器。

```ts
function render(vnode, container: Element): void
```

```tsx
import { render } from '@actview/core'

render(jsx('p', { children: 'hello' }), document.body)
```

## patch()

对已有 VNode 树做 diff 更新。

```ts
function patch(oldVNode, newVNode, container: Element, index?): void
```

```tsx
import { render, patch } from '@actview/core'

const oldVNode = jsx('p', { children: '旧' })
render(oldVNode, container)

const newVNode = jsx('p', { children: '新' })
patch(oldVNode, newVNode, container) // 精确更新文本
```

diff 规则：`type` 与 `key` 相同 → 复用 `el` 递归更新；否则替换。

## unmount()

卸载 VNode（移除 DOM，组件走完整卸载流程：`beforeUnmount` → effect stop → `unmounted`）。

```ts
function unmount(vnode, container?, index?): void
```

## nextTick()

等待本轮响应式更新（微任务 flush）完成。

```ts
function nextTick<T = void>(cb?: () => T): Promise<T | void>
```

```tsx
import { ref, nextTick } from 'actview'

const count = ref(0)
count.value++
await nextTick()
```

## 手动渲染示例

脱离组件树手动控制挂载与更新：

```tsx
import { ref, render, patch, nextTick } from '@actview/core'
import { jsx } from '@actview/jsx'

const container = document.querySelector('#app')!

const count = ref(0)
let vnode = jsx('p', { children: `计数：${count.value}` })
render(vnode, container)

// 手动响应：数据变化 → 生成新 VNode → patch
count.value++
const newVnode = jsx('p', { children: `计数：${count.value}` })
patch(vnode, newVnode, container)
vnode = newVnode
```
