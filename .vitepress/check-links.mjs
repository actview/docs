import { readdirSync, readFileSync, statSync } from 'fs'
import { join, dirname, extname } from 'path'

const root = process.cwd()
const files = []
function walk(dir) {
  for (const e of readdirSync(dir)) {
    if (['node_modules', '.vitepress', '.git', 'public'].includes(e)) continue
    const p = join(dir, e)
    if (statSync(p).isDirectory()) walk(p)
    else if (extname(p) === '.md') files.push(p)
  }
}
walk(root)

const pages = new Set(
  files.map((f) => f.slice(root.length + 1).replace(/\\/g, '/').replace(/\.md$/, ''))
)

let dead = 0
for (const f of files) {
  const content = readFileSync(f, 'utf8')
  const re = /\[[^\]]*\]\(([^)]+)\)/g
  let m
  while ((m = re.exec(content))) {
    let link = m[1].trim()
    if (link.startsWith('http') || link.startsWith('#') || link.startsWith('mailto:')) continue
    link = link.split('#')[0].split('?')[0]
    if (!link) continue
    if (/\.(png|jpg|jpeg|svg|webp|gif)$/.test(link)) continue
    if (link.endsWith('.html')) link = link.slice(0, -5)
    if (link.endsWith('.md')) link = link.slice(0, -3)
    const from = dirname(f.slice(root.length + 1))
    let target
    if (link.startsWith('/')) target = link.slice(1)
    else target = join(from, link).replace(/\\/g, '/')
    target = target.replace(/\/$/, '') || 'index'
    if (!pages.has(target)) {
      console.log(`DEAD: ${f.slice(root.length + 1)} -> ${m[1]}`)
      dead++
    }
  }
}
console.log(dead === 0 ? 'ALL LINKS OK' : `TOTAL DEAD: ${dead}`)
