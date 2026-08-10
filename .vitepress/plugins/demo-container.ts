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
 * 读取 examples/demo/<path>.tsx 作为实时示例源码，渲染为 <Demo> 组件（展示 + 源码折叠 + 复制）。
 */
export function createDemoContainer(md: unknown): DemoContainerOpts {
  return {
    validate: (params) => /^demo\b/.test(params.trim()),

    render: (tokens, idx) => {
      if (tokens[idx].nesting !== 1) return '</Demo>'

      const info = tokens[idx].info.trim().match(/^demo\s*(.*)$/)
      const description = info && info[1] ? info[1] : ''
      const bodyParts = (tokens[idx + 2].children?.[0]?.content ?? '').split(/\s+/).filter(Boolean)
      const sourceFile = bodyParts[0]
      const show = bodyParts[1] !== 'false'

      const absPath = path.resolve(examplesRoot, `${sourceFile}.tsx`)
      let source = ''
      try {
        source = fs.readFileSync(absPath, 'utf-8')
      } catch {
        throw new Error(`[demo] 示例文件不存在: ${absPath}（请检查 :::demo 引用的路径）`)
      }
      if (!source) throw new Error(`[demo] 示例文件为空: ${absPath}`)

      const compName = 'Ep' + camelize(sourceFile)
      return `<Demo path="${sourceFile}" raw-source="${encodeURIComponent(source)}" description="${encodeURIComponent(
        description
      )}" show="${show}"><${compName} /></Demo>`
    }
  }
}
