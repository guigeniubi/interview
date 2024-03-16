//迭代


 struct ListNode {
     int val;
      ListNode *next;
      ListNode() : val(0), next(nullptr) {}
     ListNode(int x) : val(x), next(nullptr) {}
      ListNode(int x, ListNode *next) : val(x), next(next) {}
  };

  
 class Solution {
public:
//迭代
    ListNode* reverse(ListNode* head) {
        ListNode * cur = head;
        ListNode * pre = nullptr;
        while(cur!=nullptr){
            ListNode * temp = cur->next;
            cur->next = pre;
            pre =cur;
            cur =temp;
        }
        return pre;
    }

  //  递归

  
};

