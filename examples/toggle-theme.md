---
description: 主题切换示例：类样式绑定与 Transition 过渡。
---

# 主题切换 {#toggle-theme}

用 `ref` + 类样式绑定实现浅色/深色主题切换，`Transition` 为内容切换添加过渡动画。

## 在线体验

真实运行的组件——点击按钮切换主题，内容带有淡入淡出过渡：

<script lang="tsx">
import { ref, Transition } from 'actview'

export function ThemeDemo() {
  const dark = ref(false)

  return (
    <div
      class={dark.value ? 'av-theme av-theme-dark' : 'av-theme av-theme-light'}
    >
      <h3 class="av-theme-title">主题切换</h3>
      <button onclick={() => (dark.value = !dark.value)}>
        切换到{dark.value ? '浅色' : '深色'}主题
      </button>

      <Transition name="av-fade">
        <p key={dark.value ? 'dark' : 'light'} class="av-theme-text">
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
  font-family: system-ui, -apple-system, sans-serif;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-border);
  min-height: 96px;
  transition: background 0.3s, color 0.3s;
}
/* 浅色态：跟随文档主题（dark/light 自适应） */
.av-theme-light {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}
/* 深色态：切换后的实际效果 */
.av-theme-dark {
  background: #1e293b;
  color: #f8fafc;
}
.av-theme-dark button {
  background: #334155;
  color: #f8fafc;
  border-color: #475569;
}
.av-theme-title {
  margin-top: 0;
}
.av-theme-text {
  margin-bottom: 0;
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
.av-theme button {
  margin-right: 6px;
  padding: 6px 14px;
  font-size: 14px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-brand);
  color: #fff;
  cursor: pointer;
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
      class={dark.value ? 'av-theme av-theme-dark' : 'av-theme av-theme-light'}
    >
      <h3 class="av-theme-title">主题切换</h3>
      <button onclick={() => (dark.value = !dark.value)}>
        切换到{dark.value ? '浅色' : '深色'}主题
      </button>

      <Transition name="av-fade">
        <p key={dark.value ? 'dark' : 'light'} class="av-theme-text">
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
.av-theme {
  font-family: system-ui, -apple-system, sans-serif;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--vp-c-border);
  min-height: 96px;
  transition: background 0.3s, color 0.3s;
}
.av-theme-light {
  background: var(--vp-c-bg-soft);
  color: var(--vp-c-text-1);
}
.av-theme-dark {
  background: #1e293b;
  color: #f8fafc;
}
.av-theme-dark button {
  background: #334155;
  color: #f8fafc;
  border-color: #475569;
}
.av-theme-title {
  margin-top: 0;
}
.av-theme-text {
  margin-bottom: 0;
}

/* Transition name="av-fade" 的过渡类 */
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
.av-theme button {
  margin-right: 6px;
  padding: 6px 14px;
  font-size: 14px;
  border: 1px solid var(--vp-c-border);
  border-radius: 6px;
  background: var(--vp-c-brand);
  color: #fff;
  cursor: pointer;
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
