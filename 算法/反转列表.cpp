

struct ListNode
{
    int val;
    ListNode *next;
    ListNode() : val(0), next(nullptr) {}
    ListNode(int x) : val(x), next(nullptr) {}
    ListNode(int x, ListNode *next) : val(x), next(next) {}
};

class Solution
{
public:
    // 迭代
    ListNode *reverse(ListNode *head)
    {
        ListNode *cur = head;
        ListNode *pre = nullptr;
        while (cur != nullptr)
        {
            ListNode *temp = cur->next;
            cur->next = pre;
            pre = cur;
            cur = temp;
        }
        return pre;
    }

    //  递归
    ListNode *reverse(ListNode *head)
    {
        if (head == nullptr || head->next == nullptr)
        {
            return head; // 递归终止条件：链表为空或只有一个节点
        }

        ListNode *newHead = reverse(head->next); // 递归反转剩余部分

        head->next->next = head; // 将当前节点的下一个节点指向当前节点，实现反转
        head->next = nullptr;    // 将当前节点的next指针置空

        return newHead; // 返回新的头节点
    }
};
