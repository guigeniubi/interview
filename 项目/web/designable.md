## Q1：这个系统解决了什么问题？

**A**：降低前端介入成本，让运营可视化搭建表单页面。

- 拖拽生成 Schema → 实时预览 → 一键发布。
- 运营独立配置活动，减少开发负担。
- 数据结构统一（JSON Schema），保证上下游一致性。

---

## Q2：Formly 思路是什么？

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

- 状态：组件树/选中组件/拖拽状态/预览模式。
- 操作：addComponent / updateComponent → 纯函数更新树。
- 属性配置：基于 JSON Schema → 递归处理 object/array → SimplePropertyField。

```typescript
const addComponent = (tree, targetId, comp) =>
  tree.map((node) =>
    node.id === targetId
      ? { ...node, children: [...node.children, comp] }
      : { ...node, children: addComponent(node.children, targetId, comp) }
  );
```

---

## Q4：Schema 与 UI 如何绑定？

**A**：双向绑定。

- Schema 驱动 UI：更新 Schema → UIState 变化。
- UI 反馈 Schema：操作 UI → 更新 Schema。
- Hook：`useSchemaBinding`。

```typescript
const useSchemaBinding = (initialSchema) => {
  const [schema, setSchema] = useState(initialSchema);
  const [uiState, setUIState] = useState(schemaToUIState(initialSchema));
  const updateSchema = (updater) => {
    setSchema((prev) => {
      const newSchema = updater(prev);
      setUIState(schemaToUIState(newSchema));
      return newSchema;
    });
  };
  return { schema, uiState, updateSchema };
};
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
