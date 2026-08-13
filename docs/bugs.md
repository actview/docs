# ActView 文档站 Bug 记录

本文件记录 ActView 文档站（`@actview/press` + ActPress）在开发与部署中遇到的已知问题，供排查与修复参考。

---

## Bug #1：卸载/重装 `@actview/press` 后，首次 `pnpm dev` 在线体验组件点击无效

- **状态**：✅ 已解决（`@actview/core@1.0.19` / `actview@1.0.18`，2026-08 发布；修复验证见文末）
- **涉及**：ActPress（`@actview/press`）dev 模式 + vite 依赖预构建
- **发现版本**：`@actview/press` npm 1.0.4 / 1.0.5（`^1.0.1` 范围实际解析版本）

### 问题出现场景

1. 对文档站执行「先卸载再安装」`@actview/press`：
   ```bash
   pnpm remove @actview/press
   pnpm add @actview/press
   ```
   （或任何导致依赖树 / `pnpm-lock.yaml` 变化后再安装的操作）
2. 启动开发服务器：
   ```bash
   pnpm dev
   ```
3. **首次**打开页面（如 `examples/counter.md`）时，页面的「在线体验」区块（`<script lang="tsx">` 定义的真实 ActView 组件）**能正常渲染显示，但点击按钮（如 `-1` / `+1` / `重置`，`examples/counter.md:23-25`）无任何响应**。
4. **关闭 dev server 后重新运行一次 `pnpm dev`**，同样位置点击恢复正常（响应式更新生效）。

### 现象要点

- 首屏 DOM 正常渲染（按钮、计数可见）——说明页面模块与组件代码加载完整；
- 交互失效——点击不触发 UI 更新（事件 / 响应式链路未生效）；
- 仅「依赖树变化后的**首次** dev」复现；重启 dev 即正常；
- 与具体页面无关（`counter.md` 只是最先被观察到的页面）。

### 根因（含证据）

核心：**卸载重装使 vite 依赖预构建缓存失效，首次 dev 的「预构建不稳定窗口」内，页面模块引用的依赖批次与 vite 服务端当前状态不一致，导致渲染与交互链路建立在过期批次上。**

证据链（在临时副本实测复现）：

1. **dev 模式依赖走 vite 预构建**，缓存有效性由 lockfile hash 判定：
   ```json
   // .vitepress/cache/deps/_metadata.json
   { "lockfileHash": "cf949623", "browserHash": "...", "optimized": { "actview": {...}, "@actview/jsx/jsx-runtime": {...} } }
   ```
   卸载重装 → `pnpm-lock.yaml` 变化 → `lockfileHash` 失效 → 首次 dev 必须重新预构建。

2. **预构建发生在页面加载过程中（运行时发现依赖）**：`src/node/plugin.ts` 中 `optimizeDeps.exclude` 排除了 `@actview/press`（入口以 `@fs` 绝对路径加载）；vite 启动时的 esbuild scan 从 `index.html` 入口开始，不深入 exclude 包，而 markdown 页面模块是**动态 import**（客户端 router），因此 `actview` / `@actview/core` / `@actview/jsx` 等依赖在**启动时未被预构建，直到浏览器首次加载页面模块时才被发现并触发重新优化**。

3. **时序窗口实验**（清空缓存重启 dev 后）：
   - T0（立即请求页面模块）：页面模块已返回并引用预构建 URL `deps/actview.js?v=<hashA>`，但此时磁盘上预构建文件**尚未生成**；
   - T5（5 秒后）：文件才写盘，且 vite 的 `browserHash` 已变为 `<hashB>` —— **运行中发生 re-optimize，页面模块引用的 hash 已过期**。

4. **新旧批次响应异常**：
   ```
   GET deps/actview.js?v=<hashA>  (页面模块实际引用的旧 hash) → HTTP 200 完整代码
   GET deps/actview.js?v=<hashB>  (vite 当前 browserHash)      → HTTP 504  (vite "正在优化依赖")
   ```

5. **fork 客户端无平滑过渡机制**（源码确认）：`src/client` 仅监听 `import.meta.hot.on('vitepress:pageData', ...)`，**没有 `vite:full-reload` / `vite:optimize-deps` 事件处理**，无法在依赖批次切换时正确接管或刷新页面。

### 为什么表现是「点击无效」而非报错

- 依赖代码本身完整（HTTP 返回 150KB = 44KB 代码 + 内联 base64 sourcemap，内容无残缺），所以 DOM 能正常渲染；
- 但首屏运行的组件 / 依赖实例属于**已过期的预构建批次**，与 vite 服务端当前模块图（新 `browserHash`）错配：`patchEvent`（invoker）与响应式 effect 链建立在失效批次的模块实例上，点击 `count.value++` 不会驱动 UI 更新；
- 二次 dev：缓存已就绪、`browserHash` 稳定、无 re-optimize → 单一批次 → 正常。

### 触发条件

- 依赖树 / lockfile 变化后**首次**启动 dev（卸载重装、pnpm 版本升降、`^1.0.1` 范围自动解析到新版本等）；
- dev 模式（`pnpm build` 不受影响，生产构建为一次性打包）。

### 影响范围

- 文档站所有「在线体验」区块（`examples/*.md` 中 `<script lang="tsx">` 真实组件）在首次 dev 时交互失效；
- 普通文档内容不受影响（静态 HTML / SSR 构建产物正常）。

### 修复方向建议

1. **根因修复在 ActPress**：
   - dev 客户端补上 `vite:full-reload` / `vite:optimize-deps` 事件监听（对齐上游 vitepress）；
   - 或将 `actview`、`@actview/core`、`@actview/jsx`、`@actview/router` 加入 `optimizeDeps.include`，让依赖在启动阶段一次性预构建，避免运行时 re-optimize。
2. **用户侧规避**：`pnpm dev` 启动后等待预构建完成（约 1-2 秒）再交互，或重启一次 dev server。

---

## Bug #2：`pnpm build` + `pnpm preview` 打开页面报 `Cannot read properties of undefined (reading 'has')`

- **状态**：✅ 已解决（`@actview/press` **1.0.7**，2026-08 发布；修复验证见文末）
- **涉及**：ActPress（`@actview/press`）生产构建的 `manualChunks` 拆分配置（`src/node/build/bundle.ts`）
- **发现版本**：`@actview/press` npm 1.0.4 / 1.0.5（`^1.0.1` 范围实际解析版本）

### 问题出现场景

1. 构建并预览：
   ```bash
   pnpm build
   pnpm preview
   ```
2. 浏览器打开任意页面，控制台报错（应用崩溃）：
   ```
   theme.CdudF1wV.js:1 Uncaught TypeError: Cannot read properties of undefined (reading 'has')
       at _ (theme.CdudF1wV.js:1:2446)
       at $ (theme.CdudF1wV.js:1:4536)
       at framework.CWwwJGlJ.js:1:3395
   ```

### 现象要点

- 仅**生产构建产物**（build + preview / 部署到 Pages）出现；dev 模式正常（dev 不经 `manualChunks` 拆分）；
- 页面 JS 加载即崩溃（模块初始化阶段），页面空白或无交互；
- 产物 chunk 文件名固定：`assets/chunks/framework.*.js`、`assets/chunks/theme.*.js`（build 日志始终伴随警告 `Circular chunk: framework -> theme -> framework. Please adjust the manual chunk logic for these chunks.`）。

### 根因（含证据）

核心：**`manualChunks` 把产物拆成 `framework` 与 `theme` 两个互相 import 的 chunk（循环依赖）；浏览器加载时 `framework` 模块顶层在 `theme` 初始化完成前就调用 `readonly(siteData)`，而 `theme` 中的 `rawSet`（`var lt = new WeakSet`）尚未赋值（var 提升为 `undefined`）→ `lt.has(...)` 崩溃。**

证据链（产物为 `.vitepress/dist/assets/chunks/`，与报错 hash 完全一致）：

1. **报错位置还原**（`theme.CdudF1wV.js`）：
   - `:1:2446` 函数 `_` = `shouldProxy`：`return (Array.isArray(e)||Ot(e)) && !lt.has(e) && ...` —— 崩溃点 `lt.has(e)`，`lt` 为 undefined
   - `:1:4536` 函数 `$` = `readonly()`：调用 `_`
   - `var lt = new WeakSet`（`markRaw` 的 `rawSet`）在 theme 模块内声明
2. **framework 调用点**（`framework.CWwwJGlJ.js:1:3395`）：
   ```js
   const ne = window.__VP_SITE_DATA__;
   ...
   const v = ye(Y(ne));   // = ref(readonly(siteData))  ← 模块顶层立即执行！
   ```
   `Y` 即 theme 导出的 `readonly`。
3. **循环依赖（chunk 互相 import）**：
   - `theme` 开头：`import{...} from "./framework.CWwwJGlJ.js"`
   - `framework` 开头：`import{r as Y, s as Q, ...} from "./theme.CdudF1wV.js"`
4. **入口执行顺序**（`app.*.js`）：`import theme` 在前、`import framework` 在后。
   浏览器加载顺序：入口 → theme → framework（theme 的 import 触发 framework）→ framework 顶层执行 `ref(readonly(siteData))` 时，**theme 还停在 `import framework` 处，`var lt = new WeakSet` 尚未执行** → `lt` 为 undefined → 崩溃。
5. **拆分配置来源**（`C:\code\vitepress\src\node\build\bundle.ts:106-137`）：
   - `framework` chunk：`client/app` 代码（含 `data.ts` 顶层的 `siteDataRef = shallowRef(readonly(siteData))`）
   - `theme` chunk：`client/theme-default` + 被主题静态引用的依赖（**`@actview/core` 的响应式代码被打进 theme**）
   - `excludedModules = ['/@siteData', clientDir]`（`:23`）本意是避免循环，但**没有排除 `@actview/core`** → framework 顶层用 `readonly`（在 theme 里）→ 循环未消除

### 为什么是「build + preview 才出现」

这是 **ESM 运行时模块初始化顺序**问题：build 只打包不执行浏览器代码；preview 打开页面时浏览器按「入口 → theme → framework」顺序加载并执行模块，循环依赖 + framework 顶层立即初始化触发崩溃。

### 影响范围

- 所有生产构建（`pnpm build` / GitHub Pages 部署）产物页面打开即崩溃；
- dev 模式不受影响。

### 修复方向建议

1. 在 `bundle.ts` 的 `excludedModules` 中加入 `@actview/core`（以及 `@actview/jsx`、`actview`、`@actview/router` 等 framework 与 theme 共用的包），避免它们被打进 theme chunk 造成循环；
2. 或调整 `manualChunks`，消除 framework ↔ theme 循环（合并/重新划分 chunk）；
3. 或把 `client/app/data.ts` 顶层的 `readonly(siteData)` 初始化延迟到 `createApp()` 调用时（避免模块加载期依赖其他 chunk）。

### 修复验证（@actview/press 1.0.7）

依赖升级到 `1.0.7` 后重新 `pnpm build`：

- ✅ 构建日志中 **`Circular chunk: framework -> theme -> framework` 警告消失**；
- ✅ 产物中 `framework.*.js` **不再 import `theme.*.js`**（循环依赖已打破，仅 theme 单向依赖 framework）；
- ✅ `framework` 顶层**不再调用 `readonly(siteData)`**（原崩溃点 `ref(readonly(siteData))` 已移除/延迟）；
- ✅ `pnpm preview` 冒烟正常：首页 / 示例页均 HTTP 200，返回完整 SSR HTML。

---

## Bug #3：点击主题切换按钮报 `Cannot set property value of #<ComputedRefImpl> which has only a getter`

- **状态**：✅ 已解决（`@actview/press` **1.0.8**，2026-08 发布；修复验证见文末）
- **涉及**：ActPress（`@actview/press`）主题外观切换逻辑（`dist/client/app/data.js` 的 `useDark` + `dist/client/theme-default/components/VPSwitchAppearance.js`）
- **发现版本**：`@actview/press` npm **1.0.7**（dev 与 build 产物均复现）

### 问题出现场景

1. `pnpm dev`（或 `pnpm build` + `pnpm preview`）启动文档站；
2. 点击导航栏右上角的**外观切换按钮**（深色/浅色主题切换，`VPSwitchAppearance`）；
3. 控制台报错：
   ```
   VPSwitchAppearance.js?v=c6734524:9 Uncaught TypeError: Cannot set property value of #<ComputedRefImpl> which has only a getter
       at vei.<computed>.toggleAppearance [as value] (VPSwitchAppearance.js?v=c6734524:9:18)
       at vei.<computed> (index.js:1235:15)
   ```
   主题不切换，按钮交互失效。

### 现象要点

- 仅点击外观切换按钮时报错；其余主题/导航功能正常；
- dev 与生产构建均复现（纯运行时逻辑问题，与构建方式无关）；
- 1.0.7 修复 Bug #2（页面能打开）后此问题随即暴露。

### 根因（含证据）

核心：**ActPress 从 Vue/VitePress 移植主题切换逻辑时，`useDark()` 的 `isDark` 被实现为「只有 getter 的只读 `computed`」（ActView 的 `computed` 不支持 setter），但 `toggleAppearance` 仍沿用 Vue 版「可写 isDark」的写法（`isDark.value = !isDark.value`）→ 给只读 ComputedRef 赋值 → 报错。**

证据链（`@actview/press@1.0.7` dist）：

1. **报错点**（`dist/client/theme-default/components/VPSwitchAppearance.js:9`）：
   ```js
   const { isDark, theme } = useData();
   const toggleAppearance = () => {
       isDark.value = !isDark.value;   // ← 给 isDark.value 赋值
   };
   ```
2. **`isDark` 是只读 ComputedRef**（`dist/client/app/data.js` 的 `useDark()`）：
   ```js
   const preference = ref(stored ?? initialValue);
   const preferredDark = usePreferredDark();
   const isDark = computed(() =>
       preference.value === 'dark' ||
       (preference.value === 'auto' && preferredDark.value));   // ← 只有 getter！
   ...
   return isDark;
   ```
3. **ActView core 的 `computed` 只支持 getter**：`@actview/core` 的 `computed.ts` 签名为 `function computed<T>(getter: () => T): ComputedRef<T>`，**没有可写 computed（`{ get, set }` 对象形式）**。

### 触发条件与影响

- 所有带外观切换按钮的页面，点击即崩（dev 与 build 产物一致）；
- 与具体文档内容无关。

### 修复方向建议

在 ActPress 侧修复（文档站无代码可改）：
1. `toggleAppearance` 改为写 `preference`（如 `preference.value = isDark.value ? 'light' : 'dark'`），而不是写只读的 `isDark.value`；
2. 或让 `useDark` 返回带 `setAppearance(v)` 的对象，由 `toggleAppearance` 调用；
3. 或为 ActView 的 `computed` 增加可写形式支持（框架 API 扩展，改动更大）。

### 修复验证（@actview/press 1.0.8）

依赖升级到 `1.0.8` 后检查 dist：

- ✅ `VPSwitchAppearance` 的 `toggleAppearance` 改为调用 `setAppearance(isDark.value ? 'light' : 'dark')`，**不再直接写只读的 `isDark.value`**；
- ✅ `useDark()` 新增 `setAppearance(value)`：写底层 `preference.value` 并持久化 `localStorage`，`useData()` 返回 `{ isDark, setAppearance }`；
- ✅ 源码注释明确引用本 Bug（"Cannot set property value ... only a getter"，Bug #3）；
- ✅ `pnpm build` 无 `Circular chunk` 警告、`pnpm preview` 冒烟 HTTP 200。

---

## Bug #4：生产构建下页面「在线体验」组件交互全部失效（`@actview/core` 双实例）

- **状态**：已定位（未修复）
- **涉及**：`@actview/core` 版本不一致 → rollup 打包双实例；文档站依赖解析
- **发现版本**：`@actview/press` 1.0.8 + 项目根 `@actview/core@1.0.19`（press 内部 `@actview/core@1.0.18`）

### 问题出现场景

1. `pnpm build` + `pnpm preview`（或部署到 GitHub Pages）后打开页面；
2. 操作任意「在线体验」组件（`examples/*.md` 中 `<script lang="tsx">` 的真实组件）：
   - `examples/counter`：点击 `+1` 无反应；
   - `examples/todo-list`：添加任务无反应；
   - `examples/component-props`：输入框修改 `name`，`GreetCard` 不更新；
3. 控制台**无任何报错**，但 UI 不随状态变化更新；
4. 同一页面 `pnpm dev` 下一切正常；主题切换按钮（theme chunk）正常。

### 现象要点

- 仅**生产构建产物**出现（dev 正常）；
- **所有**页面在线体验组件的交互都失效（非某个页面特有）；
- 无报错——事件处理器执行了（状态确实被修改），但**触发不了重渲染**；
- 主题组件（`VPSwitchAppearance` 等，位于 theme/framework chunk）事件正常。

### 根因（含证据）

核心：**`@actview/core` 在生产构建中被打包成两份（双实例）——项目根依赖与 `@actview/press` 内部依赖版本不一致，页面组件用的响应式系统与框架负责挂载/调度的响应式系统不是同一份，`track`/`trigger` 跨副本断链。**

证据链（playwright 真实浏览器实测 + 产物分析）：

1. **实测对照**：

   | 环境 | 行为 |
   | --- | --- |
   | `pnpm dev` | 正常（输入 name，GreetCard 立即更新） |
   | `pnpm build` + preview | 全部在线体验组件交互失效，无报错 |
   | preview 下主题切换按钮 | 正常（可切换 dark） |

2. **版本不一致**（`readlink` 实测）：
   - 项目根：`node_modules/@actview/core` → `@actview/core@1.0.19`（页面模块 `import { ref } from 'actview'` 用）
   - `@actview/press@1.0.8` 内部：`node_modules/.pnpm/@actview+press@1.0.8.../node_modules/@actview/core` → `@actview/core@1.0.18`

3. **双副本 chunk**（build 产物 `assets/chunks/`）：
   - `index.*.js`（4KB）：内联完整响应式实现副本——`ref`、`computed`、`reactive` 代理、`targetMap`、`track`、`trigger`、`activeEffect`、`defineComponent`；
   - `framework.*.js`（31KB）：另一份 core 实现——`mountComponent`、`patchEvent`/`_vei`、`[actview]` 错误消息；
   - 页面 chunk（`examples_*.md.*.js`）：`import { ref, defineComponent } from "./chunks/index.*.js"`（副本 A），其组件由 framework（副本 B）的 `mountComponent` 挂载。

4. **断链机制**：
   - 页面组件的 `ref()` 来自副本 A；组件 render effect 由副本 B 的 `runEffect` 创建（副本 B 的 `activeEffect`）；
   - render 读取 `ref.value` → 副本 A 的 `track` 读副本 A 的 `activeEffect` = null（活动 effect 在副本 B）→ **依赖收集失败**；
   - 点击/输入 → 副本 A 的 `trigger` → 副本 A 的 `targetMap` 无依赖 → 不重渲染 → 交互无效且无报错。

5. **dev 正常的原因**：vite dev 的 `optimizeDeps` 预构建把 `actview`/`@actview/core` 统一解析为项目根版本（1.0.19）单份产物，页面与主题共享同一实例。

### 触发条件与影响

- 项目根 `@actview/core` 版本与 `@actview/press` 内部依赖版本不一致时必现（当前 `^1.0.18` 解析到 1.0.19 vs press 锁定 1.0.18）；
- 影响：生产部署（GitHub Pages）后所有在线体验组件不可交互。

### 修复方向建议

1. **版本对齐**：项目根 `@actview/core` 固定到与 `@actview/press` 依赖一致的版本，或升级 press 使其依赖范围覆盖根版本；
2. `package.json` 加 `pnpm.overrides: { "@actview/core": "1.0.19" }` 强制单版本；
3. 升级 `@actview/press`（若其依赖范围更新到与根一致）。

### 修复验证（@actview/core 1.0.19 / actview 1.0.18）

当前安装版本即修复版（npm 上 `@actview/core@1.0.19` 与 `actview@1.0.18` 同批发布，gitHead `700128c`）。实测验证：

- 清空 `.vitepress/cache`（模拟「卸载重装后缓存失效的首次 dev」）→ `pnpm dev`；
- 打开 `examples/counter` **立即点击 `+1`**：计数 `0 → 1`，交互正常 ✅；
- 控制台无错误。

---

## Bug #5：文档站示例页的具名插槽（`<template slot="name">`）不生效

- **状态**：已定位（未修复）
- **涉及**：ActPress 文档站 markdown 页面的 `<script lang="tsx">` 编译管线（缺 `defineComponentPlugin` 转换）
- **发现版本**：文档站全部版本（`@actview/press` 1.0.8）

### 问题出现场景

1. `examples/slot-panel.md` 的「在线体验」组件（`examples/slot-panel.md:30-35`）使用具名插槽：
   ```tsx
   <PanelDemo>
     <template slot="title">📌 公告</template>
     <p>这是一个面板示例…</p>
     <button>操作</button>
     <template slot="footer">底部信息 —— footer 具名插槽</template>
   </PanelDemo>
   ```
2. 打开页面：**顶部插槽（title）与底部插槽（footer）都不生效**——header 显示兜底「（无标题）」、footer 为空，而插槽内容被渲染进了主体（children）区域。

### 现象要点

- 在线体验与 dev / build 环境均复现；
- 普通 children（默认插槽）正常，仅**具名插槽**失效；
- 真实 ActView 项目中（经 `@actview/plugin` 的 vite 插件编译）该写法正常——问题仅限文档站页面。

### 根因（含证据）

核心：**具名插槽的 `<template slot="name">` 依赖编译期 Babel 转换（`@actview/plugin` 的 `defineComponentPlugin`），但文档站 markdown 页面的 `<script lang="tsx">` 编译管线只做 JSX 转换，没有经过该插件——`<template slot>` 原样保留为原生元素，`props.slots` 始终为空。**

证据链（dev 产物 + playwright 实测）：

1. **编译产物**（`/examples/slot-panel.md` 模块）：
   ```js
   export const SlotDemo = defineComponent(function () {
     return () => jsxs(PanelDemo, {
       children: [
         jsx("template", { slot: "title", children: "📌 公告" }),   // ← 未转换！
         jsx("p", { class: "av-panel-text", ... }),
         jsx("button", { ... }),
         jsx("template", { slot: "footer", children: "底部信息…" }) // ← 未转换！
       ]
     });
   });
   ```
   `<template slot="title">` 应被转换为 `slots: { title: () => … }`，但**原样保留**为 `jsx("template", { slot: "title", ... })`。

2. **playwright 实测**（打开 `/examples/slot-panel`）：
   - header 渲染为 `（无标题）`（`props.slots?.title?.()` 为 undefined 走兜底）；
   - footer 渲染为 ``（空）；
   - main 区域内容为 `📌 公告 这是一个面板示例…操作 底部信息 —— footer 具名插槽`——**template 元素被当普通 children 渲染**。

3. **机制**：真实项目经 `actviewPlugin`（vite 插件 → Babel `defineComponentPlugin`）编译，`<template slot>` 在编译期转换为 `slots` prop；文档站页面的 `<script lang="tsx">` 由 ActPress 的 markdown 编译管线处理，**未接入 `defineComponentPlugin`**，因此 `props.slots` 恒为 undefined。

### 触发条件与影响

- 所有文档站示例页中使用 `<template slot="name">` 具名插槽的在线体验组件（当前为 `examples/slot-panel.md`）；
- 默认插槽（children）不受影响。

### 修复方向建议

1. 在 ActPress 的 markdown `<script lang="tsx">` 编译管线中接入 `defineComponentPlugin`（或等价的 template-slot 转换）；
2. 或文档站示例改用**函数 children 形式的作用域插槽**（`props.children?.()`）代替 `<template slot>` 语法（不依赖编译期转换）。

---

<!-- 后续 bug 在此追加 -->
