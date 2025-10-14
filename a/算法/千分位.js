//字符串+substring
function format(number) {
    // 将数字转为字符串，并按照小数点拆分
    const [int, fraction] = String(number).split('.')
    // 计算整数部分多余的位数
    const f = int.length % 3
    // 截取多余的位数
    let res = int.substring(0, f)
    // 每三位添加 , 和对应的字符
    for (let i = 0; i < Math.floor(int.length / 3); i++) {
        res += ',' + int.substring(f + i * 3, f + (i + 1) * 3)
    }
    // 如果没有多余的位数，则截取最前面的 ,
    if (f === 0) {
        res = res.substring(1)
    }
    // 整数和小数拼接
    return res + (!!fraction ? `.${fraction}` : '')
}
console.log(format(987654321.02)) // 输出 987,654,321.02
//字符串和拼接
/**
 * 将数字格式化为千位分隔符的形式
 * @param number 要格式化的数字
 * @returns 格式化后的字符串
 */
function format(number) {
    // 将数字转为字符串，并按照小数点拆分
    const [int, fraction] = String(number).split('.')
    // 将整数部分拆分为数组
    const intArr = int.split('')
    let res = ''
    // 遍历整数部分的数组
    intArr.forEach((item, index) => {
        // 非第一位且是 3 的倍数，添加 ","
        if (index !== 0 && index % 3 === 0) {
            res = res + ',' + item
        } else {
            // 正常添加字符
            res = res + item
        }
    })
    // 整数和小数拼接
    return res + (!!fraction ? `.${fraction}` : '')
}

console.log(format(987654321.02)) // 输出 987,654,321.02
