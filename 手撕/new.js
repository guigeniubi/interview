function myNew(){
    //1.创建一个新的对象
    let obj = {};
    //获得构造函数
    let con = [].shift.call(arguments); 
    //2.新对象的隐式原型__proto__链接到构造函数的显式原型prototype
    obj.__proto__ = con.prototype;
    //3.构造函数内部的 this 绑定到这个新创建的对象 执行构造函数
    let result = con.apply(obj, arguments)
    //4.如果构造函数没有返回非空对象，则返回创建的新对象
    return result instanceof Object ? result:obj;
}
