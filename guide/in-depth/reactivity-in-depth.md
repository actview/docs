---
description: 响应式原理：track / trigger、ReactiveEffect、批处理与 EffectScope。
---

# 响应式原理 {#reactivity-in-depth}

ActView 的响应式系统是 Vue 3 的 effect 模型：**Proxy 代理 + 依赖收集（track）+ 依赖触发（trigger）**。它只回答一个问题：*谁在读数据？数据变了叫谁？*

## 数据结构

```
targetMap: WeakMap<object, Map<key, Set<ReactiveEffect>>>
            └─ 被代理对象      └─ 属性      └─ 依赖该属性的 effects
```

- **track(target, key)**：把当前 `activeEffect` 记入 `targetMap[target][key]`；
- **trigger(target, key)**：取出该 key 的依赖集合，逐个执行（有 scheduler 走调度，否则同步 `run()`）。

## ReactiveEffect

```ts
class ReactiveEffect {
  deps: Dep[]          // 反向记录自己依赖了哪些 dep（用于清理）
  active: boolean      // stop 后为 false
  scheduler?           // 设置后 trigger 不再同步 run，而是调用 scheduler
  run()                // 清理旧依赖 → 置 activeEffect → 执行 fn → 恢复
  stop()               // 置 inactive + 清空依赖
}
```

`run()` 的关键是 **cleanupEffect**：每次重跑前清空上次收集的依赖，再重新收集——保证依赖集合永远是最新的（避免条件分支导致的过期依赖）。

## 代理层（reactive.ts）

`reactive(obj)` 返回 Proxy：

- `get` → `track(target, key)`，并**惰性代理**嵌套对象（`shouldProxy` 时递归 `reactive`）；
- `set` / `deleteProperty` → `trigger`；新增 key 时额外触发 `ITERATE_KEY`（`for...in` 依赖）；
- `has` / `ownKeys` → `track(ITERATE_KEY)`，因此 `for...in` 能响应增删 key。

### 数组的 instrument

`push` / `pop` / `shift` / `unshift` / `splice` / `sort` / `reverse` 被包装：

```ts
arrayInstrumentations[method] = function (this, ...args) {
  pauseTracking()                                    // 执行期间暂停收集
  const res = Array.prototype[method].apply(this, args)
  resetTracking()
  return res
}
```

- 内部对 length / 索引的写入走代理 `set` → 触发数组自身与**父级**依赖（`state.items`）；
- 新增整数索引时显式 `trigger(target, 'length')`（`set('length')` 检测不到变化）；
- 执行期间 `pauseTracking`：不把修改过程内部读取收集进当前 effect。

## 调度批处理（queueJob）

组件 effect 带 `scheduler: queueJob`——更新不会同步执行，而是入**微任务队列**：

```
trigger → queueJob（Set 去重）→ Promise.resolve().then(flushJobs) → 逐个 effect.run()
```

同一次修改触发的多个 effect 会去重并批量刷新；`nextTick()` 返回本轮 flush 结束后的 Promise。

## EffectScope

`EffectScope` 管理一组 effect 的生命周期：

```ts
const scope = new EffectScope()
scope.run(() => {
  // 这里创建的 watch/computed/effect 都注册进 scope
})
scope.stop() // 一次性停止全部
```

组件实例自带 `scope`：`setup` 期间创建的 `watch` / `watchEffect` / `computed` / render effect 都注册进去，组件卸载时 `scope.stop()` 统一清理——这就是「setup 内的侦听器无需手动 stop」的原因。`getCurrentScope()` 可读取当前作用域。

## 派生：computed 的脏标记

`computed` 是带缓存的特殊 effect：

- **惰性**：首次读取才求值；
- **脏标记**：依赖变化时仅标记为脏，不立即重算；下次读取发现脏才重新执行 getter；
- 读取 `computed.value` 时会把它作为依赖收集（支持链式依赖）。

## watch / watchEffect

- `watch(source, cb, options?)`：侦听单个/多个数据源，变化时异步触发回调；`immediate` 立即执行一次；返回 `stop()`；对象源默认深度监听；
- `watchEffect(fn)`：立即执行一次并收集依赖，之后依赖变化自动重跑；返回 `stop()`。

## 下一步

- [渲染机制](./rendering-mechanism)：effect 如何驱动 `render + patch`
- [响应式基础](../essentials/reactivity)：`ref` / `reactive` / `computed` / `watch` 用法
