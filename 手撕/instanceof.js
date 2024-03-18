// 原理：验证当前类的原型prototype是否会出现在实例的原型链proto上，只要在它的原型链上，则结果都为true
function myinstanceOf_(obj, class_name) {
    // let proto = obj.__proto__;
  let proto = Object.getPrototypeOf(obj)
  let prototype = class_name.prototype
  while (true) {
      if (proto == null) return false
      if (proto == prototype) return true
        // proto = proto.__proto__;
      proto = Object.getPrototypeOf(proto)
  }
}

