import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const docRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const examplesRoot = path.resolve(docRoot, 'examples/demo')

export const camelize = (s: string) =>
  s.replace(/[\/\-.]+(\w)/g, (_, c) => c.toUpperCase()).replace(/^\w/, (c) => c.toUpperCase())

export const stripComments = (s: string) =>
  s.replace(/^\s*\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '')

const fileRE = /\.[a-z0-9]+$/i
const INDEX_EXTS = ['.tsx', '.ts', '.js', '.jsx']

/**
 * 解析示例引用：
 * - 带后缀 → 文件（counter/basic.tsx、common.css）
 * - 无后缀 → 目录下的 index 文件（counter → counter/index.tsx/.ts/.js/.jsx）
 */
export const resolveDemoFile = (ref: string): string => {
  if (fileRE.test(ref)) return ref
  const base = `${ref}/index`
  for (const ext of INDEX_EXTS) {
    if (fs.existsSync(path.resolve(examplesRoot, `${base}${ext}`))) return `${base}${ext}`
  }
  return `${base}.tsx`
}

export const demoLang = (ref: string) => {
  const ext = ref.split('.').pop()!.toLowerCase()
  return ext === 'ts' || ext === 'tsx' || ext === 'js' || ext === 'jsx' ? 'tsx' : ext
}

export const demoBaseName = (ref: string) => ref.replace(/\.[^.]+$/, '')

const isIndexRef = (ref: string) => /\/index\./.test(ref)

/** 解析 index 中相对导入的实现文件（'./basic' → counter/basic.tsx） */
const resolveWithin = (indexRef: string, target: string): string => {
  if (!target.startsWith('.')) return target
  const p = path.posix.normalize(path.posix.join(path.dirname(indexRef), target))
  if (fileRE.test(p)) return p
  for (const ext of INDEX_EXTS) {
    if (fs.existsSync(path.resolve(examplesRoot, p + ext))) return p + ext
  }
  return p + '.tsx'
}

/** 组件函数实现文件：index 直接实现 → index；index 重新导出 → 被导出的实现文件 */
export function findComponentSource(indexRef: string): string {
  const src = stripComments(fs.readFileSync(path.resolve(examplesRoot, indexRef), 'utf-8'))
  if (/export\s+default\s+(?:async\s+)?(?:function|class|const|let|var|[({])/.test(src)) {
    return indexRef
  }
  const reExport = src.match(/export\s*\{[^}]*\}\s*from\s*['"]([^'"]+)['"]/)
  if (reExport) return resolveWithin(indexRef, reExport[1])
  const id = src.match(/export\s+default\s+([A-Za-z_$][\w$]*)\s*;?\s*$/)
  if (id) {
    const im = src.match(
      new RegExp(`import\\s*\\{?\\s*${id[1]}\\s*}?\\s*from\\s*['"]([^'"]+)['"]`)
    )
    if (im) return resolveWithin(indexRef, im[1])
  }
  return indexRef
}

/**
 * 源码标签页顺序：
 * - 文件形式 → 按书写顺序
 * - 文件夹形式 → 组件实现文件在最前；若组件在 index 中实现则 index 在最前，
 *   否则 index 排到最后
 */
export function buildDemoTabs(refs: string[]): string[] {
  const resolved = refs.map(resolveDemoFile)
  if (!isIndexRef(resolved[0])) return resolved
  const impl = findComponentSource(resolved[0])
  const tabs = [impl, ...resolved.slice(1).filter((r) => r !== impl)]
  if (impl !== resolved[0]) tabs.push(resolved[0])
  return tabs
}

export interface DemoContainerOpts {
  validate?: (params: string) => boolean
  render?: (tokens: any[], idx: number) => string
}

/**
 * :::demo
 * counter[,common.css,...] [show]        // 文件夹形式（index 的默认导出为组件）
 * counter/basic.tsx[,common.css,...]     // 文件形式（文件的默认导出为组件）
 * :::
 *
 * 第一个参数为展示组件（其默认导出函数），其余作为源码标签页。
 * 源码高亮由 renderAsync 包裹器（highlightDemoSource）在渲染完成后把
 * demo-src 占位替换为 markdown-it 高亮后的 HTML（JSON 数组）。
 */
export function createDemoContainer(): DemoContainerOpts {
  return {
    validate: (params) => /^demo\b/.test(params.trim()),

    render: (tokens, idx) => {
      if (tokens[idx].nesting !== 1) return '</Demo>'

      const info = tokens[idx].info.trim().match(/^demo\s*(.*)$/)
      const description = info && info[1] ? info[1] : ''
      const bodyParts = (tokens[idx + 2].children?.[0]?.content ?? '').split(/\s+/).filter(Boolean)
      const files = (bodyParts[0] ?? '')
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
      const show = bodyParts[1] !== 'false'

      // 容器正文（示例文件列表）仅作为数据消费，隐藏其渲染
      for (let i = idx + 1; i < tokens.length; i++) {
        if (tokens[i].type === 'container_demo_close') break
        tokens[i].hidden = true
        if (tokens[i].type === 'inline') tokens[i].children = []
      }

      const mainFile = files[0]
      if (!mainFile) {
        throw new Error(`[demo] :::demo 缺少示例文件路径（例如 :::demo\ncounter\n:::）`)
      }

      const compName = 'Ep' + camelize(demoBaseName(mainFile))
      return `<Demo demo-src="${files.join(',')}" path="${resolveDemoFile(mainFile)}" description="${encodeURIComponent(
        description
      )}" show="${show}"><${compName} />`
    }
  }
}

/**
 * 包裹 md.renderAsync：把容器输出的 demo-src="<path[,path,...]>" 占位替换为
 * <Demo source="<encodeURIComponent(JSON 数组)>">，数组按 buildDemoTabs 顺序排列，
 * 每项为 { path, lang, raw, html }，html 为按各自语言（tsx/css）用 markdown-it fence
 * 管线（shiki + preWrapper）高亮后的代码块。
 */
export function highlightDemoSource(md: any) {
  const origRenderAsync = md.renderAsync.bind(md)

  md.renderAsync = async (src: string, env: any) => {
    const out: string = await origRenderAsync(src, env)
    const matches = Array.from(out.matchAll(/demo-src="([^"]+)"/g))
    if (matches.length === 0) return out

    let result = out
    for (const m of matches) {
      const files: { path: string; lang: string; raw: string; html: string }[] = []
      for (const ref of buildDemoTabs(
        m[1].split(',').map((s) => s.trim()).filter(Boolean)
      )) {
        const absPath = path.resolve(examplesRoot, ref)
        let source = ''
        try {
          source = fs.readFileSync(absPath, 'utf-8')
        } catch {
          continue
        }
        const lang = demoLang(ref)
        const html = await origRenderAsync('```' + lang + '\n' + source.trimEnd() + '\n```', {})
        files.push({ path: ref, lang, raw: source, html })
      }
      result = result.replace(
        `demo-src="${m[1]}"`,
        `source="${encodeURIComponent(JSON.stringify(files))}"`
      )
    }
    return result
  }
}
