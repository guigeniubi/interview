function cache(func) {
  var caches = {};
  return function (...args) {
    const key = JSON.stringify(args);
    if (caches[key]) {
      return caches[key];
    } else {
      caches[key] = func.apply(this, args);
      return caches[key];
    }
  };
}
function add(a, b) {
  return a + b;
}
const addCache = cache(add);
console.log(addCache(1, 2));
console.log(addCache(1, 2)); //第二次调用时，直接返回缓存的结果
console.log(addCache(1, 3));
