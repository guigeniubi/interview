## Q1：Formly

what: Schema 驱动,所有表单由 JSON Schema 定义，不需要手写大量 JSX

how:
a.Formily 内部有个 响应式引擎（类似 MobX 原理），叫 Reactive System。用发布订阅的设计模式,性能好
b.每个 Field、Form 实例都能订阅数据变化，做到精准更新，不会全量渲染。

**A**：Schema 驱动表单渲染。

- Schema = 表单描述；组件根据 widget 字段渲染。
- 表单状态：values/errors/updateField 三件套。
- 难点：对象/数组类型递归渲染。

```typescript
const renderFormField = (schema, value, onChange) => {
  switch (schema.widget) {
    case "input":
      return <InputWidget value={value} onChange={onChange} />;
    // 其他组件...
  }
};
```

---

## Q3：Designable 思路是什么？

**A**：可视化拖拽生成 Schema。

面试可说的点
• 考虑 组件解耦和可维护性（写个 map 注册表/工厂模式）。
• 拖拽性能优化（虚拟列表、rAF 节流，懒加载）。
• Schema 的可维护性（版本升级、向后兼容）。

```typescript
const addComponent = (tree, targetId, comp) =>
  tree.map((node) =>
    node.id === targetId
      ? { ...node, children: [...node.children, comp] }
      : { ...node, children: addComponent(node.children, targetId, comp) }
  );
```

---

## Q5：为什么要区分深拷贝与浅拷贝？

**A**：平衡安全性与性能。

- **深拷贝**：复制组件/保存历史快照/更新嵌套数据。
- **浅拷贝**：更新单一属性/根节点优化渲染。
- 历史管理：`useHistoryManager` 保存快照（深拷贝）。

---

## Q6：性能优化有哪些？

**A**：

- 虚拟滚动 → 大量组件时提升渲染性能。
- 增量更新 → 只重渲染变更节点。
- Schema 缓存 → 复杂 Schema 结果缓存。
- 懒加载组件 → 按需加载业务组件。
- 智能拷贝 → 深浅拷贝按场景使用。

---

## Q7：运营发布流程？

**A**：函数式工作流。

- 创建项目 → 拖拽表单 → 配置属性 → 预览测试 → 生成 Schema → 发布活动。
- 发布配置：包含活动 ID、Schema、时间、目标人群、ABTest 配置。
- 部署：`deployToProduction`。

```typescript
const operationWorkflow = pipe(
  createProject,
  designForm,
  configProperties,
  previewAndTest,
  generateSchema,
  publishActivity
);
```

---

## 一句话总括

**Schema 保一致，Designable 保灵活，深浅拷贝保性能。**
