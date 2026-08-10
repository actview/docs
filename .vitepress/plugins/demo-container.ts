import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const docRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const examplesRoot = path.resolve(docRoot, 'examples/demo')

export const camelize = (s: string) =>
  s.replace(/[\/\-.]+(\w)/g, (_, c) => c.toUpperCase()).replace(/^\w/, (c) => c.toUpperCase())

/** 示例文件引用：无扩展名默认补 .tsx（如 common.css 已带扩展名则原样使用） */
const fileRE = /\.[a-z0-9]+$/i
export const resolveDemoFile = (ref: string) => (fileRE.test(ref) ? ref : `${ref}.tsx`)
export const demoLang = (ref: string) => (fileRE.test(ref) ? ref.split('.').pop()!.toLowerCase() : 'tsx')

export interface DemoContainerOpts {
  validate?: (params: string) => boolean
  render?: (tokens: any[], idx: number) => string
}

/**
 * :::demo
 * counter/basic[,common.css,...] [show]
 * :::
 *
 * 逗号分隔多个示例文件：第一个为展示组件，其余作为源码标签页。
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
        throw new Error(`[demo] :::demo 缺少示例文件路径（例如 :::demo\ncounter/basic\n:::）`)
      }

      const compName = 'Ep' + camelize(mainFile)
      return `<Demo demo-src="${files.join(',')}" path="${mainFile}" description="${encodeURIComponent(
        description
      )}" show="${show}"><${compName} />`
    }
  }
}

/**
 * 包裹 md.renderAsync：把容器输出的 demo-src="<path[,path,...]>" 占位替换为
 * <Demo source="<encodeURIComponent(JSON 数组)>">，数组每项为
 * { path, lang, raw, html }，html 为按各自语言（tsx/css）用 markdown-it fence
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
      for (const ref of m[1].split(',').map((s) => s.trim()).filter(Boolean)) {
        const absPath = path.resolve(examplesRoot, resolveDemoFile(ref))
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
