function MyPromise(): Promise<string> {
  return new Promise((res, rej) => {
    setTimeout(() => {
      res("");
    }, 200);
  });
}
MyPromise()
  .then((res) => {
    console.log(res);
  })
  .catch((error) => {
    console.log(error);
  });

function Promisethen(onResovled, onRejected) {
  const newPromise = new Promise((resovled, reject) => {
    if (this.status === "resovled") {
      try {
        const x = onResovled(this.value);
        resovled(x);
      } catch (error) {
        reject(error);
      }
    }
    if (this.status === "rejected") {
      try {
        const x = onRejected(this.value);
        resovled(x);
      } catch (error) {
        reject(error);
      }
    }
  });
  return newPromise;
}

//都成功返回的是全部成功的Promise数组
function promiseAll(promises) {
  if (!Array.isArray(promises)) {
    return;
  }
  return new Promise(function (resolve, reject) {
    // 记录已解决的 promise 的数量
    let resolvedCount = 0;
    // 记录每个 promise 的结果
    const promiseResults = new Array(promises.length);
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then((value) => {
          resolvedCount++;
          promiseResults[index] = value;
          if (resolvedCount === promises.length) {
            resolve(promiseResults);
          }
        })
        .catch((err) => {
          // 任何一个 Promise 失败，立即 reject
          reject(err);
        });
    });
  });
}

//返回的是一个Promise，并以第一个改变状态的Promise的状态为自己的状态
function PromiseRace<T>(Iterable) {
  return new Promise((res, rej) => {
    const promises = Array.from(Iterable);
    for (let i = 0; i < promises.length; i++) {
      Promise.resolve(promises[i]).then(res).catch(rej);
    }
  });
}
// allSettled：返回一个Promise，所有输入的Promise都已settled（无论fulfilled还是rejected）后，返回每个结果的对象数组
function promiseAllSettled(promises) {
  if (!Array.isArray(promises)) {
    return;
  }
  return new Promise((resolve) => {
    const results = new Array(promises.length);
    let settledCount = 0;
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then((value) => {
          results[index] = { status: "fulfilled", value };
        })
        .catch((reason) => {
          results[index] = { status: "rejected", reason };
        })
        .finally(() => {
          settledCount++;
          if (settledCount === promises.length) {
            resolve(results);
          }
        });
    });
    // 处理空数组
    if (promises.length === 0) {
      resolve([]);
    }
  });
}

// any：只要有一个Promise成功就返回其值，否则返回AggregateError
function promiseAny(promises) {
  if (!Array.isArray(promises)) {
    return;
  }
  return new Promise((resolve, reject) => {
    let rejectedCount = 0;
    const errors = new Array(promises.length);
    promises.forEach((promise, index) => {
      Promise.resolve(promise)
        .then(resolve)
        .catch((err) => {
          rejectedCount++;
          errors[index] = err;
          if (rejectedCount === promises.length) {
            // AggregateError是ES2021标准，可以用Error模拟
            reject(
              new Error("All promises were rejected: " + JSON.stringify(errors))
            );
          }
        });
    });
    // 处理空数组
    if (promises.length === 0) {
      reject(new Error("All promises were rejected: []"));
    }
  });
}
