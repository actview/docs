import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const docRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const examplesRoot = path.resolve(docRoot, 'examples/demo')

export const camelize = (s: string) =>
  s.replace(/[\/\-.]+(\w)/g, (_, c) => c.toUpperCase()).replace(/^\w/, (c) => c.toUpperCase())

export interface DemoContainerOpts {
  validate?: (params: string) => boolean
  render?: (tokens: any[], idx: number) => string
}

/**
 * :::demo
 * counter/basic [show]
 * :::
 *
 * 读取 examples/demo/<path>.tsx 作为实时示例源码。源码高亮由 renderAsync 包裹器
 * （highlightDemoSource）在渲染完成后把 demo-src 占位替换为 markdown-it 高亮后的 HTML。
 */
export function createDemoContainer(): DemoContainerOpts {
  return {
    validate: (params) => /^demo\b/.test(params.trim()),

    render: (tokens, idx) => {
      if (tokens[idx].nesting !== 1) return '</Demo>'

      const info = tokens[idx].info.trim().match(/^demo\s*(.*)$/)
      const description = info && info[1] ? info[1] : ''
      const bodyParts = (tokens[idx + 2].children?.[0]?.content ?? '').split(/\s+/).filter(Boolean)
      const sourceFile = bodyParts[0]
      const show = bodyParts[1] !== 'false'

      // 容器正文（示例路径）仅作为数据消费，隐藏其渲染
      for (let i = idx + 1; i < tokens.length; i++) {
        if (tokens[i].type === 'container_demo_close') break
        tokens[i].hidden = true
        if (tokens[i].type === 'inline') tokens[i].children = []
      }

      const absPath = path.resolve(examplesRoot, `${sourceFile}.tsx`)
      let source = ''
      try {
        source = fs.readFileSync(absPath, 'utf-8')
      } catch {
        throw new Error(`[demo] 示例文件不存在: ${absPath}（请检查 :::demo 引用的路径）`)
      }
      if (!source) throw new Error(`[demo] 示例文件为空: ${absPath}`)

      const compName = 'Ep' + camelize(sourceFile)
      return `<Demo demo-src="${sourceFile}" path="${sourceFile}" raw-source="${encodeURIComponent(
        source
      )}" description="${encodeURIComponent(description)}" show="${show}"><${compName} />`
    }
  }
}

/**
 * 包裹 md.renderAsync：把容器输出的 demo-src="<path>" 占位替换为
 * <Demo source="<encodeURIComponent(高亮HTML)>">。
 *
 * 高亮复用 markdown-it 自身的 fence 管线（shiki + preWrapper），即把示例源码
 * 当作一次完整的 ```tsx 代码块渲染，得到与正文代码块一致的高亮样式。
 */
export function highlightDemoSource(md: any) {
  const origRenderAsync = md.renderAsync.bind(md)

  md.renderAsync = async (src: string, env: any) => {
    const out: string = await origRenderAsync(src, env)
    const matches = Array.from(out.matchAll(/demo-src="([^"]+)"/g))
    if (matches.length === 0) return out

    let result = out
    for (const m of matches) {
      const demoPath = m[1]
      const absPath = path.resolve(examplesRoot, `${demoPath}.tsx`)
      let source = ''
      try {
        source = fs.readFileSync(absPath, 'utf-8')
      } catch {
        continue
      }
      const html = await origRenderAsync('```tsx\n' + source.trimEnd() + '\n```', {})
      result = result.replace(
        `demo-src="${demoPath}"`,
        `source="${encodeURIComponent(html)}"`
      )
    }
    return result
  }
}
