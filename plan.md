# ActView 框架文档实施计划

## 1. 目标

参考 vue3 官方文档（`E:\code3\docs`，即 vuejs.org 源码）的结构与风格，为 **ActView** 框架撰写官方文档。

- **文档站点工具**：ActPress（`@actview/press`，即 `C:\code\vitepress`），以本地 `file:` 方式引用
- **文档内容来源**：ActView 框架源码 `E:\code3\JSX-Demo`（`actview` / `@actview/core` / `@actview/jsx` / `@actview/router` 四个包）
- **语言**：简体中文单语
- **范围**：指南（guide）+ API 参考（api）
- **提交策略**：每完成一个阶段提交一次 commit

## 2. 参考源

| 参考 | 路径 | 用途 |
|---|---|---|
| vue3 docs（结构/风格） | `E:\code3\docs\src\guide`、`src\api` | 文档目录结构、章节划分、行文风格 |
| ActPress 自带文档（工程样板） | `C:\code\vitepress\docs`（`config.ts`、`zh\`） | `.vitepress` 配置方式、中文 locale 配置、Markdown 中嵌入 ActView 组件的写法 |
| ActView 源码（API 事实来源） | `E:\code3\JSX-Demo\packages\*` | 所有 API 名称、签名、行为以源码为准 |

## 3. 文档结构（映射 vue3 docs → ActView）

### 3.1 指南 guide/

```
guide/
├─ introduction.md          简介（什么是 ActView、特性、与 Vue/React 的关系）
├─ quick-start.md           快速上手（脚手架、vite 配置、tsconfig、第一个组件）
├─ essentials/              基础
│  ├─ reactivity.md         响应式基础（ref / reactive / watch / watchEffect）
│  ├─ computed.md           计算属性
│  ├─ conditional.md        条件渲染（JSX 的 && / 三元表达式）
│  ├─ list.md               列表渲染（map + key）
│  ├─ event-handling.md     事件处理（onClick 等）
│  ├─ forms.md              表单绑定（value + onInput，无 v-model）
│  ├─ class-and-style.md    类与样式绑定
│  └─ lifecycle.md          生命周期（onMounted/onUpdated/onBeforeUnmount/onUnmounted）
├─ components/              组件
│  ├─ component-basics.md   组件基础（defineComponent / setup）
│  ├─ props.md              Props
│  ├─ events.md             事件（回调 props）
│  ├─ slots.md              内容与插槽（children）
│  └─ async.md              异步组件（lazy + Suspense）
├─ built-ins/               内置组件
│  ├─ teleport.md
│  ├─ transition.md
│  ├─ keep-alive.md
│  ├─ error-boundary.md
│  └─ suspense.md
├─ scaling-up/              规模化
│  ├─ routing.md            路由（@actview/router）
│  └─ ssr.md                SSR（renderToString）
├─ typescript.md            TypeScript（JSX 类型、PropsOf）
└─ in-depth/                深入
   ├─ rendering-mechanism.md 渲染机制（VNode / diff / effect）
   ├─ reactivity-in-depth.md 响应式原理（track / trigger / EffectScope）
   └─ render-function.md     渲染函数与 JSX API
```

### 3.2 API 参考 api/

```
api/
├─ reactivity-core.md        响应式核心（ref/computed/reactive/readonly/watch/watchEffect/isRef/unref/toRef/toRefs）
├─ reactivity-advanced.md    响应式进阶（shallowReactive/markRaw/EffectScope/getCurrentScope）
├─ application.md            应用实例（createApp / App.mount）
├─ composition-api.md        组合式 API（defineComponent / setup / 生命周期钩子）
├─ built-in-components.md    内置组件（Teleport/Transition/KeepAlive/ErrorBoundary/Suspense/lazy）
├─ render-function.md        渲染函数与 JSX（jsx/jsxs/jsxDEV/createElement/Fragment/render/patch/unmount/nextTick）
├─ ssr.md                    SSR（renderToString）
├─ router.md                 路由（createRouter/createWebHistory/createMemoryHistory/RouterLink/RouterView）
└─ utility-types.md          类型参考（VNode/ComponentType/PropsOf/HtmlProps/InputProps 等）
```

### 3.3 站点配置

- `index.md`：首页 hero（仿 vue3 docs 风格：大标题 + 特性列表 + 快速上手入口）
- `.vitepress/config.ts`：`defineConfig`，标题 ActView，导航栏（指南 / API 参考），双区侧边栏
- 包管理：pnpm；依赖 `@actview/press` 使用 `file:` 指向 `C:\code\vitepress`

## 4. API 事实清单（来自源码调研，写文档时以此为准）

**统一入口 `actview`**：`createApp, defineComponent, reactive, shallowReactive, readonly, markRaw, nextTick, computed, ref, isRef, unref, toRef, toRefs, watch, watchEffect, onMounted, onUpdated, onBeforeUnmount, onUnmounted, renderToString, Teleport, Transition, KeepAlive, ErrorBoundary, Suspense, lazy, getCurrentScope` + 类型 `App`

**@actview/core**：响应式（`reactive/shallowReactive/readonly/markRaw/ref/isRef/unref/toRef/toRefs/computed/watch/watchEffect`）；运行时（`createApp/defineComponent/render/patch/unmount/nextTick/runEffect/EffectScope/renderToString`）；生命周期（`onMounted/onUpdated/onBeforeUnmount/onUnmounted`）；内置组件（`Teleport/Transition/KeepAlive/ErrorBoundary/Suspense/lazy`）

**@actview/jsx**：`jsx/jsxs/jsxDEV/createElement/isValidElement/Fragment`；全局 `JSX` 命名空间类型（`IntrinsicElements/HtmlProps/InputProps`）；VNode 形状兼容 React 约定（`$$typeof: Symbol.for('react.element')`）

**@actview/router**：`createRouter/createWebHistory/createMemoryHistory/RouterLink/RouterView`；类型 `RouterOptions/RouteRecord/RouteLocation/RouterHistory`；`currentRoute` 为 reactive 状态

**关键行为**（避免文档与实现脱节）：
- 无模板编译器、无 `{{ }}` 插值、无 `v-*` 指令、无 `v-model`（用 `value` + `onInput` 手动绑定）
- 组件状态用 `ref/reactive`；`setup` 只执行一次，返回 render 函数；数据变化经 effect 自动重跑 `render + patch`
- 列表渲染必须用 `key`
- props 为普通对象，由父组件显式调度更新

## 5. 实施阶段与提交计划

| commit | 阶段 | 内容 |
|---|---|---|
| 1 | 计划 | `plan.md` |
| 2 | 工程脚手架 | `package.json`、`.vitepress/config.ts`、`index.md` 首页、pnpm install、`actview-press dev/build` 验证通过 |
| 3 | 指南·入口 | `guide/introduction.md`、`guide/quick-start.md` |
| 4 | 指南·基础 | `guide/essentials/*`（8 篇） |
| 5 | 指南·组件 | `guide/components/*`（5 篇） |
| 6 | 指南·内置组件与深入 | `guide/built-ins/*`（5 篇）+ `guide/in-depth/*`（3 篇） |
| 7 | 指南·规模化与 TS | `guide/scaling-up/*`（2 篇）+ `guide/typescript.md` |
| 8 | API 参考 | `api/*`（9 篇） |
| 9 | 收尾 | `README.md`、全量 `actview-press build`、链接与导航检查 |

每个 commit 完成后运行 `actview-press build`（或对改动文件做 `dev` 冒烟）验证可编译、无坏链。

## 6. 验收标准

1. `pnpm install` 后 `pnpm build`（即 `actview-press build`）成功产出 `dist/`
2. 首页 hero、导航栏、双侧边栏（指南 / API 参考）可正常浏览
3. 所有文档 API 名称与签名和 `E:\code3\JSX-Demo\packages\*` 源码一致
4. 文档中代码示例可直接拷贝到 ActView 项目运行（示例经源码验证）
5. 全程中文，术语统一（如「信号/响应式」「组合式函数」等以源码注释为准）
