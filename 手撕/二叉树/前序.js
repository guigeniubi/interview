function preOrder(treeNode) {
    if(treeNode) {
      console.log(treeNode.value); // 打印出来代表访问这个节点
      preOrder(treeNode.left);
      preOrder(treeNode.right);
    }
  }
  function preOrder(treeNode) {
    if(treeNode) {
      var stack = [treeNode]; //将二叉树压入栈
      while (stack.length !== 0) {
        treeNode = stack.pop(); // 取栈顶
        document.getElementById('text').appendChild(document.createTextNode(treeNode.value)); // 访问节点
        if(treeNode.right) stack.push(treeNode.right); // 把右子树入栈
        if(treeNode.left) stack.push(treeNode.left); // 把左子树入栈
      }
    }
  }
    