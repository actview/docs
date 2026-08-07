import { defineConfig, type DefaultTheme } from '@actview/press'

export default defineConfig({
  title: 'ActView',
  description: '轻量级、响应式驱动的 JSX 框架',

  // GitHub Actions 构建（部署到 GitHub Pages 子路径）时使用 /actview-docs/，
  // 本地 dev/build 保持根路径
  base: process.env.GITHUB_ACTIONS ? '/actview-docs/' : '/',

  // plan.md / docs/ 是项目内部文档，不作为站点页面编译
  srcExclude: ['plan.md', 'docs/**'],

  lastUpdated: true,
  cleanUrls: true,

  themeConfig: {
    logo: '/actview-logo.svg',
    siteTitle: 'ActView',

    nav: nav(),

    sidebar: {
      '/guide/': { base: '/guide/', items: sidebarGuide() },
      '/api/': { base: '/api/', items: sidebarApi() },
      '/examples/': { base: '/examples/', items: sidebarExamples() }
    },

    socialLinks: [{ icon: 'github', link: 'https://github.com/ALiuYiLin/actview' }],

    outline: { label: '本页目录' },

    docFooter: {
      prev: '上一页',
      next: '下一页'
    },

    lastUpdated: {
      text: '最后更新于'
    },

    notFound: {
      title: '页面未找到',
      quote: '你访问的页面不存在，或已被移动。',
      linkLabel: '前往首页',
      linkText: '带我回首页'
    },

    langMenuLabel: '多语言',
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    skipToContentLabel: '跳转到内容'
  }
})

function nav(): DefaultTheme.NavItem[] {
  return [
    { text: '指南', link: '/guide/introduction', activeMatch: '/guide/' },
    { text: '示例', link: '/examples/', activeMatch: '/examples/' },
    { text: 'API 参考', link: '/api/reactivity-core', activeMatch: '/api/' }
  ]
}

function sidebarGuide(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: '入门',
      collapsed: false,
      items: [
        { text: '什么是 ActView？', link: 'introduction' },
        { text: '快速上手', link: 'quick-start' }
      ]
    },
    {
      text: '基础',
      collapsed: false,
      items: [
        { text: '响应式基础', link: 'essentials/reactivity' },
        { text: '计算属性', link: 'essentials/computed' },
        { text: '条件渲染', link: 'essentials/conditional' },
        { text: '列表渲染', link: 'essentials/list' },
        { text: '事件处理', link: 'essentials/event-handling' },
        { text: '表单绑定', link: 'essentials/forms' },
        { text: '类与样式绑定', link: 'essentials/class-and-style' },
        { text: '生命周期', link: 'essentials/lifecycle' }
      ]
    },
    {
      text: '组件',
      collapsed: false,
      items: [
        { text: '组件基础', link: 'components/component-basics' },
        { text: 'Props', link: 'components/props' },
        { text: '组件事件', link: 'components/events' },
        { text: '内容与插槽', link: 'components/slots' },
        { text: '异步组件', link: 'components/async' }
      ]
    },
    {
      text: '内置组件',
      collapsed: false,
      items: [
        { text: 'Teleport', link: 'built-ins/teleport' },
        { text: 'Transition', link: 'built-ins/transition' },
        { text: 'KeepAlive', link: 'built-ins/keep-alive' },
        { text: 'ErrorBoundary', link: 'built-ins/error-boundary' },
        { text: 'Suspense', link: 'built-ins/suspense' }
      ]
    },
    {
      text: '规模化',
      collapsed: false,
      items: [
        { text: '路由', link: 'scaling-up/routing' },
        { text: '服务端渲染', link: 'scaling-up/ssr' },
        { text: 'TypeScript', link: 'typescript' }
      ]
    },
    {
      text: '深入',
      collapsed: false,
      items: [
        { text: '渲染机制', link: 'in-depth/rendering-mechanism' },
        { text: '响应式原理', link: 'in-depth/reactivity-in-depth' },
        { text: '渲染函数与 JSX', link: 'in-depth/render-function' }
      ]
    }
  ]
}

function sidebarApi(): DefaultTheme.SidebarItem[] {
  return [
    {
      text: 'API 参考',
      collapsed: false,
      items: [
        { text: '响应式核心', link: 'reactivity-core' },
        { text: '响应式进阶', link: 'reactivity-advanced' },
        { text: '应用实例', link: 'application' },
        { text: '组合式 API', link: 'composition-api' },
        { text: '内置组件', link: 'built-in-components' },
        { text: '渲染函数与 JSX', link: 'render-function' },
        { text: '服务端渲染', link: 'ssr' },
        { text: '路由', link: 'router' },
        { text: '类型参考', link: 'utility-types' }
      ]
    }
  ]
}

function sidebarExamples(): DefaultTheme.SidebarItem[] {
  return [
    { text: '示例总览', link: 'index' },
    {
      text: '基础',
      collapsed: false,
      items: [
        { text: '计数器', link: 'counter' },
        { text: '温度转换', link: 'temperature-converter' },
        { text: '待办清单', link: 'todo-list' },
        { text: '搜索过滤', link: 'search-filter' }
      ]
    },
    {
      text: '组件',
      collapsed: false,
      items: [
        { text: '组件与 Props', link: 'component-props' },
        { text: '插槽面板', link: 'slot-panel' }
      ]
    },
    {
      text: '进阶',
      collapsed: false,
      items: [
        { text: '异步加载', link: 'async-loading' },
        { text: '路由标签页', link: 'router-tabs' },
        { text: '秒表', link: 'stopwatch' },
        { text: '主题切换', link: 'toggle-theme' }
      ]
    }
  ]
}
