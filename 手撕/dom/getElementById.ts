// 一个用数组存储的树, 查找树中的元素并输出查找路径
type TreeNode = { id: number; children?: TreeNode[] };
// 测试用例
const tree: TreeNode[] = [
  {
    id: 1,
    children: [{ id: 2 }, { id: 3 }],
  },
  {
    id: 5,
    children: [{ id: 6 }, { id: 7, children: [{ id: 10 }] }],
  },
];
// 大致思路: 用一个栈记录遍历路径
// 开始遍历一棵树时将树根 id 计入栈中
// 如果该子树整体无 target 节点, 则将该树根 id 出栈
const stack: number[] = [];
/**
 * 查找一个树中是否有 target 节点的方法
 * 开始查找时, 先将树根入栈, 经过查找后, 若能查到 target, 则返回 true
 * 若没有查到, 则将栈顶元素出栈(栈顶元素定为树根), 并返回 false
 */
function findItem(tree: TreeNode[] | undefined, target: number): boolean {
  if (tree) {
    const index = tree.findIndex(({ id }) => id === target);
    if (index >= 0) {
      stack.push(tree[index].id);
      return true;
    } else {
      for (let i = 0; i < tree.length; i++) {
        stack.push(tree[i].id);
        if (findItem(tree[i]?.children, target)) {
          return true;
        } else {
          stack.pop();
        }
      }
      return false;
    }
  } else {
    return false;
  }
}
(function () {
  findItem(tree, 10);
  console.log(stack); // -> [5, 7, 10]
})();
