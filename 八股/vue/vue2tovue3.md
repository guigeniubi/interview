# Vue2 和 Vue3 的区别对比

## 1. 响应式系统

- **Vue2**：使用 `Object.defineProperty` 实现响应式，存在一定的性能和灵活性限制。
- **Vue3**：采用 `Proxy` 实现响应式，支持更全面的响应式特性，性能更优。

## 2. API 风格

- **Vue2**：主要使用 Options API（如 data、methods、computed 等）。
- **Vue3**：引入 Composition API，逻辑复用更灵活，代码组织更清晰。

## 3. 性能优化

- **Vue3**：
  - 静态节点提升（Static Hoisting），减少渲染开销。
  - 使用 PatchFlags 优化虚拟 DOM 更新。
  - 支持 Tree-shaking，减小打包体积。

## 4. TypeScript 支持

- **Vue2**：TypeScript 支持较弱，需要额外配置。
- **Vue3**：原生支持 TypeScript，类型推断和开发体验更好。

## 5. 新特性

- **Fragment**：组件可以返回多个根节点，减少无意义的包裹元素。
- **Teleport**：将组件渲染到 DOM 的任意位置。
- **Suspense**：支持异步组件的加载状态管理。

## 6. 生命周期钩子命名变化

- Vue3 中部分生命周期钩子名称有所调整，例如：
  - `beforeDestroy` 改为 `beforeUnmount`
  - `destroyed` 改为 `unmounted`

## 7. v-model

- **Vue2**：单一 `v-model` 绑定一个 prop 和事件。
- **Vue3**：支持多个 `v-model`，可以绑定多个 prop 和事件，增强灵活性。

## 8. 全局 API 变化

- **Vue2**：全局注册通过 `Vue.use`、`Vue.mixin` 等。
- **Vue3**：改为基于应用实例的 API，例如 `app.use`、`app.mixin`，支持多实例管理。
