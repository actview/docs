---
description: 秒表示例：生命周期钩子与定时器清理。
---

# 秒表 {#stopwatch}

演示生命周期钩子的典型用法：`onMounted` 启动定时器、`onUnmounted` 清理——组件卸载后不留定时器泄漏。

## 代码

::: code-group

```tsx [src/App.tsx]
import { ref, onMounted, onUnmounted } from 'actview'

export function App() {
  const elapsed = ref(0)
  const running = ref(false)
  let timer: number | undefined

  function start() {
    if (running.value) return
    running.value = true
    timer = window.setInterval(() => elapsed.value++, 1000)
  }

  function stop() {
    running.value = false
    window.clearInterval(timer)
  }

  function reset() {
    stop()
    elapsed.value = 0
  }

  // setup 期间注册：组件挂载/卸载时自动执行
  onMounted(() => console.log('秒表已挂载'))
  onUnmounted(() => {
    // 组件被移除（如条件渲染切换）时清理定时器
    window.clearInterval(timer)
    console.log('秒表已卸载，定时器已清理')
  })

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <h1>秒表</h1>
      <p style={{ fontSize: '48px', margin: '16px 0' }}>{elapsed.value} 秒</p>
      <div>
        {!running.value ? (
          <button onclick={start}>开始</button>
        ) : (
          <button onclick={stop}>暂停</button>
        )}
        <button onclick={reset}>重置</button>
      </div>
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

- `onMounted` / `onUnmounted` 只能在组件 setup（函数体）中注册，且注册进组件自身的 `EffectScope`；
- 定时器等外部资源在 `onUnmounted` 中清理，避免组件移除后定时器继续运行；
- 用「运行状态」切换开始/暂停按钮，是典型的条件渲染（`&&` / 三元）用法。

## 相关文档

- [生命周期](../guide/essentials/lifecycle)：四个钩子与清理场景
- [条件渲染](../guide/essentials/conditional)：按钮切换
