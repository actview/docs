---
description: 使用 @actview/testing 测试组件：render / fireEvent / waitFor。
---

# 测试 {#testing}

`@actview/testing` 提供组件测试工具，配合 vitest + happy-dom 使用。

## 安装

```bash
pnpm add -D @actview/testing vitest happy-dom
```

## 编写测试

```tsx
// src/Counter.test.tsx
import { describe, it, expect, afterEach } from 'vitest'
import { reactive } from 'actview'
import { render, fireEvent, waitFor, cleanup } from '@actview/testing'
import { Counter } from './Counter'

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

## 核心 API

| API | 说明 |
| --- | --- |
| `render(Component)` | 挂载，返回容器 + 查询辅助（`getByText`/`getByClass`/`getByTestId` 等） |
| `fireEvent(el, event, opts?)` | 触发 DOM 事件（`{ value }` 设置 input 值） |
| `waitFor(cb)` | 轮询等待异步更新 |
| `screen` | 全局查询（最近 render） |
| `cleanup()` | 卸载全部（`afterEach` 调用） |

## 查询辅助

| 方法 | 说明 |
| --- | --- |
| `getByText` / `queryByText` | 文本匹配（get 找不到抛错、query 返回 null） |
| `getByClass` / `queryByClass` | class 选择器 |
| `getByTestId` / `queryByTestId` | `data-testid` 属性 |

## 测试受控输入

```tsx
fireEvent(input, 'input', { value: 'actview' })
await waitFor(() => expect(input.value).toBe('actview'))
```

## 下一步

- [API：测试工具](/api/testing)
- [示例：计数器](/examples/counter)
