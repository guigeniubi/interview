function getValue(obj, key) {
    const keys = key.split('.'); // 将键按照点号分割成数组
    let value = obj;
    for (const k of keys) {
        if (!value || typeof value !== 'object') {
            return undefined;
        }
        if (k.includes('[') && k.includes(']')) {
            // 如果键包含方括号，则解析数组索引
            const index = parseInt(k.slice(k.indexOf('[') + 1, k.indexOf(']')));
            const arrayKey = k.slice(0, k.indexOf('['));
            value = value[arrayKey][index];
        } else {
            value = value[k]; // 否则直接访问属性
        }
    }
    return value;
}

let obj = { a: [{ b: { c: 3 } }, 2] };
console.log(getValue(obj, 'a[1]')); // 输出：3
