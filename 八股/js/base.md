# JavaScript 常见面试题总结

> JavaScript 是前端开发的核心语言，掌握其核心概念和常见面试题对求职至关重要。

## 目录

- [基础概念](#基础概念)
- [进阶知识点](#进阶知识点)
- [实际应用](#实际应用)
- [高频面试题](#高频面试题)

## 基础概念

### 1. 数据类型

**基本数据类型：**

- `number`：数字（包括整数和浮点数）
- `string`：字符串
- `boolean`：布尔值
- `null`：空值
- `undefined`：未定义
- `symbol`：唯一标识符
- `bigint`：大整数

**引用数据类型：**

- `object`：对象
- `array`：数组（特殊对象）
- `function`：函数（可调用对象）

**类型检测：**

```javascript
typeof 42; // "number"
typeof "hello"; // "string"
typeof true; // "boolean"
typeof null; // "object" (历史遗留问题)
typeof undefined; // "undefined"
typeof Symbol(); // "symbol"
typeof 123n; // "bigint"
typeof {}; // "object"
typeof []; // "object"
typeof function () {}; // "function"

// 更准确的类型检测
Object.prototype.toString.call([]); // "[object Array]"
Array.isArray([]); // true
```

### 2. 变量提升和暂时性死区

**var 的变量提升：**

```javascript
console.log(a); // undefined
var a = 1;

// 等价于
var a;
console.log(a); // undefined
a = 1;
```

**let/const 的暂时性死区：**

```javascript
console.log(b); // ReferenceError
let b = 2;

// 块级作用域
{
  console.log(c); // ReferenceError
  const c = 3;
}
```

### 3. 作用域和作用域链

**作用域类型：**

- 全局作用域
- 函数作用域
- 块级作用域（ES6）

**作用域链：**

```javascript
let globalVar = "global";

function outer() {
  let outerVar = "outer";

  function inner() {
    let innerVar = "inner";
    console.log(globalVar); // 可以访问全局变量
    console.log(outerVar); // 可以访问外层变量
    console.log(innerVar); // 可以访问内层变量
  }

  inner();
}
```

## 进阶知识点

### 1. 闭包

**定义：** 函数和其词法环境的组合

**示例：**

```javascript
function createCounter() {
  let count = 0;

  return function () {
    count++;
    return count;
  };
}

const counter = createCounter();
console.log(counter()); // 1
console.log(counter()); // 2
```

**应用场景：**

- 数据私有化
- 函数工厂
- 模块模式

### 2. this 指向

**this 的绑定规则：**

```javascript
// 1. 默认绑定
function foo() {
  console.log(this);
}
foo(); // window (非严格模式) / undefined (严格模式)

// 2. 隐式绑定
const obj = {
  name: "obj",
  foo: function () {
    console.log(this.name);
  },
};
obj.foo(); // "obj"

// 3. 显式绑定
function bar() {
  console.log(this.name);
}
const obj2 = { name: "obj2" };
bar.call(obj2); // "obj2"
bar.apply(obj2); // "obj2"
const boundBar = bar.bind(obj2);
boundBar(); // "obj2"

// 4. new 绑定
function Person(name) {
  this.name = name;
}
const person = new Person("John");
console.log(person.name); // "John"
```

    1.	立即执行 vs 返回函数
    •	call/apply → 修改 this 并马上调用函数；
    •	bind → 只绑定 this，返回新函数，延迟执行。
    2.	参数形式
    •	call：fn.call(obj, arg1, arg2, ...)
    •	apply：fn.apply(obj, [arg1, arg2, ...])
    •	bind：fn.bind(obj, arg1, arg2, ...)

### 3. 原型和原型链

**原型链：**

```javascript
function Person(name) {
  this.name = name;
}

Person.prototype.sayHello = function () {
  console.log(`Hello, I'm ${this.name}`);
};

const person = new Person("John");
person.sayHello(); // "Hello, I'm John"

// 原型链查找
console.log(person.__proto__ === Person.prototype); // true
console.log(Person.prototype.__proto__ === Object.prototype); // true
console.log(Object.prototype.__proto__ === null); // true
```

**ES6 类语法：**

```javascript
class Person {
  constructor(name) {
    this.name = name;
  }

  sayHello() {
    console.log(`Hello, I'm ${this.name}`);
  }
}
```

### 4. 事件循环

**宏任务和微任务：**

```javascript
console.log("1"); // 同步

setTimeout(() => {
  console.log("2"); // 宏任务
}, 0);

Promise.resolve().then(() => {
  console.log("3"); // 微任务
});

console.log("4"); // 同步

// 输出顺序：1, 4, 3, 2
```

**事件循环顺序：**

1. 执行同步代码
2. 执行微任务队列
3. 执行宏任务队列
4. 重复步骤 2-3

## 实际应用

### 1. 异步编程

**Promise：**

```javascript
function fetchData() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const data = { id: 1, name: "John" };
      resolve(data);
    }, 1000);
  });
}

fetchData()
  .then((data) => console.log(data))
  .catch((error) => console.error(error));
```

**async/await：**

```javascript
async function getData() {
  try {
    const data = await fetchData();
    console.log(data);
  } catch (error) {
    console.error(error);
  }
}
```

### 2. 函数式编程

**高阶函数：**

```javascript
function map(array, fn) {
  const result = [];
  for (let i = 0; i < array.length; i++) {
    result.push(fn(array[i], i, array));
  }
  return result;
}

const numbers = [1, 2, 3, 4];
const doubled = map(numbers, (x) => x * 2);
console.log(doubled); // [2, 4, 6, 8]
```

**柯里化：**

```javascript
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) {
      return fn.apply(this, args);
    }
    return function (...moreArgs) {
      return curried.apply(this, args.concat(moreArgs));
    };
  };
}

const add = curry((a, b, c) => a + b + c);
console.log(add(1)(2)(3)); // 6
```

### 3. 模块化

**ES6 模块：**

```javascript
// math.js
export const add = (a, b) => a + b;
export const subtract = (a, b) => a - b;
export default function multiply(a, b) {
  return a * b;
}

// main.js
import multiply, { add, subtract } from "./math.js";
console.log(add(1, 2)); // 3
console.log(multiply(2, 3)); // 6
```

## 高频面试题

### 1. 实现深拷贝

```javascript
function deepClone(obj, hash = new WeakMap()) {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj);
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }

  if (hash.has(obj)) {
    return hash.get(obj);
  }

  const cloneObj = Array.isArray(obj) ? [] : {};
  hash.set(obj, cloneObj);

  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloneObj[key] = deepClone(obj[key], hash);
    }
  }

  return cloneObj;
}
```

### 2. 实现防抖和节流

**防抖：**

```javascript
function debounce(fn, delay) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}
```

**节流：**

```javascript
function throttle(fn, delay) {
  let last = 0;
  return function (...args) {
    const now = Date.now();
    if (now - last >= delay) {
      fn.apply(this, args);
      last = now;
    }
  };
}
```
