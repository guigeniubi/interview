//原型对象Function.prototype
interface Function {
  /** apply和call都返回这个函数的返回值
     @param this由js引擎决定
     @param argArray为一个数组形式[]
   */
  apply(this: Function, thisArg: any, argArray?: any): any;

  call(this: Function, thisArg: any, ...argArray: any[]): any;

  //bind会返回这个更换了this的函数定义
  bind(this: Function, thisArg: any, ...argArray: any[]): Function;
}

function myapply(thisarg?:any,argArray?: any) {

    //如果不传指向window
    thisarg = thisarg || window
    //判断调用对象
    if(typeof this !== "function"){
        console.error("这不是一个function")
    }

    //确保是一个数组
    let args= [...argArray];

    //！创建一个唯一的键名，防止名字冲突,传入的this是指向apply的对象并保存到fn
    const fn = Symbol("fn")
    thisarg[fn] =this;

    const result =thisarg[fn](...args)
    
    //释放缓存
    delete thisarg[fn];

    return result;
    

}

function mycall(thisarg?: any, ...argArray) {
    thisarg = thisarg || window

    if(typeof this!=="function"){
        console.error("这不是一个function")
    }
    
    const fn=Symbol("fn")
    thisarg[fn]= this;

    const result= thisarg[fn](...argArray);
    
    delete thisarg[fn]

    return result;
}

function mybind(thisarg:any,...argArray) {

    thisarg = thisarg || window
    if(typeof this!=="function"){
        console.error("这不是一个function")
    }

    const fn =this;

    return function (){
        return fn.myapply(thisarg,argArray)
    }



}
