---
description: Transition：单个元素的进入/离开过渡动画。
---

# Transition {#transition}

`Transition` 为**单个子节点**的插入与移除播放进入/离开过渡动画。

## 基本用法

```tsx
import { ref, Transition } from 'actview'

export function Fade() {
  const show = ref(true)

  return (
    <div>
      <button onclick={() => (show.value = !show.value)}>切换</button>
      <Transition name="fade">
        {show.value && <p>我会有淡入淡出效果</p>}
      </Transition>
    </div>
  )
}
```

配合 CSS：

```css
/* 进入 */
.fade-enter-from { opacity: 0; }
.fade-enter-active { transition: opacity 0.3s; }
.fade-enter-to { opacity: 1; }

/* 离开 */
.fade-leave-from { opacity: 1; }
.fade-leave-active { transition: opacity 0.3s; }
.fade-leave-to { opacity: 0; }
```

`name` prop 决定类名前缀：进入类为 `{name}-enter-from` / `{name}-enter-active` / `{name}-enter-to`，离开类为 `{name}-leave-from` / `{name}-leave-active` / `{name}-leave-to`。未传 `name` 时使用默认前缀 `v-`。

## 机制

- **进入**：节点插入 DOM 后 → 加 `enter-from` + `enter-active` → 双 `requestAnimationFrame` 后切到 `enter-to` → 监听 `transitionend`（或时长兜底）→ 清理过渡类；
- **离开**：加 `leave-from` + `leave-active` → 双 rAF 后切到 `leave-to` → 等 `transitionend` 或兜底 → **移除 DOM**。

## 指定时长

通过 `duration`（毫秒）显式指定过渡时长，不依赖 CSS 读取：

```tsx
<Transition name="fade" duration={300}>
  {show.value && <p>内容</p>}
</Transition>
```

未指定时读取元素生效的 CSS `transition-duration`；两者都为 0（无过渡样式）时动画立即完成。

## 限制

- **仅支持单个子节点**：传入多个节点时会警告并取第一个；
- **无 `mode`**（`out-in` / `in-out`）：旧节点与节点切换时，新节点直接挂载、旧节点播放离开动画后延迟移除，二者可能同时存在；
- 无 `TransitionGroup` 列表过渡。

## 下一步

- [Teleport](./teleport)：把内容渲染到组件树之外
- [KeepAlive](./keep-alive)：缓存组件实例避免重建
