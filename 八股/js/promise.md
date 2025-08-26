Promise 链关键点整理

1.  状态一旦确定就不能更改
    const p = new Promise((resolve, reject) => {
    reject("error");
    resolve("success"); // ❌ 被忽略
    });
    • 第一次调用 resolve 或 reject 后，Promise 状态就锁死，不会再变化。

2.  then / catch 的返回值
    • 返回普通值 → 自动包装成 Promise.resolve(value)，传给下一个 .then。
    • 返回 Promise → 下一个 .then 等待这个 Promise 的结果。
    • throw error / 返回 Promise.reject → 进入下一个 .catch。
    • 不写 return → 等价于 return undefined。
3.  错误传播（冒泡）
    • 如果 .then 没有处理错误（没有写第二个参数），错误会继续往后冒泡，直到被最近的 .catch 捕获。

4.  catch 的作用
    • .catch(fn) 等价于 .then(null, fn)，专门处理链条里的 rejected。
    • catch 之后如果返回值 → 链条恢复为 resolved，后面的 .then 会继续执行。
    • 如果什么都不 return → 默认传递 undefined。

⸻

1.  async 函数的本质
    • async function 一定返回一个 Promise。
    • return 普通值 → 自动包装成 Promise.resolve(value)。
    • throw error → 相当于返回 Promise.reject(error)。
1.  await 的作用
    • await promise 会 暂停 async 函数，等 promise 执行完再恢复。
    • 如果 promise resolved → 返回结果。
    • 如果 promise rejected → 抛出异常（需要 try/catch 处理）。
