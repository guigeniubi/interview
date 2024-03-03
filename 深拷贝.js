// obj ={
//     a : "123",
//     b : "023"
    
// }
// obj2 =JSON.parse(JSON.stringify(obj))

function deepClone(target) {
    if (typeof target === 'object' && target) {
        let cloneObj = {}
        for (const key in target) { // 遍历
            const val = target[key]
            if (typeof val === 'object' && val) {
                cloneObj[key] = deepClone(val) // 是对象就再次调用该函数递归
            } else {
                cloneObj[key] = val // 基本类型的话直接复制值
            }
        }
        return cloneObj
    } else {
        return target;
    }
}