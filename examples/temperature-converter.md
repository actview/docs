---
description: 温度转换示例：computed 双向换算摄氏与华氏。
---

# 温度转换 {#temperature-converter}

用 `computed` 在两个输入框之间做双向换算：修改摄氏 → 华氏自动更新，反之亦然。

## 在线体验

真实运行的组件——修改任意一个输入框，另一个自动换算：

<script lang="tsx">
import { ref, computed } from 'actview'

const celsius = ref(20)
const fahrenheit = computed(() => Math.round((celsius.value * 9) / 5 + 32))

export function TemperatureDemo() {
  return (
    <div class="av-demo">
      <label>
        摄氏（°C）：
        <input
          type="number"
          value={String(celsius.value)}
          oninput={(e) => {
            const v = Number(e.target.value)
            celsius.value = Number.isNaN(v) ? 0 : v
          }}
        />
      </label>
      <label class="av-gap">
        华氏（°F）：
        <input
          type="number"
          value={String(fahrenheit.value)}
          oninput={(e) => {
            const v = Number(e.target.value)
            celsius.value = Number.isNaN(v) ? 0 : ((v - 32) * 5) / 9
          }}
        />
      </label>
      <p class="av-result">
        当前温度：{celsius.value}°C = {fahrenheit.value}°F
      </p>
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
.av-gap {
  margin-left: 16px;
}
.av-result {
  margin-bottom: 0;
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

<TemperatureDemo />

## 完整代码

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
    <div class="av-demo">
      <label>
        摄氏（°C）：
        <input type="number" value={String(celsius.value)} oninput={setCelsius} />
      </label>
      <label class="av-gap">
        华氏（°F）：
        <input type="number" value={String(fahrenheit.value)} oninput={setFahrenheit} />
      </label>
      <p class="av-result">
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
