import { onMounted, ref } from 'actview'
import './demo.css'

export function Demo(props: any = {}) {
  const expanded = ref(false)
  const copied = ref(false)
  const sourceBox = ref<HTMLElement | undefined>(undefined)
  const sourceMax = ref(0)
  let timer: ReturnType<typeof setTimeout> | undefined

  const show = props.show !== 'false'
  const sourceHtml = decodeURIComponent(props.source ?? '')
  const sourceText = decodeURIComponent(props['raw-source'] ?? '')
  const description = decodeURIComponent(props.description ?? '')
  const path = props.path ?? ''

  onMounted(() => {
    if (sourceBox.value && sourceHtml) {
      sourceBox.value.innerHTML = sourceHtml
    }
  })

  const toggleSource = () => {
    expanded.value = !expanded.value
    sourceMax.value = expanded.value && sourceBox.value ? sourceBox.value.scrollHeight : 0
  }

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(sourceText)
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
          <span class="av-demo-path">{path}</span>
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
        ref={sourceBox}
        class="av-demo-source"
        style={{ maxHeight: sourceMax.value + 'px' }}
      ></div>
    </div>
  )
}
