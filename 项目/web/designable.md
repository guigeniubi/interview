“我们在 sayloai 项目里自研了一套基于 Formly + Designable 思路的运营可视化搭建系统，分成设计态和运行态两部分。设计态用拖拽生成 Schema，运行态 Schema 驱动渲染，还支持动态联动、异步数据源和热更新，这样活动页面可以完全由运营配置和发布，研发只需维护组件库。

# 可视化表单搭建系统

参考学习：
https://www.yuque.com/xjchenhao/development/wd0vsg#u0pku
组件属性可配置主要依赖 json Schema 描述，属性配置就是要实现一个 jsonSchema 规范的可视化面板，较复杂的功能点是对数组、对象类型的递归。

## 1. 系统总览

基于 **Formly** 与 **Designable** 思想的运营可视化表单搭建系统，通过拖拽生成页面，实时预览并生成 Schema 驱动的表单，运营可独立配置与发布活动。

### 核心价值

- **降低开发成本**：运营人员可独立搭建表单页面，无需开发介入
- **提升配置效率**：可视化拖拽 + 实时预览，所见即所得
- **统一表单规范**：基于 JSON Schema 标准，保证数据结构一致性
- **灵活扩展性**：组件化设计，支持自定义业务组件

## 2. 技术架构

### 核心技术栈

```typescript
// 架构分层
interface SystemArchitecture {
  designEngine: "Designable"; // 设计器引擎
  formEngine: "Formly"; // 表单引擎
  schemaStandard: "JSON Schema"; // 数据规范
  renderEngine: "React"; // 渲染引擎
  stateManager: "Zustand"; // 状态管理
}
```

### 系统架构图

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   设计器层       │    │   引擎层         │    │   运行时层       │
│  Designable     │    │   Formly        │    │   Renderer      │
│                 │    │                 │    │                 │
│ • 组件拖拽       │───▶│ • Schema生成    │───▶│ • 表单渲染       │
│ • 属性配置       │    │ • 数据验证      │    │ • 数据收集       │
│ • 实时预览       │    │ • 联动逻辑      │    │ • 事件处理       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────────────────────────────────────────────────────┐
│                     JSON Schema 数据层                          │
│  • 组件定义  • 布局信息  • 验证规则  • 联动配置  • 样式主题      │
└─────────────────────────────────────────────────────────────────┘
```

## 3. Formly 集成 - Schema 驱动表单

### Schema 设计规范

```typescript
// 函数式 Schema 构建
interface FormSchema {
  type: "object";
  properties: Record<string, FieldSchema>;
  required?: string[];
  dependencies?: DependencyConfig;
}

interface FieldSchema {
  type: "string" | "number" | "boolean" | "array" | "object";
  title: string;
  widget: "input" | "select" | "checkbox" | "upload" | "custom";
  default?: any;
  validation?: ValidationRule[];
  conditional?: ConditionalConfig;
}

// 函数式 Schema 操作
const createField = (type: string, config: Partial<FieldSchema>) => ({
  type,
  ...config,
});

const addValidation = (field: FieldSchema, rule: ValidationRule) => ({
  ...field,
  validation: [...(field.validation || []), rule],
});
```

### 动态表单渲染

```typescript
// 函数式组件渲染
const renderFormField = (
  schema: FieldSchema,
  value: any,
  onChange: Function
) => {
  const fieldProps = {
    value,
    onChange,
    ...extractWidgetProps(schema),
  };

  return match(schema.widget)({
    input: () => <InputWidget {...fieldProps} />,
    select: () => <SelectWidget {...fieldProps} />,
    checkbox: () => <CheckboxWidget {...fieldProps} />,
    upload: () => <UploadWidget {...fieldProps} />,
    custom: () => <CustomWidget {...fieldProps} schema={schema} />,
  });
};

// 表单状态管理
const useFormState = (schema: FormSchema) => {
  const [values, setValues] = useState({});
  const [errors, setErrors] = useState({});

  const updateField = useCallback(
    (path: string, value: any) => {
      setValues((prev) => setDeepValue(prev, path, value));
      validateField(path, value, schema);
    },
    [schema]
  );

  return { values, errors, updateField };
};
```

## 4. Designable 实现 - 可视化设计器

### 拖拽设计器核心

```typescript
// 设计器状态管理
interface DesignState {
  components: ComponentNode[]; // 组件树
  selectedId: string | null; // 选中组件
  dragState: DragState; // 拖拽状态
  previewMode: boolean; // 预览模式
}

// 函数式组件树操作
const addComponent = (
  tree: ComponentNode[],
  targetId: string,
  component: ComponentNode
) =>
  tree.map((node) =>
    node.id === targetId
      ? { ...node, children: [...node.children, component] }
      : { ...node, children: addComponent(node.children, targetId, component) }
  );

const updateComponent = (
  tree: ComponentNode[],
  id: string,
  updates: Partial<ComponentNode>
) =>
  tree.map((node) =>
    node.id === id
      ? { ...node, ...updates }
      : { ...node, children: updateComponent(node.children, id, updates) }
  );
```

### 组件属性配置面板

```typescript
// 动态属性配置
const PropertyPanel = ({
  selectedComponent,
}: {
  selectedComponent: ComponentNode;
}) => {
  const propertySchema = getComponentPropertySchema(selectedComponent.type);

  return (
    <div className="property-panel">
      {Object.entries(propertySchema.properties).map(([key, schema]) => (
        <PropertyField
          key={key}
          name={key}
          schema={schema}
          value={selectedComponent.props[key]}
          onChange={(value) =>
            updateComponentProperty(selectedComponent.id, key, value)
          }
        />
      ))}
    </div>
  );
};

// 递归处理复杂属性
const PropertyField = ({ name, schema, value, onChange }) => {
  if (schema.type === "object") {
    return (
      <ObjectPropertyField schema={schema} value={value} onChange={onChange} />
    );
  }

  if (schema.type === "array") {
    return (
      <ArrayPropertyField schema={schema} value={value} onChange={onChange} />
    );
  }

  return (
    <SimplePropertyField schema={schema} value={value} onChange={onChange} />
  );
};
```

## 5. 运营配置与发布流程

### 运营工作流

```typescript
// 函数式工作流定义
const operationWorkflow = pipe(
  createProject, // 1. 创建项目
  designForm, // 2. 拖拽设计表单
  configProperties, // 3. 配置组件属性
  previewAndTest, // 4. 预览测试
  generateSchema, // 5. 生成 Schema
  publishActivity // 6. 发布活动
);

// 发布配置
interface PublishConfig {
  activityId: string;
  formSchema: FormSchema;
  publishTime: Date;
  expireTime: Date;
  targetAudience: string[];
  abTestConfig?: ABTestConfig;
}

const publishActivity = async (config: PublishConfig) => {
  const validatedSchema = validateFormSchema(config.formSchema);
  const publishResult = await deployToProduction({
    ...config,
    formSchema: validatedSchema,
  });

  return publishResult;
};
```

### 实时预览机制

```typescript
// 设计态到运行态的转换
const designToRuntimeTransform = (designState: DesignState): FormSchema => {
  return pipe(
    designState.components,
    convertComponentsToSchema,
    addValidationRules,
    optimizeSchema
  );
};

// 实时预览组件
const PreviewRenderer = ({ designState }: { designState: DesignState }) => {
  const runtimeSchema = useMemo(
    () => designToRuntimeTransform(designState),
    [designState]
  );

  return <FormRenderer schema={runtimeSchema} onSubmit={handlePreviewSubmit} />;
};
```

## 6. 核心技术难点与解决方案

### 1. 递归组件属性配置

```typescript
// 处理嵌套对象和数组的递归渲染
const renderPropertyRecursively = (schema: any, path: string[], value: any) => {
  if (schema.type === "object") {
    return Object.entries(schema.properties).map(([key, subSchema]) =>
      renderPropertyRecursively(subSchema, [...path, key], value?.[key])
    );
  }

  if (schema.type === "array") {
    return (value || []).map((item: any, index: number) =>
      renderPropertyRecursively(schema.items, [...path, index], item)
    );
  }

  return <PropertyInput schema={schema} path={path} value={value} />;
};
```

### 2. Schema 与 UI 的双向绑定

```typescript
// Schema 变更驱动 UI 更新
const useSchemaBinding = (initialSchema: FormSchema) => {
  const [schema, setSchema] = useState(initialSchema);
  const [uiState, setUIState] = useState(() => schemaToUIState(initialSchema));

  const updateSchema = useCallback(
    (updater: (schema: FormSchema) => FormSchema) => {
      setSchema((prevSchema) => {
        const newSchema = updater(prevSchema);
        setUIState(schemaToUIState(newSchema));
        return newSchema;
      });
    },
    []
  );

  return { schema, uiState, updateSchema };
};
```

### 3. 性能优化策略

- **虚拟滚动**：大量组件时使用虚拟列表渲染
- **增量更新**：只重新渲染变更的组件
- **Schema 缓存**：复杂 Schema 计算结果缓存
- **懒加载组件**：按需加载自定义组件

## 7. 系统优势

✅ **开发效率**：运营独立配置，减少 70% 开发工作量
✅ **维护成本**：统一 Schema 规范，降低维护复杂度  
✅ **扩展能力**：组件化架构，支持快速业务定制
✅ **用户体验**：所见即所得，实时预览验证
✅ **数据一致性**：JSON Schema 保证数据结构标准化

这套系统让运营人员具备了"程序员"的能力，能够独立创建复杂的表单页面，大大提升了业务响应速度！
