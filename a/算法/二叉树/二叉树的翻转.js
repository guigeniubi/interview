var invertTree = function (root) {
    if (root === null) {
        return null
    }
    else {
        var temp = invertTree(root.left);
        root.left = invertTree(root.right);
        root.right = temp;
    }
    return root
}

//迭代
var invertTree = function (root) {

    let stack = [root];
    let current = null;
    let temp = null;
    while (current = stack.pop()) {
        temp = current.right;
        current.right = current.left;
        current.left = temp;
        if (current.right) {
            stack.push(current.right);
        }
        if (current.left) {
            stack.push(current.left);
        }

    }
    return root
};