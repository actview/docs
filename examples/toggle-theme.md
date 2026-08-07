---
description: 主题切换示例：类样式绑定与 Transition 过渡。
---

# 主题切换 {#toggle-theme}

用 `ref` + 类样式绑定实现浅色/深色主题切换，`Transition` 为内容切换添加过渡动画。

## 在线体验

真实运行的组件——点击按钮切换主题，内容带有淡入淡出过渡：

<script lang="tsx">
import { ref, Transition } from 'actview'

const dark = ref(false)

export function ThemeDemo() {
  return (
    <div
      class={dark.value ? 'av-theme av-theme-dark' : 'av-theme av-theme-light'}
      style={{
        fontFamily: 'system-ui, sans-serif',
        padding: '16px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        minHeight: '96px'
      }}
    >
      <h3 style={{ marginTop: 0 }}>主题切换</h3>
      <button onclick={() => (dark.value = !dark.value)}>
        切换到{dark.value ? '浅色' : '深色'}主题
      </button>

      <Transition name="av-fade">
        <p key={dark.value ? 'dark' : 'light'} style={{ marginBottom: 0 }}>
          当前主题：{dark.value ? '🌙 深色' : '☀️ 浅色'}
        </p>
      </Transition>
    </div>
  )
}
</script>

<ThemeDemo />

<style>
.av-theme {
  transition: background 0.3s, color 0.3s;
}
.av-theme-light {
  background: #ffffff;
  color: #1e293b;
}
.av-theme-dark {
  background: #1e293b;
  color: #f8fafc;
}
.av-theme-dark button {
  background: #334155;
  color: #f8fafc;
  border: 1px solid #475569;
}
.av-fade-enter-from,
.av-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
.av-fade-enter-active,
.av-fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.av-fade-enter-to,
.av-fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
</style>

## 完整代码

::: code-group

```tsx [src/App.tsx]
import { ref, Transition } from 'actview'

export function App() {
  const dark = ref(false)

  return (
    <div
      class={dark.value ? 'theme theme-dark' : 'theme theme-light'}
      style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', padding: '24px' }}
    >
      <h1>主题切换</h1>

      <button onclick={() => (dark.value = !dark.value)}>
        切换到{dark.value ? '浅色' : '深色'}主题
      </button>

      <Transition name="fade">
        <p key={dark.value ? 'dark' : 'light'} style={{ marginTop: '16px' }}>
          当前主题：{dark.value ? '🌙 深色' : '☀️ 浅色'}
        </p>
      </Transition>
    </div>
  )
}
```

```tsx [src/main.tsx]
import { createApp } from 'actview'
import { App } from './App'

createApp(App).mount('#app')
```

```css [src/style.css]
.theme {
  transition: background 0.3s, color 0.3s;
}
.theme-light {
  background: #ffffff;
  color: #1e293b;
}
.theme-dark {
  background: #1e293b;
  color: #f8fafc;
}

/* Transition name="fade" 的过渡类 */
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-to,
.fade-leave-from {
  opacity: 1;
  transform: translateY(0);
}
```

:::

## 要点

- 主题通过 `class` 拼接切换：`'theme theme-dark'` / `'theme theme-light'`，样式集中在 CSS 中；
- `Transition` 需要**子节点 key 变化**才能触发离开/进入动画（这里用 `key={dark.value ? 'dark' : 'light'}`）；
- 无过渡样式（`transition-duration` 为 0）时动画立即完成，所以 CSS 里要给 `.theme` 加过渡。

## 相关文档

- [类与样式绑定](../guide/essentials/class-and-style)：条件类名
- [Transition](../guide/built-ins/transition)：过渡类与 duration
