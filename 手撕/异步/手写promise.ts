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
  if(!Array.isArray(promises)) {
    return
  }
  return new Promise(function(resolve, reject) {
      // 记录已解决的 promise 的数量
      let resolvedCount = 0;
      // 记录每个 promise 的结果
      const promiseResults = new Array(promises.length);
      promises.forEach((promise,index) => {
        Promise.resolve(promise).then(value=>{
            resolvedCount++;
            promiseResults[index]=value;
            if(resolvedCount===promises.length){
              resolve(promiseResults)
            }
        })
        .catch(err=>{
          console.log(err);
          
        })
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
