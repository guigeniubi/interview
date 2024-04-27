function breadthTraversal(node) {
    var result = [];  // 创建一个空数组用来保存遍历的结果
    if (node) {                             // 判断二叉树是否为空
        var que = [node];                   // 将二叉树放入队列
        while (que.length !== 0) {          // 判断队列是否为空
            node = que.shift();             // 从队列中取出一个结点
            result.push(node.value);        // 将取出结点的值添加到结果数组
            if (node.left) que.push(node.left);   // 如果存在左子树，将左子树放入队列
            if (node.right) que.push(node.right); // 如果存在右子树，将右子树放入队列
        }
    }
    return result;  // 返回结果数组
}


function breadthTraversalByLevels(node) {
    var result = [];   // 创建一个空数组用来保存每一层的节点值的数组
    if (node) {        // 判断二叉树是否为空
        var que = [node];  // 将二叉树的根节点放入队列
        while (que.length !== 0) {  // 判断队列是否为空
            var levelSize = que.length;  // 当前层的节点数量
            var currentLevel = [];  // 创建一个空数组用来保存当前层的节点值
            
            for (let i = 0; i < levelSize; i++) {  // 遍历当前层的所有节点
                node = que.shift();  // 从队列中取出一个结点
                currentLevel.push(node.value);  // 将取出结点的值添加到当前层的数组
                if (node.left) que.push(node.left);  // 如果存在左子树，将左子树放入队列
                if (node.right) que.push(node.right); // 如果存在右子树，将右子树放入队列
            }
            result.push(currentLevel);  // 将当前层的数组添加到结果数组
        }
    }
    return result;  // 返回包含每一层节点值的数组的结果数组
}
