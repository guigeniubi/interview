function reverseObject(obj) {
    // 创建一个新的空对象，用于存储反转后的键值对
    const reversedObj = {};
    // 遍历原始对象的键值对
    for (const key in obj) {
        if (Object.hasOwnProperty.call(obj, key)) {
            const value = obj[key];
            // 将原始对象的值作为新对象的键，原始对象的键作为新对象的值
            reversedObj[value] = key;
        }
    }
    return reversedObj; // 返回反转后的对象
}


function reverseObject(obj) {
    // 使用 Object.entries 方法将对象转换为键值对数组，并使用 reduce 方法进行反转
    return Object.entries(obj).reduce((reversed, [key, value]) => {
        // 将原始对象的值作为新对象的键，原始对象的键作为新对象的值
        reversed[value] = key;
        return reversed;
    }, {}); // 初始值是一个空对象
}

const originalObj = { a: 1, b: 2, c: 3 };
const reversedObj = reverseObject(originalObj);
console.log(reversedObj);
