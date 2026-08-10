import { ref } from 'actview'
import '../common.css'

export default function CounterDemo() {
  const count = ref(0)

  return (
    <div class="av-demo av-demo-center">
      <p class="av-count">{count.value}</p>
      <div>
        <button onclick={() => count.value--}>-1</button>
        <button onclick={() => count.value++}>+1</button>
        <button onclick={() => (count.value = 0)}>重置</button>
      </div>
    </div>
  )
}
