class ListNode {
  constructor(value) {
    this.val = value;
    this.next = null;
  }
}
function reverseList(head) {
  let prev = null; // 上一个节点初始化为 null
  let current = head; // 当前节点开始时是链表的头节点
  while (current !== null) {
    const next = current.next; // 保存下一个节点
    current.next = prev; // 反转当前节点的指针
    prev = current; // 移动 prev 和 current 指针
    current = next;
  }
  return prev; // 当循环结束时，prev 将是新的头节点
}

function reverseListd(head) {
  // 基本情况：如果链表为空或只有一个节点，直接返回该节点
  if (head == null || head.next == null) {
    return head;
  }
  // 递归反转头节点之后的部分
  const rest = reverseList(head.next);
  // 在返回过程中，将当前节点的下一个节点的 next 指针指向当前节点
  head.next.next = head;
  // 将当前节点的 next 指针设为 null，避免产生循环
  head.next = null;
  // 返回新的头节点
  return rest;
}
let list = new ListNode(1);
list.next = new ListNode(2);
list.next.next = new ListNode(3);
list.next.next.next = new ListNode(4);
list.next.next.next.next = new ListNode(5);

let reversedList = reverseListd(list);
console.log(reversedList);
