# ActView 官方文档

[ActView](https://github.com/ALiuYiLin/JSX-Demo) 框架的官方文档站点，参考 [vue3 docs](https://vuejs.org) 的结构与风格编写，使用 **ActPress**（`@actview/press`）构建。

## 技术栈

- **站点生成器**：ActPress（`@actview/press`，本地 `file:` 引用 `C:\code\vitepress`）
- **框架**：ActView（`actview` / `@actview/core` / `@actview/jsx` / `@actview/router` / `@actview/plugin`）
- **包管理**：pnpm

## 快速创建 ActView 项目

使用官方脚手架 **`@actview/create-cli`**，一条命令生成 TypeScript + Vite + ActView 最小可运行项目：

```bash
# 交互式创建（询问项目名与目标文件夹）
npm create @actview/cli@latest

# 或直接指定项目名，非交互创建
npm create @actview/cli@latest my-app
```

也可以全局安装后使用 `actview` 命令：

```bash
npm install -g @actview/create-cli
actview my-app            # 在当前目录下创建 my-app/
actview create my-app     # 同上（create 子命令写法）
```

常用选项：

| 选项 | 说明 |
| --- | --- |
| `--target-dir <目录>` | 指定父目录（绝对或相对路径），跳过文件夹交互 |
| `-f, --force` | 目标目录已存在且非空时强制覆盖 |
| `-h, --help` / `-v, --version` | 显示帮助 / 版本 |

生成的项目结构：

```
my-app/
├── index.html              # 入口 HTML（#app 挂载点）
├── vite.config.ts          # vite + actviewPlugin
├── tsconfig.json           # 三段式 tsconfig 入口
├── package.json            # build: tsc -b && vite build
└── src/
    ├── main.tsx            # createApp(App).mount('#app')
    ├── App.tsx             # 根组件
    ├── style.css           # 全局样式（深浅色主题）
    └── components/
        └── Counter.tsx     # 示例组件：ref / computed / 事件
```

进入目录即可开始开发：

```bash
cd my-app
npm install        # 或 pnpm install / yarn
npm run dev        # http://localhost:5173
```

更多细节见指南 [快速上手](guide/quick-start)。

## 文档站开发

本仓库为 ActView 官方文档站，构建基于 ActPress（`@actview/press`）：

```bash
pnpm install
pnpm dev      # 本地开发（http://localhost:5173）
pnpm build    # 静态站点构建，输出到 .vitepress/dist
pnpm preview  # 预览构建产物
```

## 文档结构

```
index.md                     首页（hero）
.vitepress/config.ts         站点配置（导航、侧边栏）
guide/                       指南
├─ introduction.md           什么是 ActView
├─ quick-start.md            快速上手
├─ essentials/               基础（响应式/计算属性/条件/列表/事件/表单/类样式/生命周期）
├─ components/               组件（基础/Props/事件/插槽/异步组件）
├─ built-ins/                内置组件（Teleport/Transition/KeepAlive/ErrorBoundary/Suspense）
├─ scaling-up/               规模化（路由/SSR）
├─ typescript.md             TypeScript
└─ in-depth/                 深入（渲染机制/响应式原理/渲染函数）
api/                         API 参考（响应式/应用/组合式/内置组件/渲染函数/SSR/路由/类型）
examples/                    示例（基础/组件/进阶，共 10 个可运行示例）
public/                      静态资源
plan.md                      实施计划（不作为站点页面）
```

## 内容来源

所有 API 名称、签名与行为均以 [JSX-Demo](https://github.com/ALiuYiLin/JSX-Demo)（ActView 框架源码）为准。修改文档时请与 `packages/*` 源码核对。

## 链接检查

```bash
node .vitepress/check-links.mjs
```

构建（`pnpm build`）默认开启死链检查（`ignoreDeadLinks` 未开启），引入新页面时请同步更新侧边栏与相关链接。
