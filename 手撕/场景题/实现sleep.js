async function test() {
    console.log('开始')
    await sleep(4000)
    console.log('结束')
}
//如果可以的话可以挂在原型链上链式调用
function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve()
        }, ms)
    })
}
test()
