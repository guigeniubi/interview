# Vue 基础知识

## 模板编译

- Vue 模板编译的核心是将模板字符串转换成渲染函数（render function）。
- 编译过程会先将模板解析成抽象语法树（AST），AST 是模板的中间表示，方便后续优化和代码生成。
- **难点解析：**
  - **AST 结构**：AST 节点包含标签名、属性、子节点等信息，编译器通过遍历 AST 生成渲染函数代码。
  - **静态节点提升**：编译器会标记静态节点，将其提升到渲染函数外，避免每次渲染重复创建，提升性能。
  - **with 作用域**：生成的渲染函数使用 `with` 语句包裹，方便直接访问组件实例的属性。但这也带来作用域污染和调试难度。
- **Vue3 差异**：Vue3 使用更激进的编译优化策略，包括构建 block tree，静态提升更加彻底，并引入 patchFlags 来标记节点动态性，显著提升渲染性能。

## render 函数

- render 函数返回虚拟 DOM（VNode）树，VNode 是对真实 DOM 的抽象描述。
- VNode 结构一般包含标签名、数据对象（data）、子节点（children）、文本内容、key、patchFlags 等。
- **难点解析：**
  - **VNode 结构**：VNode 不仅表示节点类型，还包含动态标记（patchFlags），用于优化更新过程。
  - **children**：可以是字符串、数组或函数，支持插槽和动态内容。
  - **patchFlags**：标记节点的动态属性，帮助 patch 阶段快速定位需要更新的部分，减少不必要的 DOM 操作。
- **Vue3 差异**：Vue3 的 VNode 结构增加了 shapeFlag，用于更细粒度地描述节点类型和状态；动态节点标记更细致，配合 patchFlags 使更新更精准高效。

## 响应式

- Vue 通过数据劫持实现响应式，核心是 `defineReactive` 方法。
- 通过 `Object.defineProperty` 拦截属性的 getter 和 setter，实现依赖收集和派发更新。
- **难点解析：**
  - **defineReactive**：为对象属性添加 getter/setter，getter 中收集依赖，setter 中触发更新。
  - **依赖收集原理**：利用全局的 Dep.target 指向当前的 watcher，getter 时将 watcher 添加到依赖列表。
  - **数组方法重写**：Vue 重写了数组的变异方法（如 push、pop、splice），以便监听数组变化，触发视图更新。
- 对象新增属性和数组索引变化无法被 Vue 监听，需使用 `$set` 或替代方案。
- 深层嵌套对象的响应式性能较差，频繁修改深层属性可能导致性能瓶颈。
- **Vue3 差异**：Vue3 使用 Proxy + Reflect 实现响应式，天然支持数组索引和属性新增/删除的监听，无需额外的 $set，性能和灵活性大幅提升。

## Watcher / Dep

- Watcher 是观察者，Dep 是依赖管理器，二者配合实现响应式更新。
- Watcher 在执行时会将自己设置为 Dep.target，触发属性的 getter 进行依赖收集。
- **难点解析：**
  - **Dep.target 和栈结构**：Dep.target 采用栈结构管理，支持嵌套 watcher，防止依赖收集错乱。
  - **更新队列去重**：Watcher 更新会进入队列，使用队列去重机制，避免同一 watcher 多次执行，提高性能。
- **Vue3 差异**：Vue3 用 ReactiveEffect 替代 Watcher，依赖追踪系统更灵活，调度器支持异步队列和调度策略，提升响应式系统的性能和可扩展性。

## patch / diff

- Vue 通过 patch 函数将新旧 VNode 树进行比对，更新真实 DOM。
- 采用双端比较算法，分别从头尾两个方向遍历，提高比对效率。
- **难点解析：**
  - **双端比较**：通过头尾指针同时向中间移动，处理节点的增删改。
  - **key 的意义**：key 用于标识节点身份，帮助 diff 算法快速定位节点，避免不必要的 DOM 重排。
  - **sameVnode 判定条件**：节点类型、key、标签名等必须相同，才能认为是同一节点，执行复用。
- **Vue3 差异**：Vue3 结合 block tree 和 patchFlags，减少全量 diff 过程，只对动态部分进行更新，极大提升渲染效率。

## computed vs watch 对比

- **缓存机制**  
  computed 有缓存，只有依赖变化时才会重新计算；watch 每次依赖变化都会触发回调函数。

- **适用场景**  
  computed 更适合用于模板绑定的派生数据；watch 更适合执行副作用操作，比如异步请求或手动操作。

- **使用方式**  
  computed 是属性，像数据一样使用；watch 是方法，需要监听某个 key。

- **实现机制**  
  computed 使用 lazy watcher 和 dirty 标记来控制计算；watch 使用普通 watcher，依赖变化时立即触发回调。
- **Vue3 差异**：Vue3 提供函数式 API，computed 通过 `computed(() => ...)` 创建，watch 通过 `watch(source, callback)` 使用，内部均基于 effect 实现，API 更加灵活和直观。

## ref vs reactive 对比

- **ref**  
  适合基本类型，返回带 `.value` 的响应式对象，在模板中自动解包。  
  访问时需要通过 `.value` 读取和修改。

- **reactive**  
  适合对象、数组、Map、Set 等复杂类型，基于 Proxy 实现，支持深层响应式。  
  访问属性和方法时直接操作原对象，无需额外 `.value`。

- **区别**

  - 访问方式：ref 需通过 `.value`，reactive 直接访问属性。
  - 适用场景：ref 适合基本类型和单个值，reactive 适合复杂数据结构。
  - 解构响应性：ref 解构后仍可保持响应性，reactive 解构后会丢失响应性。
  - 内部实现：ref 底层是 RefImpl 类，通过 `.value` 的 getter/setter 收集依赖；reactive 使用 `createReactiveObject` 返回 Proxy，拦截 get/set/delete 操作。

- **Vue3 源码层面**

  - ref 是 RefImpl 类实例，依赖收集在 `.value` 的访问时触发。
  - reactive 通过 `createReactiveObject` 创建 Proxy，拦截对象操作实现响应式。

- **常见陷阱**
  - ref 包裹对象时，访问对象属性需通过 `.value`，不如 reactive 直观。
  - reactive 对象解构后，响应性丢失，需避免直接解构或使用 `toRefs`。
  - 模板中 ref 会自动解包，无需 `.value`，但在 JS 代码中必须使用 `.value`。

## $set

- Vue 不能检测对象属性的新增和数组索引的变化，提供了 `$set` 方法解决。
- **难点解析：**
  - **数组 splice hack**：利用 splice 方法替代直接赋值，触发响应式更新。
  - **对象 defineReactive 再绑定**：新增属性时，使用 defineReactive 重新绑定 getter/setter，实现响应式。
- **Vue3 差异**：Vue3 移除了 `$set`，因为 Proxy 能够监听属性的新增和删除，无需额外方法。

## $nextTick

- $nextTick 用于在 DOM 更新后执行回调。
- 内部使用微任务（Promise.then、MutationObserver）优先级高于宏任务。
- **难点解析：**
  - **微任务优先级**：保证回调在 DOM 更新后立即执行，避免多次 DOM 操作带来的性能问题。
  - **合并回调队列**：多次调用 $nextTick 会合并回调，避免重复执行，提高效率。
- **Vue3 差异**：Vue3 的 $nextTick 依然存在，但内部实现简化，基于 Promise，保证微任务执行而减少复杂性。

## v-if vs v-for 的原理和区别

- **v-if 原理**：编译阶段生成条件分支节点，运行时通过判断条件决定是否渲染或销毁节点。
- **v-for 原理**：编译阶段转化成循环渲染，生成 render 函数中的循环，依赖 key 来优化 diff。
- **区别**：
  - v-if 是控制节点是否存在，v-for 是列表渲染。
  - v-if 开销大，因为涉及销毁和重建；v-for 更适合渲染批量数据。
  - v-if 和 v-for 同时使用时，v-for 优先级高于 v-if，可能导致性能问题。
- **Vue3 差异**：Vue3 保持编译时优化策略，静态提升和缓存 Fragment 节点更高效，提升 v-if 和 v-for 的渲染性能和稳定性。

### 面试高频陷阱

- v-if 和 v-for 同时使用时，v-for 优先级更高，可能导致每次循环都重新计算 v-if 条件，性能较差。
- 在 v-for 内部直接使用 v-if，可能导致渲染不稳定，建议将 v-if 提前到外层，或者通过计算属性过滤数据。
- v-if 和 key 配合使用时，可能强制销毁重建节点，导致组件状态丢失，需要注意合理使用 key。
