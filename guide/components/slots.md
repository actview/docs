---
description: 内容与插槽：默认插槽 children、具名插槽、作用域插槽。
---

# 内容与插槽 {#slots}

ActView 的插槽体系对应 Vue 的三类插槽，但全部基于 JSX：

| 概念 | ActView 实现 |
| --- | --- |
| 默认插槽 | `props.children` |
| 具名插槽 | `<template slot="name">` → `props.slots.name()` |
| 作用域插槽 | 函数 children：`props.children?.(scope)` |

## 默认插槽：`children`

在组件标签内写的内容会作为 `children` 传给组件：

```tsx
// src/Panel.tsx —— 子组件
export function Panel(props: { title?: string }) {
  return (
    <div class="panel">
      <h3>{props.title}</h3>
      <div class="panel-body">{props.children}</div>
    </div>
  )
}
```

```tsx
// src/App.tsx —— 父组件
import { Panel } from './Panel'

export function App() {
  return (
    <Panel title="公告">
      <p>这里是面板内容，任意 JSX 都可以。</p>
      <button>操作按钮</button>
    </Panel>
  )
}
```

`children` 可以是任意 JSX——文本、元素、表达式，甚至组件：

```tsx
<Panel title="列表">
  {items.map((item) => (
    <li key={item.id}>{item.name}</li>
  ))}
</Panel>
```

## 具名插槽：`<template slot="name">`

使用 `<template slot="名称">` 标记插槽内容，子组件通过 `props.slots?.名称?.()` 读取（编译期转换为 `slots` prop）：

```tsx
// src/Card.tsx —— 子组件
export function Card(props: any) {
  return (
    <div class="card">
      <header>{props.slots?.header?.() ?? '默认标题'}</header>
      <main>{props.children}</main>
      <footer>{props.slots?.footer?.() ?? ''}</footer>
    </div>
  )
}
```

```tsx
// 父组件
<Card>
  <template slot="header">卡片头部</template>
  卡片主体内容
  <template slot="footer">底部信息</template>
</Card>
```

## 作用域插槽：函数 children（render-prop）

把 **children 传成函数**，子组件调用时传入作用域数据，这就是「作用域插槽」：

```tsx
// src/ItemList.tsx —— 子组件
export function ItemList(props: {
  items: string[]
  children?: (scope: { item: string; index: number }) => any
}) {
  return (
    <ul>
      {props.items.map((item, index) => (
        <li key={index}>{props.children?.({ item, index })}</li>
      ))}
    </ul>
  )
}
```

```tsx
// 父组件
<ItemList items={['苹果', '香蕉', '樱桃']}>
  {(scope) => (
    <b>
      {scope.index}. {scope.item}
    </b>
  )}
</ItemList>
```

要点：

- 子组件**决定何时调用** children 函数、传入什么作用域数据；
- children 为可选时用 `?.()` 调用并给兜底渲染；
- 作用域数据来自子组件的状态，父组件可以自由决定如何渲染每一项。

## 组合：具名 + 作用域

具名插槽的内容也可以是函数（通过 `template slot` + 函数子节点传递作用域数据）。实际项目中更常用的组合是「默认 children 函数 + 具名 slots」：

```tsx
export function DataTable(props: any) {
  return (
    <table>
      <thead>{props.slots?.columns?.()}</thead>
      <tbody>
        {props.rows?.map((row: any, i: number) => (
          <tr key={i}>{props.children?.({ row, i })}</tr>
        ))}
      </tbody>
    </table>
  )
}
```

## 下一步

- [组件基础](./component-basics)：组件模型与 props 透传
- [异步组件](./async)：`lazy` + `Suspense` 懒加载
