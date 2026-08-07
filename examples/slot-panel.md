---
description: 插槽面板示例：children 默认插槽与具名插槽。
---

# 插槽面板 {#slot-panel}

演示 ActView 的插槽体系：`props.children` 默认插槽 + `<template slot="name">` 具名插槽。

## 在线体验

真实运行的组件——面板展示默认插槽内容与两个具名插槽：

<script lang="tsx">
export function PanelDemo(props: any) {
  return (
    <div class="av-demo">
      <header class="av-panel-title">
        {props.slots?.title?.() ?? '（无标题）'}
      </header>
      <main class="av-panel-body">{props.children}</main>
      <footer class="av-panel-footer">
        {props.slots?.footer?.() ?? ''}
      </footer>
    </div>
  )
}

export function SlotDemo() {
  return (
    <PanelDemo>
      <template slot="title">📌 公告</template>
      <p class="av-panel-text">这是一个面板示例，内容通过 children 传入。</p>
      <button onclick={() => alert('点击了面板按钮')}>操作</button>
      <template slot="footer">底部信息 —— footer 具名插槽</template>
    </PanelDemo>
  )
}
</script>

<style>
.av-demo {
  font-family: system-ui, -apple-system, sans-serif;
  padding: 16px;
  border: 1px solid var(--vp-c-border);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}
.av-panel-title {
  font-weight: bold;
  margin-bottom: 8px;
}
.av-panel-body {
  margin-bottom: 8px;
}
.av-panel-footer {
  font-size: 12px;
  opacity: 0.7;
}
.av-panel-text {
  margin: 0 0 8px;
}
.av-demo button {
  margin-right: 6px;
  padding: 6px 14px;
  font-size: 14px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-brand);
  color: #fff;
  cursor: pointer;
}
.av-demo button:hover {
  filter: brightness(1.1);
}
.av-demo input {
  padding: 6px 10px;
  font-size: 14px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}
</style>

<SlotDemo />

## 完整代码

::: code-group

```tsx [src/Panel.tsx]
export function Panel(props: any) {
  return (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' }}>
      <header style={{ fontWeight: 'bold', marginBottom: '8px' }}>
        {props.slots?.title?.() ?? '（无标题）'}
      </header>
      <main style={{ marginBottom: '8px' }}>{props.children}</main>
      <footer style={{ fontSize: '12px', color: '#64748b' }}>
        {props.slots?.footer?.() ?? ''}
      </footer>
    </div>
  )
}
```

```tsx [src/App.tsx]
import { Panel } from './Panel'

export function App() {
  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '480px' }}>
      <h1>插槽面板</h1>

      <Panel>
        {/* 具名插槽：template slot="名称" */}
        <template slot="title">📌 公告</template>

        {/* 默认插槽：直接写在标签内的内容 */}
        <p>这是一个面板示例，内容通过 children 传入。</p>
        <button onclick={() => alert('点击了面板按钮')}>操作</button>

        <template slot="footer">底部信息 —— footer 具名插槽</template>
      </Panel>
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

- **默认插槽** = `props.children`：标签内的任意 JSX；
- **具名插槽** = `<template slot="title">`：编译期转换为 `slots` prop，子组件用 `props.slots?.title?.()` 读取；
- 具名插槽缺失时用 `?? '默认内容'` 兜底；
- `Panel` 的 props 建议用 `any`（插槽结构由编译期约定），有需要可自行收敛类型。

## 相关文档

- [内容与插槽](../guide/components/slots)：三种插槽形式
- [组件基础](../guide/components/component-basics)：组件模型
