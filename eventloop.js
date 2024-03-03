console.log("script start");

const promiseA = new Promise((resolve, reject) => {
    console.log("init promiseA");
    resolve("promiseA");
});

const promiseB = new Promise((resolve, reject) => {
    console.log("init promiseB");
    resolve("promiseB");
});

setTimeout(() => {
    console.log("setTimeout run");
    promiseB.then(res => {
        console.log("promiseB res :>> ", res);
    });
    console.log("setTimeout end");
}, 500);

promiseA.then(res => {
    console.log("promiseA res :>> ", res);
});

console.log("script end");
