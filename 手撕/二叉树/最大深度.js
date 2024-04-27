//先拿到左子树最深层，再拿到右子树最深层，取他们最大值就是树的深度。
var maxDepth = function(root) {
    if (!root) {
      return 0;
    }
    const leftDeep = maxDepth(root.left) + 1;
    const rightDeep = maxDepth(root.right) + 1;
    return Math.max(leftDeep, rightDeep);
  };
