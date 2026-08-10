# :::demo 示例块：功能与实现原理

本文档介绍 ActView 文档站（本仓库）自带的 `:::demo` 实时示例块功能——用法约定、支持的语法，以及它从 Markdown 到页面渲染的完整实现链路。参考对标：[whale-ui 的 demo 实现](https://github.com/ALiuYiLin/whale-ui)。

---

## 1. 功能简介

`:::demo` 是 markdown-it 自定义容器，用于在文档页内嵌**真实运行的 ActView 组件示例**，并提供：

- **在线展示**：示例组件直接在页面中运行、可交互；
- **源码面板**：点击「查看源码」展开示例源码（shiki 语法高亮，与正文代码块一致），支持多文件 **code-group 标签页**；
- **一键复制**：复制当前标签页的源码到剪贴板；
- 可选隐藏源码区（路径后跟 `false`）。

示例效果见 `examples/counter.md`、`examples/todo-list.md`。

## 2. 用法与约定

### 2.1 语法

```md
:::demo
counter,common.css
:::
```

- 正文第一行为示例文件引用，**逗号分隔**多个文件；第一个参数为展示组件，其余作为源码标签页；
- 行尾可跟 `false` 隐藏源码区（`counter false`）；
- 容器标题可带描述文字（`:::demo 这是一段描述`），会渲染在展示区上方。

### 2.2 文件引用规则

| 写法 | 含义 |
|---|---|
| `counter` | 文件夹形式：解析 `examples/demo/counter/index.tsx`（按 `index.tsx` / `index.ts` / `index.js` / `index.jsx` 依次探测） |
| `counter/basic.tsx` | 文件形式：直接指向 `examples/demo/counter/basic.tsx` |
| `common.css` | 标签页文件（须带后缀） |

所有示例文件都放在 `examples/demo/` 目录下。

### 2.3 组件约定（重点）

**展示组件 = 默认导出**。第一个参数指向的文件（或其 index）必须 `export default` 一个组件函数，函数名随意：

```tsx
// examples/demo/counter/index.tsx
import { ref } from 'actview'
import '../common.css'

export default function CounterDemo() {   // 名字随意，只要是默认导出
  const count = ref(0)
  return (
    <div class="av-demo av-demo-center">
      <p class="av-count">{count.value}</p>
      <button onclick={() => count.value++}>+1</button>
    </div>
  )
}
```

没有默认导出会直接报错：`[demo] 示例组件必须使用 export default（counter/index.tsx 未找到默认导出）`。

### 2.4 源码标签页顺序

- **文件形式**（`counter/basic.tsx,common.css`）：按书写顺序 `[basic.tsx, common.css]`；
- **文件夹形式**（`counter,common.css`）：
  - 组件在 index 中直接实现 → **index 排最前**：`[index.tsx, common.css]`；
  - index 只是重新导出（`export { default } from './impl.tsx'` 或 `import X from './impl'; export default X`）→ **实现文件最前、index 最后**：`[impl.tsx, common.css, index.tsx]`。

## 3. 实现原理

整体链路分四层：**vite load 钩子（注入 import）→ markdown-it 容器（产出 Demo 占位 HTML）→ renderAsync 包裹器（shiki 高亮）→ Demo 组件（客户端渲染）**。

### 3.1 为什么不能照搬 whale-ui

whale-ui 的方案依赖 Vue 生态：markdown 容器输出 `<Demo>` + `<template #source>`，再通过 `.vue` 文件的 `<script setup>` 注入示例组件 import，并 `app.component('Demo', ...)` 全局注册。

ActPress（`@actview/press`）没有 `<script setup>`、没有全局组件注册。它把 Markdown 渲染后的 HTML 经 `serializeHtmlToJsx` 序列化成 JSX 页面模块，**大写开头的标签（`COMPONENT_TAG_RE`）只有命中页面 `<script lang="tsx">` 块中的导入名（`componentNames`）才会被当作组件**，否则原样输出为文本。因此：

- 示例组件的 import 必须**注入到页面的 `<script lang="tsx">` 块**（press 会把脚本块提升为模块顶层）；
- `<Demo>` / `<EpXxx>` 标签由此被序列化器识别为组件。

### 3.2 分层实现

#### ① vite `load` 钩子：`markdown-transforms.ts`

press 的 md 转换在 `vitePressPlugin.transform` 里完成，用户插件（默认阶段）排在它后面，拿不到原始 md。所以这里用 `load` 钩子（先于 transform 阶段，且 press 不拦截 .md 的 load）：

1. 正则扫描 `:::demo` 块，解析文件列表与 show 标记；
2. 用 `buildDemoTabs()` 算出完整标签页集合（含自动发现的 index / 实现文件）；
3. **校验**：所有文件存在、展示组件文件包含 `export default`（声明或 `export { default } from` 重新导出均可，已剔除注释）；
4. 注入 `<script lang="tsx">`：`import EpCounter from '/examples/demo/counter/index.tsx'` + `import { Demo } from '@demo/Demo'`（`@demo` 是 vite 别名，指向 `.vitepress/demo`）；
5. 把所有标签页文件的 mtime 折叠成 `<!-- demo-version:<hash> -->` 注释附在 md 末尾——press 的 `markdownToActView` 以 `{src, ts, relativePath}` 缓存，改动示例文件时该注释变化 → 缓存失效 → dev 下实时更新；
6. 对每个示例文件调用 `this.addWatchFile()`，编辑示例文件能触发页面模块 HMR。

#### ② markdown-it 容器：`demo-container.ts`

`markdown.config(md)` 里注册 `md.use(mdContainer, 'demo', createDemoContainer())`：

- **validate**：`/^demo\b/`，识别 `:::demo`；
- **render（open）**：从正文 token（`tokens[idx+2]`）读取文件列表，产出占位 HTML：
  ```html
  <Demo demo-src="counter,common.css" path="counter/index.tsx" description="..." show="true"><EpCounter /></Demo>
  ```
  `demo-src` 只是**占位符**——高亮 HTML 太长且含引号，不能直接进 HTML 属性，由下一步替换；
- **隐藏正文**：把容器 body 的 tokens 置 `hidden` 并清空 inline children，避免示例路径渲染成 `<p>counter/basic</p>` 泄漏到页面；
- 组件名 `Ep + camelize(去后缀的主参数)`，与 load 钩子注入的 import 名严格一致。

#### ③ renderAsync 包裹器：`highlightDemoSource()`

press 的 markdown 渲染是 `MarkdownItAsync`，shiki 高亮是**异步**的（`wrapHightlight` 把 promise 存进 `placeholderMap`，渲染完成后统一替换）。因此在 `markdown.config` 里包裹 `md.renderAsync`，在页面渲染完成后做一次后处理：

1. 正则找出所有 `demo-src="..."` 占位；
2. 对每个标签页文件，调用原始 `renderAsync('```' + lang + '\n' + 源码 + '\n```')` 渲染一次**真实的 fence**——完全复用 shiki + preWrapper 管线（与正文代码块同一套高亮、深浅色主题、复制按钮）；
3. 组装 `[{ path, lang, raw, html }]` JSON，`encodeURIComponent` 后替换占位：
   ```html
   <Demo source="%5B%7B%22path%22...">
   ```
4. 嵌套的 `renderAsync` 用**包裹前的原始函数**，避免递归。

#### ④ Demo 组件：`.vitepress/demo/Demo.tsx`

- 解析 `props.source`（`decodeURIComponent` + `JSON.parse`）得到文件数组；
- **高亮 HTML 注入**：actview 的 `setProp` 对未知属性走 `setAttribute`，不支持 `innerHTML` prop，所以用 `ref` + `onMounted` 手动 `el.innerHTML = html`（SSR 时该区域为空，客户端挂载后填充）；
- **标签页**：`files.length > 1` 时渲染 `.av-demo-tabs`，点击切换（重新注入 innerHTML + 重新测高）；
- **折叠高度**：`max-height` 用内联 style 绑定，展开时读取 `scrollHeight`（实测内容高度，长代码不截断），收起归 0，CSS 负责过渡动画；
- **复制**：`navigator.clipboard.writeText` 复制当前标签页的 `raw` 源码，成功后图标切换为对勾 1.5s；
- 样式在 `demo.css`，复用 `--vp-*` 主题变量，浅深色自适应。

### 3.3 数据流总览

```
Markdown :::demo
   │ ① vite load 钩子
   │    扫描块 → 校验文件/默认导出 → 注入 <script lang="tsx"> import
   │    附加 demo-version 注释（mtime 折叠）→ addWatchFile
   ▼
press markdownToActView
   │ markdown-it 容器（②）→ <Demo demo-src="..." ...>
   │ renderAsync 包裹器（③）→ demo-src 占位替换为 source="<JSON>"
   ▼
serializeHtmlToJsx → JSX 页面模块
   ▼
actviewPlugin（defineComponent 转换）→ vite 编译
   ▼
Demo 组件（④）：showcase 渲染 <EpXxx/>，源码面板 innerHTML + 标签页 + 复制
```

## 4. 相关文件

| 文件 | 职责 |
|---|---|
| `.vitepress/plugins/demo-container.ts` | 容器插件、renderAsync 包裹器、文件解析/排序（`resolveDemoFile` / `findComponentSource` / `buildDemoTabs`） |
| `.vitepress/plugins/markdown-transforms.ts` | vite `load` 钩子：扫描、校验、注入 import、版本标记 |
| `.vitepress/demo/Demo.tsx` | 展示壳组件（展示区 / 标签页 / 折叠 / 复制） |
| `.vitepress/demo/demo.css` | Demo 组件样式 |
| `.vitepress/config.ts` | `markdown.config` 注册容器与包裹器；`@demo` 别名；`optimizeDeps.include` 补 `@actview/jsx/jsx-dev-runtime` |
| `examples/demo/**` | 示例组件与样式文件 |
