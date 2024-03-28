function myQuerySelector(selector, context = document) {
    const stack = [context]; // 使用栈来进行深度优先搜索
  
    while (stack.length > 0) {
      const element = stack.pop();
  
      if (element.matches(selector)) {
        return element;
      }
  
      const children = element.children;
      for (let i = children.length - 1; i >= 0; i--) {
        stack.push(children[i]);
      }
    }
  
    return null;
  }