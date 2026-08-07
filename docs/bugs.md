# ActView 文档站 Bug 记录

本文件记录 ActView 文档站（`@actview/press` + ActPress）在开发与部署中遇到的已知问题，供排查与修复参考。

---

## Bug #1：卸载/重装 `@actview/press` 后，首次 `pnpm dev` 在线体验组件点击无效

- **状态**：已定位（未修复）
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

- **状态**：已定位（未修复）
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

---

<!-- 后续 bug 在此追加 -->
