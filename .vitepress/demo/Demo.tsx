import { onMounted, ref } from 'actview'
import './demo.css'

interface DemoFile {
  path: string
  lang: string
  raw: string
  html: string
}

export function Demo(props: any = {}) {
  const expanded = ref(false)
  const copied = ref(false)
  const active = ref(0)
  const sourceBox = ref<HTMLElement | undefined>(undefined)
  const sourceWrap = ref<HTMLElement | undefined>(undefined)
  const sourceMax = ref(0)
  let timer: ReturnType<typeof setTimeout> | undefined

  const show = props.show !== 'false'
  const description = decodeURIComponent(props.description ?? '')
  const path = props.path ?? ''
  const pathLabel = !path ? '' : path.includes('.') ? path : `${path}.tsx`

  const files: DemoFile[] = (() => {
    try {
      const value = JSON.parse(decodeURIComponent(props.source ?? '[]'))
      return Array.isArray(value) ? value : []
    } catch {
      return []
    }
  })()

  const renderSource = () => {
    const file = files[active.value]
    if (sourceBox.value && file) {
      sourceBox.value.innerHTML = file.html
    }
    if (sourceWrap.value) {
      sourceMax.value = sourceWrap.value.scrollHeight
    }
  }

  onMounted(renderSource)

  const setActive = (i: number) => {
    if (active.value === i) return
    active.value = i
    renderSource()
  }

  const toggleSource = () => {
    expanded.value = !expanded.value
    sourceMax.value = expanded.value && sourceWrap.value ? sourceWrap.value.scrollHeight : 0
  }

  const copyCode = async () => {
    const raw = files[active.value]?.raw
    if (!raw) return
    try {
      await navigator.clipboard.writeText(raw)
      copied.value = true
      clearTimeout(timer)
      timer = setTimeout(() => {
        copied.value = false
      }, 1500)
    } catch {
      // 剪贴板不可用时静默失败
    }
  }

  return (
    <div class={['av-demo-block', !show && 'av-demo-no-show'].filter(Boolean).join(' ')}>
      {description ? <p class="av-demo-desc">{description}</p> : null}
      <div class="av-demo-showcase">{props.children}</div>
      {show && <div class="av-demo-divider" />}
      {show && (
        <div class="av-demo-ops">
          <span class="av-demo-path">{pathLabel}</span>
          <span class="av-demo-actions">
            <button
              type="button"
              class="av-demo-btn"
              title={expanded.value ? '收起源码' : '查看源码'}
              onclick={toggleSource}
            >
              <span
                class={['av-demo-icon', expanded.value ? 'av-demo-icon-up' : 'av-demo-icon-down'].join(' ')}
              ></span>
            </button>
            <button type="button" class="av-demo-btn" title="复制源码" onclick={copyCode}>
              {copied.value ? (
                <span class="av-demo-icon av-demo-icon-check"></span>
              ) : (
                <span class="av-demo-icon av-demo-icon-copy"></span>
              )}
            </button>
          </span>
        </div>
      )}
      <div
        ref={sourceWrap}
        class="av-demo-source-wrap"
        style={{ maxHeight: sourceMax.value + 'px' }}
      >
        {files.length > 1 && (
          <div class="av-demo-tabs">
            {files.map((file, i) => (
              <button
                type="button"
                key={file.path}
                class={['av-demo-tab', active.value === i && 'active'].filter(Boolean).join(' ')}
                onclick={() => setActive(i)}
              >
                {(() => {
                  const name = file.path.split('/').pop() ?? ''
                  return name.includes('.') ? name : `${name}.${file.lang}`
                })()}
              </button>
            ))}
          </div>
        )}
        <div ref={sourceBox} class="av-demo-source"></div>
      </div>
    </div>
  )
}
