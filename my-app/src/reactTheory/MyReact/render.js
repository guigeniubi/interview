let nextUnitOfWork = null; //有下个任务单元

let wipRoot = null;

let currentRoot = null; //上次提交的fiber树
let deletions = [];

let wipFiber = [];

let hooksIndex = 0;
// deadline.timeRemaining(); //得到浏览器当前帧剩余的时间(空余时间)  scheduler调度

{
  /* <div>
  <h1>
    <p></p>
    <a></a>
  </h1>
  <h2></h2>
</div> */
}

function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let prevSibling = null;

  let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
  while (index < elements.length || !!oldFiber) {
    const childrenElement = elements[index];
    let newFiber = null;
    const sameType =
      oldFiber && childrenElement && childrenElement.type === oldFiber.type;
    if (sameType) {
      newFiber = {
        type: oldFiber.type,
        props: childrenElement.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: "UPDATE",
      };
    }
    if (!sameType && childrenElement) {
      newFiber = {
        type: childrenElement.type,
        props: childrenElement.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: "PLACTMENT",
      };
    }
    if (!sameType && oldFiber) {
      oldFiber.effectTag = "DELETE";
      deletions.push(oldFiber);
    }
    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }
    prevSibling = newFiber;
    index++;
  }
}

export function useState(initial) {
  const oldHook = wipFiber?.alternate?.hooks?.[hooksIndex];

  const hook = {
    state: oldHook ? oldHook.state : initial,
    queue: [],
  };
  const actions = oldHook ? oldHook.queue : [];
  actions.forEach((actions) => {
    hook.action = action;
  });
  const setState = (action) => {
    hook.queue.push(hook);
    wipRoot = {
      dom: currentRoot.dom, //根节点
      props: currentRoot.dom,
      alternate: currentRoot,
    };
    nextUnitOfWork = wipRoot;
    deletions = [];
  };
  wipFiber.hooks.push(hook);
  hooksIndex++;
  return [hook.state, setState];
}
function updateFunctionComponent(fiber) {
  wipFiber = fiber;
  wipFiber.hooks = [];
  hooksIndex = 0;
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}
function updateHostComponent(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }
  //为当前的Filer创建他子节点的fiber
  const elements = fiber?.props?.children;
  reconcileChildren(fiber, elements); //对比新旧Fiber
}
function performUnitOfWork(fiber) {
  //reactElement 转换为一个真实的DOM
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
  } else {
    updateHostComponent(fiber);
  }
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
//筛选出事件
const isEvent = (key) => key.startsWith("on");
//筛选出Children属性
const isProperty = (key) => key !== "children" && !isEvent;
//筛选出要移除的属性
const isGone = (prev, next) => (key) => key in next;
//移除新的属性
const isNew = (prev, next) => (key) => prev[key] !== next[key];

function updateDom(dom, prevProps, nextProps) {
  //移除旧的监听事件
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(
      (key) =>
        isGone(prevProps, nextProps)(key) || isNew(prevProps, nextProps)(key)
    )
    .forEach((name) => {
      const eventType = name.toLocaleLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });
  //移除不存在新props里的属性
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone)
    .forEach((name) => (dom[name] = ""));
  //新增
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => (dom[name] = nextProps[name]));
  //新增事件
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach((name) => {
      const eventType = name.toLocaleLowerCase().substring(2);
      dom.addEventListener(eventType, prevProps[name]);
    });
}
function commitDeletion(fiber, domParent) {
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber, child, domParent);
  }
}
function commitWork(fiber) {
  if (!fiber) return;
  // const domParent = fiber.parent.dom;
  let domParentFiber = fiber.parent;
  while (!domParentFiber.dom) {
    domParentFiber= domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;

  switch (fiber.effectTag) {
    case "PLACEMENT": //新增
      !!fiber.dom && domParent.appendChild(fiber.dom);
      break;

    case "UPDATE": //更新
      !!fiber.dom && updateDom(fiber.dom, fiber.alternate, fiber.props);
      break;
    case "DELETE": //新增
      // !!fiber.dom && domParent.appendChild(fiber.dom);
      commitDeletion(fiber, domParent);
      break;
    default:
      break;
  }
  commitWork(fiber.child);
  commitWork(fiber.sibling);
}
function commitRoot() {
  //渲染真实DOM的操作
  commitWork(fiber);
  deletions.forEach(commitRoot);
  currentRoot = wipRoot;
  wipRoot = null;
}
function workLoop(deadline) {
  let shouldYield = true; //浏览器是否有空余时间
  while (nextUnitOfWork && shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() > 1; //得到浏览器当前帧剩余的时间
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop); //在浏览器空闲时执行回调
}
requestIdleCallback(workLoop);
function createDom(fiber) {
  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode("")
      : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);
  return dom;
}
function render(element, container) {
  wipRoot = {
    dom: container, //根节点
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  nextUnitOfWork = wipRoot;
  deletions = [];
}
//递归遍历生成DOM，递归开始执行就不会停止执行，如果DOM层级深渲染速度就慢，
