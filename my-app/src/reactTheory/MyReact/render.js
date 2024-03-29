let nextUnitOfWork = null; //有下个任务单元
// deadline.timeRemaining(); //得到浏览器当前帧剩余的时间(空余时间)  scheduler调度

function perforUnitOfWork(fiber) {
  //reactElement 转换为一个真实的DOM
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  if (fiber.parent) {
    fiber.parent.dom.appendChild(fiber.dom);
  }
  //为当前的Filer创建他子节点的fiber
  const elements = fiber?.props?.children;
  let prevSibling = null;
  elements.forEach((childrenElement, index) => {
    const newFiber = {
      parent: fiber,
      props: childrenElement.props,
      type: childrenElement.type,
      dom: null,
    };
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
  });
  //return 出下一个任务单元
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}
function workLoop(deadline) {
  let shouldYield = true; //浏览器是否有空余时间
  while (nextUnitOfWork && shouldYield) {
    nextUnitOfWork = perforUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() > 1; //得到浏览器当前帧剩余的时间
  }

  requestIdleCallback(workLoop); //在浏览器空闲时执行回调
}
function createDom(element) {
  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(element.type);

  const isProperty = (key) => key !== "children";
  Object.keys(element?.props)
    .filter(isProperty)
    .forEach((name) => (dom[name] = element.props[name]));

  return dom;
}
function render(element, container) {
  nextUnitOfWork = {
    dom: container, //根节点
    props: {
      children: [element],
    },
  };
}
//递归遍历生成DOM，递归开始执行就不会停止执行，如果DOM层级深渲染速度就慢，
