---
description: 表单控件的手动双向绑定：value + oninput，没有 v-model。
---

# 表单绑定 {#forms}

ActView **没有 `v-model`**。表单绑定 = 手动「数据 → 视图」与「视图 → 数据」：

- 用 `value` / `checked` 把状态写进控件；
- 用 `oninput` / `onchange` 把用户输入写回状态。

这也意味着 `value` 永远是受控的：状态是什么，输入框就显示什么。

## 文本输入

```tsx
import { ref } from 'actview'

export function TextInput() {
  const text = ref('')

  return (
    <div>
      <input
        value={text.value}
        oninput={(e) => (text.value = e.target.value)}
        placeholder="输入点什么…"
      />
      <p>你输入了：{text.value}</p>
    </div>
  )
}
```

`oninput` 在每次键入时触发（实时）；如果需要失焦或回车时才提交，改用 `onchange` / `onkeydown`。

## 多行文本与数字

```tsx
// textarea —— 同样用 value
const message = ref('')
<textarea value={message.value} oninput={(e) => (message.value = e.target.value)} />

// number —— e.target.value 是字符串，记得转换
const age = ref(0)
<input
  type="number"
  value={String(age.value)}
  oninput={(e) => (age.value = Number(e.target.value))}
/>
```

## 复选框

```tsx
const agree = ref(false)

<input
  type="checkbox"
  checked={agree.value}
  onchange={(e) => (agree.value = e.target.checked)}
/>
```

::: tip 用 `onchange` 而非 `oninput`
复选框的 `input` 与 `change` 事件几乎同时触发，规范写法是监听 `change`（点击后状态已确定）。
:::

## 单选按钮组

```tsx
const color = ref<'red' | 'green' | 'blue'>('red')

{['red', 'green', 'blue'].map((c) => (
  <label>
    <input
      type="radio"
      name="color"
      value={c}
      checked={color.value === c}
      onchange={() => (color.value = c)}
    />
    {c}
  </label>
))}
```

## 下拉选择

```tsx
const city = ref('beijing')

<select value={city.value} onchange={(e) => (city.value = e.target.value)}>
  <option value="beijing">北京</option>
  <option value="shanghai">上海</option>
  <option value="guangzhou">广州</option>
</select>
```

## 常见模式：可复用的受控组件

把「value + 事件」封装成小组件，避免重复：

```tsx
import { ref } from 'actview'

function TextField(props: {
  label: string
  value: string
  oninput: (e: InputEvent) => void
}) {
  return (
    <label>
      {props.label}：
      <input value={props.value} oninput={props.oninput} />
    </label>
  )
}

export function Profile() {
  const name = ref('')
  const email = ref('')

  return (
    <form>
      <TextField label="姓名" value={name.value} oninput={(e) => (name.value = e.target.value)} />
      <TextField label="邮箱" value={email.value} oninput={(e) => (email.value = e.target.value)} />
    </form>
  )
}
```

::: tip 类型提示
`e.target.value` 在严格 TS 下需要类型断言或使用 `FormEvent` 类型：

```tsx
import type { FormEvent } from '@actview/jsx'

oninput={(e: FormEvent<HTMLInputElement>) => (name.value = e.target.value)}
```
:::

## 下一步

- [事件处理](./event-handling)：`onclick` / `oninput` / `onchange` 与捕获阶段
- [组件事件](../components/events)：子组件通过回调 props 向父组件通信
