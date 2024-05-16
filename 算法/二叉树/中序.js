function InOrder(treeNode) {
    if(treeNode) {
        InOrder(treeNode.left);
        document.getElementById('text').appendChild(document.createTextNode(treeNode.value));
        InOrder(treeNode.right);
    }
}
function InOrder(node) {
    if(node) {
      var stack = [];             // 建空栈
      //如果栈不为空或结点不为空，则循环遍历
      while (stack.length !== 0 || node) { 
        if (node) {               //如果结点不为空
            stack.push(node);     //将结点压入栈
            node = node.left;     //将左子树作为当前结点
        } else {                  //左子树为空，即没有左子树的情况
            node = stack.pop();   //将结点取出来
            document.getElementById('text').appendChild(document.createTextNode(node.value));
            node = node.right;    //将右结点作为当前结点
        }
      }
    }
  }
  