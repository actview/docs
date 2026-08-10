import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { camelize, resolveDemoFile } from './demo-container'

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
 * 扫描 markdown 中的 :::demo 块：为每个 demo 的第一个文件（展示组件）注入
 * import 到页面 <script lang="tsx">；其余文件作为源码标签页展示。
 *
 * 附加基于所有示例文件 mtime 的版本注释，示例源码变动时强制 press 的
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
        for (const ref of demo.files) {
          const absPath = path.resolve(examplesRoot, resolveDemoFile(ref))
          let stat: fs.Stats
          try {
            stat = fs.statSync(absPath)
          } catch {
            throw new Error(
              `[demo] 示例文件不存在: ${absPath}（请检查 :::demo 引用的路径）`
            )
          }
          this.addWatchFile(absPath)
          version = (version * 31 + Math.round(stat.mtimeMs)) | 0
        }

        const mainFile = demo.files[0]
        if (seen.has(mainFile)) continue
        seen.add(mainFile)
        const exportName = camelize(path.basename(mainFile))
        const compName = 'Ep' + camelize(mainFile)
        imports.push(
          `import { ${exportName} as ${compName} } from '/examples/demo/${mainFile}'`
        )
      }

      const script = `<script lang="tsx">\nimport { Demo } from '@demo/Demo'\n${imports.join(
        '\n'
      )}\n</script>`
      return `${code.trimEnd()}\n\n<!-- demo-version:${version} -->\n${script}\n`
    }
  }
}
