// 1.Set + 数组复制
fuction unique1(array){
    // Array.from()，对一个可迭代对象进行浅拷贝
    return Array.from(new Set(array))
}

// 2.Set + 扩展运算符浅拷贝
function unique2(array){
    // ... 扩展运算符
    return [...new Set(array)]
}

// 3.filter，判断是不是首次出现，如果不是就过滤掉
function unique3(array){
    return array.filter((item,index) => {
        return array.indexOf(item) === index
    })
}

// 4.创建一个新数组，如果之前没加入就加入
function unique4(array){
    let res = []
    array.forEach(item => {
        if(res.indexOf(item) === -1){
            res.push(item)
        }
    })
    return res
}