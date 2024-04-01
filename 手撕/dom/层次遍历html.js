traverse(document.querySelector('#root'))
// 结果用console.log()进行输出
// 上述表达式的输出结果为
// ['DIV']
// ['P', 'SPAN', 'P', 'SPAN']
// ['SPAN', 'SPAN']
function traverse(elRoot) {
    // 补充实现
}

function traverse(elRoot) {
    const result = []; // 用于存储遍历结果的数组
    const queue = []; // 用于辅助遍历的队列

    if (elRoot) {
        queue.push(elRoot); // 将根节点加入队列

        while (queue.length > 0) {
            const levelSize = queue.length; // 当前层的节点数量
            const currentLevel = []; // 存储当前层的节点值

            for (let i = 0; i < levelSize; i++) {
                const node = queue.shift(); // 出队一个节点

                currentLevel.push(node.tagName); // 将节点的标签名存入当前层的数组

                // 将节点的子节点加入队列，以便后续遍历
                const children = node.children;
                for (let j = 0; j < children.length; j++) {
                    queue.push(children[j]);
                }
            }

            result.push(currentLevel); // 将当前层的节点值数组存入结果数组
        }
    }

    // 输出结果
    for (let i = 0; i < result.length; i++) {
        console.log(result[i]);
    }
}