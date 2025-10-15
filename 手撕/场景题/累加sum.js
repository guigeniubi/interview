function createAdder() {
    let sum = 0;
  
    function adder(value) {
      if (value === undefined) {
        return sum;
      } else if (typeof value === 'function') {
        sum = 0;
        return adder;
      }
      sum += value;
      return adder;
    }
  
    return adder;
  }
  
  // 使用示例
  const adder = createAdder();
  console.log(adder(1)(2)(3)()); // 输出 6
  console.log(adder(4)(5)());    // 输出 15
  console.log(adder(() => {})()); // 重置累加和，输出 0
  