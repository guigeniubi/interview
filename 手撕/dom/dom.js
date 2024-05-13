const dom = {
  id: 1,
  children: [
    {
      id: 2,
      children: [{}],
    },
    {},
  ],
};
function traverseDOM(node) {
  // 处理当前节点
  console.log(node.id);

  // 遍历子节点
  if (node.children && node.children.length > 0) {
    for (const child of node.children) {
      traverseDOM(child);
    }
  }
}

// 调用遍历函数
traverseDOM(dom);
