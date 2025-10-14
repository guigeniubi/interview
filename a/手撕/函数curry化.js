function sum(x,y,z) {
    console.log(x + y + z);
    return x + y + z
    
}

function hyCurry(fn) {
    // 判断当前已经接收的参数的个数，和函数本身需要接收的参数是否一致
    function curried(...args) {
        // 1.当已经传入的参数 大于等于 需要的参数时，就执行函数
        if(args.length >= fn.length){
            // 如果调用函数时指定了this，要将其绑定上去
            return fn.apply(this, args)
        }
        else{
            // 没有达到个数时，需要返回一个新的函数，继续来接收参数
            return function(...args2) {
                //return curried.apply(this, [...args, ...args2])
                // 接收到参数后，需要递归调用 curried 来检查函数的个数是否达到
                return curried.apply(this, args.concat(args2))
            }
        }
    }
    return curried
}
var curryAdd = hyCurry(sum)
curryAdd(10,20,30)
curryAdd(10,20)(30)
curryAdd(10)(20)(30)