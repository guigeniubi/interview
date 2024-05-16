class ListNode {
    constructor(val) {
      this.val = val;
      this.next = null;
    }
  }
  
  function hasCycle(head) {
    if (!head || !head.next) {
      return false; // 链表为空或只有一个节点，肯定没有环
    }
  
    let slow = head;
    let fast = head.next;
  
    while (slow !== fast) {
      if (!fast || !fast.next) {
        return false; // 如果快指针或者快指针的下一个节点为 null，说明没有环
      }
  
      slow = slow.next;
      fast = fast.next.next;
    }
  
    return true; // 当快慢指针相遇时，说明有环
  }
  
  // 示例用法
  const node1 = new ListNode(1);
  const node2 = new ListNode(2);
  const node3 = new ListNode(3);
  
  node1.next = node2;
  node2.next = node3;
  node3.next = node1; // 创建一个有环的链表
  
  console.log(hasCycle(node1)); // 输出 true，因为链表有环
  