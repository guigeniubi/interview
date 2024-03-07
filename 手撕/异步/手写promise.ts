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
function PromiseAll<T>(iterable: T[]) {
  return new Promise((resovle, reject) => {
    const promises = Array.from(iterable); //需要把promises转换成数组

    const result = [];

    let count = 0;

    for (let i = 0; i < promises.length; i++) {
      Promise.resolve(promises[i])
        .then((res) => {
          result[i] = res;
          count++;
          if (count == promises.length) {
            resovle(result);
          }
        })
        .catch((err) => reject(err));
    }
  });
}

//返回的是一个Promise，并以第一个改变状态的Promise的状态为自己的状态
function PromiseRace<T>(Iterable){
    return new Promise((res,rej)=>{
        const promises=Array.from(Iterable);
        for(let i=0;i<promises.length;i++){
            Promise.resolve(promises[i]).then(res).catch(rej);
        }
    })
}