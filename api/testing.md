---
description: 测试工具 API：render、fireEvent、waitFor、screen、cleanup（@actview/testing）。
---

# 测试工具 {#testing}

`@actview/testing` 是组件测试工具，对齐 testing-library 的查询/触发/等待心智模型，配合 vitest + happy-dom 使用。

## render()

挂载组件，返回容器 + 查询辅助。

```ts
function render(
  component: any,
  options?: { container?: HTMLElement }
): RenderResult
```

```tsx
import { render } from '@actview/testing'
import { Counter } from './Counter'

const { getByText, getByClass, getByTestId, container, unmount } = render(Counter)
```

**查询辅助**（作用于容器）：

| 方法 | 说明 |
| --- | --- |
| `getByText` / `queryByText` | 文本匹配（`textContent.includes`）；get 找不到抛错、query 返回 null |
| `getAllByText` / `queryAllByText` | 全部文本匹配 |
| `getByClass` / `queryByClass` | class 选择器 |
| `getByTestId` / `queryByTestId` | `data-testid` 属性 |

## fireEvent()

触发 DOM 事件。

```ts
function fireEvent(
  el: Element | null,
  event: string,
  options?: { value?: string | number; bubbles?: boolean }
): void
```

```tsx
import { fireEvent } from '@actview/testing'

fireEvent(getByClass('btn'), 'click')                       // 点击
fireEvent(getByClass('ipt'), 'input', { value: 'actview' }) // 受控输入
```

`value` 选项会先设置 `el.value` 再派发，配合受控 input 的 `onInput={(e) => e.target.value}`。

## waitFor()

轮询执行断言（回调），直到通过或超时。

```ts
function waitFor(
  cb: () => void | Promise<void>,
  options?: { timeout?: number; interval?: number }
): Promise<void>
```

```tsx
import { waitFor } from '@actview/testing'

fireEvent(btn, 'click')
await waitFor(() => expect(getByText('count: 1')).not.toBeNull())
```

## screen

全局查询入口，作用于最近一次 `render` 的容器。

```tsx
import { screen } from '@actview/testing'

render(App)
screen.getByText('hello')      // 等价于 render 返回的 getByText
screen.queryByClass('hidden')
```

## cleanup()

卸载全部 `render` 挂载的组件（测试用例间清理）。

```ts
function cleanup(): void
```

```tsx
import { afterEach } from 'vitest'
import { cleanup } from '@actview/testing'

afterEach(cleanup)
```

## 完整示例

```tsx
import { describe, it, expect, afterEach } from 'vitest'
import { reactive } from 'actview'
import { render, fireEvent, waitFor, cleanup } from '@actview/testing'

afterEach(cleanup)

function Counter() {
  const state = reactive({ count: 0 })
  return (
    <button class="btn" onClick={() => state.count++}>
      count: {state.count}
    </button>
  )
}

it('点击按钮计数 +1', async () => {
  const { getByClass, getByText } = render(Counter)
  expect(getByText('count: 0')).not.toBeNull()

  fireEvent(getByClass('btn'), 'click')
  await waitFor(() => expect(getByText('count: 1')).not.toBeNull())
})
```

## 下一步

- [指南：测试](/guide/scaling-up/testing)
