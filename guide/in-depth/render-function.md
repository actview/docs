---
description: 渲染函数与 JSX API：jsx / createElement / Fragment 与手动渲染。
---

# 渲染函数与 JSX {#render-function}

JSX 是 `jsx()` 函数的语法糖。在绝大多数场景你只需要写 JSX；理解背后的 API 有助于排查问题、编写工具函数，或构建自己的渲染管线。

## JSX 运行时：`@actview/jsx`

`tsconfig.json` 中 `"jsx": "react-jsx"` + `"jsxImportSource": "@actview/jsx"` 会让编译器把 JSX 编译为对 `@actview/jsx` 的调用：

```tsx
// 源码
<div class="card">hello</div>

// 编译产物（示意）
jsx('div', { class: 'card', children: 'hello' })
```

`@actview/jsx` 导出的 API：

| API | 说明 |
| --- | --- |
| `jsx(type, props, key?)` | automatic JSX 运行时入口 |
| `jsxs(type, props, key?)` | 同上（编译器对多子节点用 `jsxs` 优化标记） |
| `jsxDEV(type, props, key?)` | 开发模式入口（`jsx-runtime` / `jsx-dev-runtime` 两个子路径导出） |
| `createElement(type, props, ...children)` | 经典形式 |
| `isValidElement(obj)` | 判断是否为 ActView VNode |
| `Fragment` | 片段组件（`Symbol.for('react.fragment')`） |

所有入口都返回 VNode：

```tsx
import { createElement, Fragment, isValidElement } from '@actview/jsx'

const vnode = createElement('p', { class: 'hi' }, 'hello')
isValidElement(vnode) // true

// Fragment：渲染多个根节点（不透传属性）
function List() {
  return (
    <Fragment>
      <li>一</li>
      <li>二</li>
    </Fragment>
  )
}
```

::: tip 组件引用
VNode 的 `type` 可以是：标签字符串（原生元素）、`Fragment` symbol、组件对象（`{ __setup }`）。JSX 中 PascalCase 标签会被解析为组件引用。
:::

## 手动渲染：`render` / `patch` / `unmount`

`@actview/core` 导出渲染器底层 API：

```ts
import { render, patch, unmount } from '@actview/core'

// 把 VNode 渲染进容器
render(vnode, container)

// diff 更新：patch(旧 VNode, 新 VNode, 容器)
patch(oldVNode, newVNode, container)

// 卸载
unmount(vnode)
```

`createApp` 是 `render` 的封装：

```tsx
import { createApp } from 'actview'

createApp(App).mount('#app')
// 等价于：
// render(组件 VNode, document.querySelector('#app'))
```

## 什么时候需要手写渲染函数

- 编写**工具库/渲染器扩展**（如自定义内置组件、动态渲染引擎）；
- 在非组件上下文手动控制挂载/卸载；
- 测试响应式系统（脱离组件直接 `render` + 修改数据断言 DOM）。

大多数应用代码用 JSX 即可，无需直接调用这些 API。

## props 的真相

组件收到的 props **全量进入 `setup`**（`key`/`ref` 除外），框架**不自动透传**。根元素上的属性完全由组件自己的 render 决定——要把外部的 `class`/`style` 等落到根元素，组件需显式 `{...props}` 展开。

## nextTick

`nextTick(cb?)` 返回本轮响应式更新 flush 结束后的 Promise：

```tsx
import { ref, nextTick } from 'actview'

const count = ref(0)
count.value++
await nextTick() // DOM 已更新
```

## 下一步

- [渲染机制](./rendering-mechanism)：patch 与 diff 的完整流程
- [响应式原理](./reactivity-in-depth)：track / trigger / 批处理
