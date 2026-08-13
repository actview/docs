---
description: KeepAlive：缓存组件实例与 DOM，切换时避免销毁重建。
---

# KeepAlive {#keep-alive}

`KeepAlive` 缓存被包裹组件的**实例与 DOM**：切换到其他组件时，缓存组件不会被销毁（`setup` 不会重新执行、状态不会丢失），切回时直接恢复。

## 基本用法

结合条件渲染切换组件：

```tsx
import { ref, KeepAlive } from 'actview'

export function Tab() {
  const tab = ref<'a' | 'b'>('a')

  return (
    <div>
      <nav>
        <button onclick={() => (tab.value = 'a')}>标签 A</button>
        <button onclick={() => (tab.value = 'b')}>标签 B</button>
      </nav>

      <KeepAlive>
        {tab.value === 'a' ? <CompA /> : <CompB />}
      </KeepAlive>
    </div>
  )
}
```

`CompA` 的输入框内容、内部状态在切换后都会保留——实例与 DOM 被缓存而非销毁重建。

::: tip 缓存键
默认以子组件的 `key`（或组件类型）作为缓存键。多个不同组件切换时，为每个子节点提供稳定的 `key` 可以避免缓存互相覆盖：

```tsx
<KeepAlive>
  {tab.value === 'a' ? <CompA key="a" /> : <CompB key="b" />}
</KeepAlive>
```
:::

## 机制

1. 首次渲染：子组件正常挂载，同时被打上缓存标记；
2. 切换离开：DOM 移入隐藏容器（`document.createElement('div')`），**实例与 effect 保留**——隐藏期间仍响应式更新；
3. 切换回来：命中缓存 → 更新 props → DOM 移回挂载容器 → 复用原实例更新；
4. `KeepAlive` 自身卸载时：清空缓存并真正卸载所有缓存实例。

## include / exclude / max

按组件名过滤缓存、限制缓存上限：

```tsx
<KeepAlive include="CompA,CompB" exclude={/Temp/} max={10}>
  {tab.value === 'a' ? <CompA key="a" /> : <CompB key="b" />}
</KeepAlive>
```

- `include`：仅缓存匹配（组件名）的组件
- `exclude`：排除匹配的组件
- `max`：最大缓存数，超出 LRU 淘汰最旧

> 组件名来自 `defineComponent(fn, name)` 第二参数，或 Babel 从函数名/变量名自动传递。

## activated / deactivated 钩子

缓存组件激活（恢复）与失活（移入缓存）时触发：

```tsx
import { onActivated, onDeactivated } from 'actview'

export function CompA() {
  onActivated(() => console.log('从缓存恢复'))
  onDeactivated(() => console.log('移入缓存'))
  return <div>A</div>
}
```

## 注意事项

- 子组件必须是**单根元素**（`Fragment` 多根不支持）；
- 缓存的是实例级状态（`ref` / `reactive`），模块级状态本就全局共享，不受影响；
- 与 `Transition` 组合使用时，`unmount` 会识别 `__keepAlive` 分支，缓存与动画互不冲突。

## 下一步

- [Transition](./transition)：进入/离开过渡
- [异步组件](../components/async)：`lazy` + `Suspense`
