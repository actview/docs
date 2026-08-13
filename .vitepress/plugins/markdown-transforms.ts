import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildDemoTabs,
  camelize,
  demoBaseName,
  resolveDemoFile,
  stripComments
} from './demo-container'

const docRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const examplesRoot = path.resolve(docRoot, 'examples/demo')

const demoBlockRE = /:::demo\s*\n\s*([^\n]+)\n\s*:::/g

interface DemoRef {
  files: string[]
  show: boolean
}

function scanDemoBlocks(code: string): DemoRef[] {
  const refs: DemoRef[] = []
  for (const m of code.matchAll(demoBlockRE)) {
    const parts = m[1].trim().split(/\s+/).filter(Boolean)
    if (!parts[0]) continue
    const files = parts[0]
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
    if (files.length === 0) continue
    refs.push({ files, show: parts[1] !== 'false' })
  }
  return refs
}

/**
 * 扫描 markdown 中的 :::demo 块：为每个 demo 的第一个参数（展示组件，取其
 * 默认导出）注入 import 到页面 <script lang="tsx">；其余文件作为源码标签页。
 *
 * 附加基于所有标签页文件 mtime 的版本注释，示例源码变动时强制 press 的
 * markdown 缓存失效，dev 下 demo 源码与展示保持最新。
 */
export function demoTransform() {
  return {
    name: 'actview-docs:demo-transform',

    async load(this: any, id: string) {
      const cleanId = id.split('?')[0]
      if (!cleanId.endsWith('.md')) return null

      let code = ''
      try {
        code = fs.readFileSync(cleanId, 'utf-8')
      } catch {
        return null
      }

      const demos = scanDemoBlocks(code)
      if (demos.length === 0) return null

      const seen = new Set<string>()
      const imports: string[] = []
      let version = 0
      for (const demo of demos) {
        const tabs = buildDemoTabs(demo.files)
        for (const ref of tabs) {
          const absPath = path.resolve(examplesRoot, ref)
          let stat: fs.Stats
          try {
            stat = fs.statSync(absPath)
          } catch {
            throw new Error(
              `[demo] 示例文件不存在: ${absPath}（文件需带后缀，或目录需包含 index.ts/tsx/js/jsx）`
            )
          }
          this.addWatchFile(absPath)
          version = (version * 31 + Math.round(stat.mtimeMs)) | 0
        }

        const mainParam = demo.files[0]
        if (seen.has(mainParam)) continue
        seen.add(mainParam)

        const mainRef = resolveDemoFile(mainParam)
        const mainSource = stripComments(
          fs.readFileSync(path.resolve(examplesRoot, mainRef), 'utf-8')
        )
        if (!/export\s+(?:default\b|\{[^}]*?\bdefault\b[^}]*?\}\s*from)/.test(mainSource)) {
          throw new Error(
            `[demo] 示例组件必须使用 export default（${mainRef} 未找到默认导出）`
          )
        }

        const compName = 'Ep' + camelize(demoBaseName(mainParam))
        imports.push(`import ${compName} from '/examples/demo/${mainRef}'`)
      }

      const script = `<script lang="tsx">\nimport { Demo } from '@demo/Demo'\n${imports.join(
        '\n'
      )}\n</script>`
      return `${code.trimEnd()}\n\n<!-- demo-version:${version} -->\n${script}\n`
    }
  }
}
