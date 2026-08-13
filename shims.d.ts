declare module '*.css' {
  const css: string
  export default css
}

declare module '*.css?scoped' {
  const css: string
  export default css
}

declare module 'markdown-it-container' {
  const mdContainer: (md: any, name: string, opts?: any) => void
  export default mdContainer
}
