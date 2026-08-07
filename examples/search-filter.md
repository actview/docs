---
description: 搜索过滤示例：受控输入框 + computed 派生过滤列表。
---

# 搜索过滤 {#search-filter}

一个受控输入框 + `computed` 过滤列表，演示「输入即过滤」的典型模式。

## 在线体验

真实运行的组件——输入关键词或勾选过滤条件，列表实时变化：

<script lang="tsx">
import { ref, computed } from 'actview'

const fruitList = [
  '苹果', '香蕉', '樱桃', '葡萄', '芒果',
  '橙子', '桃子', '梨', '草莓', '西瓜',
  '菠萝', '蓝莓', '柠檬', '石榴', '椰子'
]

const keyword = ref('')
const onlyLong = ref(false)

export function SearchDemo() {
  const filtered = computed(() => {
    const kw = keyword.value.trim().toLowerCase()
    return fruitList.filter((name) => {
      const matched = !kw || name.toLowerCase().includes(kw)
      const len = onlyLong.value ? name.length >= 2 : true
      return matched && len
    })
  })

  return (
    <div
      style={{
        fontFamily: 'system-ui, sans-serif',
        padding: '16px',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        background: '#f8fafc'
      }}
    >
      <input
        value={keyword.value}
        oninput={(e) => (keyword.value = e.target.value)}
        placeholder="输入关键词过滤…"
        style={{ width: '100%', boxSizing: 'border-box' }}
      />

      <label style={{ display: 'block', margin: '8px 0' }}>
        <input
          type="checkbox"
          checked={onlyLong.value}
          onchange={(e) => (onlyLong.value = e.target.checked)}
        />
        只看两个字以上的名称
      </label>

      <p style={{ opacity: 0.7 }}>
        共 {filtered.value.length} 项
        {keyword.value && `（关键词：${keyword.value}）`}
      </p>

      <ul style={{ margin: 0 }}>
        {filtered.value.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
  )
}
</script>

<SearchDemo />

## 完整代码

::: code-group

```tsx [src/App.tsx]
import { ref, computed } from 'actview'

const fruits = [
  '苹果', '香蕉', '樱桃', '葡萄', '芒果',
  '橙子', '桃子', '梨', '草莓', '西瓜',
  '菠萝', '蓝莓', '柠檬', '石榴', '椰子'
]

export function App() {
  const keyword = ref('')
  const onlyLong = ref(false)

  const filtered = computed(() => {
    const kw = keyword.value.trim().toLowerCase()
    return fruits.filter((name) => {
      const matched = !kw || name.toLowerCase().includes(kw)
      const len = onlyLong.value ? name.length >= 2 : true
      return matched && len
    })
  })

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', maxWidth: '480px' }}>
      <h1>水果搜索</h1>

      <input
        value={keyword.value}
        oninput={(e) => (keyword.value = e.target.value)}
        placeholder="输入关键词过滤…"
        style={{ width: '100%', boxSizing: 'border-box' }}
      />

      <label style={{ display: 'block', margin: '8px 0' }}>
        <input
          type="checkbox"
          checked={onlyLong.value}
          onchange={(e) => (onlyLong.value = e.target.checked)}
        />
        只看两个字以上的名称
      </label>

      <p style={{ opacity: 0.7 }}>
        共 {filtered.value.length} 项
        {keyword.value && `（关键词：${keyword.value}）`}
      </p>

      <ul>
        {filtered.value.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
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

- 输入框是**受控的**：`value={keyword.value}` + `oninput` 写回状态；
- `filtered` 是 `computed`：只在 `keyword` / `onlyLong` 变化时重算，渲染零浪费；
- 列表用 `key={name}`（名称唯一），静态数据也保持一致的 diff 语义。

## 相关文档

- [表单绑定](../guide/essentials/forms)：受控输入与复选框
- [计算属性](../guide/essentials/computed)：派生列表
- [列表渲染](../guide/essentials/list)：`map` + `key`
