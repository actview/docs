---
description: 温度转换示例：computed 双向换算摄氏与华氏。
---

# 温度转换 {#temperature-converter}

用 `computed` 在两个输入框之间做双向换算：修改摄氏 → 华氏自动更新，反之亦然。

## 代码

::: code-group

```tsx [src/App.tsx]
import { ref, computed } from 'actview'

export function App() {
  const celsius = ref(20)
  // 摄氏 → 华氏：F = C × 9/5 + 32
  const fahrenheit = computed(() => Math.round((celsius.value * 9) / 5 + 32))

  function setCelsius(e: FormEvent<HTMLInputElement>) {
    const v = Number(e.target.value)
    celsius.value = Number.isNaN(v) ? 0 : v
  }

  function setFahrenheit(e: FormEvent<HTMLInputElement>) {
    const v = Number(e.target.value)
    celsius.value = Number.isNaN(v) ? 0 : ((v - 32) * 5) / 9
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif' }}>
      <h1>温度转换</h1>
      <label>
        摄氏（°C）：
        <input type="number" value={String(celsius.value)} oninput={setCelsius} />
      </label>
      <label style={{ marginLeft: '16px' }}>
        华氏（°F）：
        <input type="number" value={String(fahrenheit.value)} oninput={setFahrenheit} />
      </label>
      <p>
        当前温度：{celsius.value}°C = {fahrenheit.value}°F
      </p>
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

- **单一数据源**：状态只存摄氏值，华氏是 `computed` 派生值——避免了两个状态互相同步的混乱；
- 修改华氏输入时反推摄氏值，`computed` 自动重算；
- `e.target.value` 是字符串，记得用 `Number()` 转换并处理 `NaN`。

## 相关文档

- [计算属性](../guide/essentials/computed)：缓存与依赖追踪
- [表单绑定](../guide/essentials/forms)：`value` + `oninput` 受控输入
