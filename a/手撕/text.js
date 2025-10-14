function shallowClone(obj) {
  let cloneObj = {};

  for (let i in obj) {
    cloneObj[i] = obj[i];
  }

  return cloneObj;
}

// 处理循环引用的深拷贝
function deepClone(obj, hash = new WeakMap()) {
  // 处理基本类型和null
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // 处理日期对象
  if (obj instanceof Date) {
    return new Date(obj);
  }

  // 处理正则对象
  if (obj instanceof RegExp) {
    return new RegExp(obj);
  }

  // 检查是否已经拷贝过该对象
  if (hash.has(obj)) {
    return hash.get(obj);
  }

  // 创建新的对象或数组
  const clone = Array.isArray(obj) ? [] : {};
  
  // 将当前对象存入hash表
  hash.set(obj, clone);

  // 递归拷贝所有属性
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepClone(obj[key], hash);
    }
  }

  return clone;
}

// 测试循环引用
const obj = {
  name: 'test',
  arr: [1, 2, 3]
};
obj.self = obj; // 创建循环引用

// 使用深拷贝处理循环引用
const clonedObj = deepClone(obj);
console.log(clonedObj); // 可以正常输出，不会栈溢出