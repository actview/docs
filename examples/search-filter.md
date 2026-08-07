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
    <div class="av-demo">
      <input
        class="av-block"
        value={keyword.value}
        oninput={(e) => (keyword.value = e.target.value)}
        placeholder="输入关键词过滤…"
      />

      <label class="av-check">
        <input
          type="checkbox"
          checked={onlyLong.value}
          onchange={(e) => (onlyLong.value = e.target.checked)}
        />
        只看两个字以上的名称
      </label>

      <p class="av-muted">
        共 {filtered.value.length} 项
        {keyword.value && `（关键词：${keyword.value}）`}
      </p>

      <ul class="av-list">
        {filtered.value.map((name) => (
          <li key={name}>{name}</li>
        ))}
      </ul>
    </div>
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
.av-block {
  width: 100%;
  box-sizing: border-box;
}
.av-check {
  display: block;
  margin: 8px 0;
}
.av-muted {
  opacity: 0.7;
}
.av-list {
  margin: 0;
  padding-left: 20px;
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
    <div class="av-demo">
      <input
        class="av-block"
        value={keyword.value}
        oninput={(e) => (keyword.value = e.target.value)}
        placeholder="输入关键词过滤…"
      />

      <label class="av-check">
        <input
          type="checkbox"
          checked={onlyLong.value}
          onchange={(e) => (onlyLong.value = e.target.checked)}
        />
        只看两个字以上的名称
      </label>

      <p class="av-muted">
        共 {filtered.value.length} 项
        {keyword.value && `（关键词：${keyword.value}）`}
      </p>

      <ul class="av-list">
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
