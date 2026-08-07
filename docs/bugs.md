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

<!-- 后续 bug 在此追加 -->
