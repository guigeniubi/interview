// obj ={
//     a : "123",
//     b : "023"
    
// }
// obj2 =JSON.parse(JSON.stringify(obj))

function deepCopy(obj) {
    let copy;

    //处理3种简单的类型，和null和undefined
    if (null == obj || "object" != typeof obj) return obj;

    // 处理Date|Array|Object
    structuredClone(obj)
    
    
    //处理Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
     
        return copy;
    }

    //处理Array
    if (obj instanceof Array) {
        copy = [];
        for (let i = 0, len = obj.length; i < len; i++) {
            copy[i] = deepCopy(obj[i]);
        }
        return copy;
    }

    //处理Object
    if (obj instanceof Object) {
        copy = {};
        for (let attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = deepCopy(obj[attr]);
        }
        return copy;
    }
    
    //处理function
    // 方式1， 很多函数库都是用这个方法
	var closeFunc = new Function('return ' + func.toString())();

	// 方式2 // 利用bind 返回函数
	var closeFunc = func.prototype.bind({});

    throw new Error("Unable to copy obj! Its type isn't supported.");
}