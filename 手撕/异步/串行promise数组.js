Promise.queue = function(promiseFunctions) {
    let result = Promise.resolve(); // 创建一个已解析的 Promise 对象作为起点
    const values = []; // 存储每个 promise 函数的解析结果
  
    promiseFunctions.forEach(fn => {
      // 依次执行每个 promise 函数，并将结果存储到 values 数组中
      result = result.then(() => fn()).then(value => values.push(value));
    });
  
    return result.then(() => values); // 返回一个 Promise 对象，解析为 values 数组
  };
  
  // 使用示例
  Promise.queue([
    () => promise1,
    () => promise2,
    () => promise3
  ]).then((values) => {
    console.log(values); // [value1, value2, value3]
  }).catch((err) => {
    console.error(err); // 只要有一个 promise reject，则进入 catch
  });