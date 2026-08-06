---
description: 应用实例 API：createApp 与 App.mount。
---

# 应用实例 {#application}

## createApp()

创建应用实例。

```ts
function createApp(rootComponent?: unknown): App
```

```tsx
import { createApp } from 'actview'
import { App } from './App'

createApp(App).mount('#app')
```

## App.mount()

把根组件渲染到指定容器（CSS 选择器）。

```ts
interface App {
  mount(container: string): void
}
```

```tsx
createApp(App).mount('#app')
```

行为：

- 通过 `document.querySelector(container)` 查找容器；
- 容器不存在时抛出错误 `[actview] createApp.mount: 找不到容器 …`；
- 挂载前清空容器内容（`innerHTML = ''`），然后 `render` 根组件 VNode。

```tsx
// 根组件也可以是任意函数组件或 defineComponent 产物
import { defineComponent } from 'actview'

const Root = defineComponent(() => {
  return () => <p>Hello</p>
})

createApp(Root).mount('#app')
```

## 与 render() 的关系

`createApp(root).mount('#app')` 等价于：

```tsx
import { render } from '@actview/core'

render(根组件VNode, document.querySelector('#app'))
```

## 下一步

- [组合式 API](./composition-api)：`defineComponent` 与生命周期钩子
- [渲染函数与 JSX](./render-function)：`render` / `patch` / `unmount`
