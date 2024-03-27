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
  return new Promise(function(resolve, reject) {
      // 记录已解决的 promise 的数量
      let resolvedCount = 0;
      // 记录每个 promise 的结果
      const promiseResults = new Array(promises.length);

      for (let i = 0; i < promises.length; i++) {
          // 立即执行每个 promise
          promises[i].then(
              // promise 成功解决
              value => {
                  resolvedCount++;
                  promiseResults[i] = value;

                  // 如果所有的 promise 都解决了，那么我们可以解决总的 promise
                  if (resolvedCount === promises.length) {
                      resolve(promiseResults);
                  }
              },
              // 如果任何一个 promise 失败了，我们都需要拒绝总的 promise
              error => {
                  reject(error);
              }
          );
      }
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
