---
description: Teleport：把内容渲染到指定 DOM 节点，脱离组件层级。
---

# Teleport {#teleport}

`Teleport` 可以把子内容渲染到组件树之外的任意 DOM 节点——常用于模态框、弹层、全局提示等需要脱离当前层级的场景。

## 基本用法

```tsx
import { Teleport } from 'actview'

export function Modal() {
  const open = ref(false)

  return (
    <div>
      <button onclick={() => (open.value = true)}>打开弹窗</button>

      {open.value && (
        <Teleport to="body">
          <div class="modal-mask">
            <div class="modal">
              <p>这是弹窗内容</p>
              <button onclick={() => (open.value = false)}>关闭</button>
            </div>
          </div>
        </Teleport>
      )}
    </div>
  )
}
```

`to` 指定目标容器：

| `to` 取值 | 行为 |
| --- | --- |
| 字符串选择器（`"body"`、`"#app"`） | `document.querySelector(to)` |
| DOM 元素 | 直接作为目标容器 |
| `null` / 未传 | 渲染在当前容器（内联） |

## 目标变化时自动迁移

`to` 是响应式的值时，目标容器变化后 Teleport 会把已挂载的 DOM **整体迁移**到新目标：

```tsx
const target = ref('body')

<Teleport to={target.value}>
  <p>我会跟着目标走</p>
</Teleport>
```

## 为什么不用普通嵌套

嵌套在组件树内的问题：CSS 层叠上下文、`overflow: hidden` 裁剪、`z-index` 层级被祖先限制。`Teleport` 把 DOM 挪到 `body` 等高层级节点，弹层不再受祖先样式影响，但**逻辑上仍然属于当前组件**（状态、事件、作用域都不变）。

## 下一步

- [Transition](./transition)：进入/离开过渡动画
- [KeepAlive](./keep-alive)：组件实例缓存
