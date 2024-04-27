function postOrder(node) {
    if (node) { //判断二叉树是否为空
        postOrder(node.left); //递归遍历左子树
        postOrder(node.right); //递归遍历右子树
        document.getElementById('text').appendChild(document.createTextNode(node.value));
    }
}
function postOrder(node) {
    if (node) { //判断二叉树是否为空
        var stack = [node]; //将二叉树压入栈
        var tmp = null; //定义缓存变量
        while (stack.length !== 0) { //如果栈不为空，则循环遍历
            tmp = stack[stack.length - 1]; //将栈顶的值保存在tmp中
            if (tmp.left && node !== tmp.left && node !== tmp.right) { //如果存在左子树,node !== tmp.left && node !== tmp.righ 是为了避免重复将左右子树入栈
                stack.push(tmp.left);   //将左子树结点压入栈
            } else if (tmp.right && node !== tmp.right) { //如果结点存在右子树
                stack.push(tmp.right);  //将右子树压入栈中
            } else {
                document.getElementById('text').appendChild(document.createTextNode(stack.pop().value));
                node = tmp;
            }
        }
    }
}
