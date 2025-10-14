
/**
 * 求解最长递增子序列（LIS）的长度
 * 动态规划思路：
 * dp[i] 表示以 arr[i] 结尾的最长递增子序列长度
 * 状态转移方程：
 *   dp[i] = max(dp[i], dp[j] + 1) 其中 0 <= j < i 且 arr[j] < arr[i]
 * 最终答案为 dp 数组中的最大值
 * 时间复杂度：O(n^2)
 */
function longestIncreasingSubsequence(arr) {
    const dp: number[] = [];
    for (let i = 0; i < arr.length; i++) {
      dp[i] = 1;
      for (let j = 0; j < i; j++) {
        if (arr[j] < arr[i]) {
          dp[i] = Math.max(dp[i], dp[j] + 1);
        }
      }
    }
    return Math.max(...dp);
  }

  /**
 * 优化版：O(n log n) 解法
 * tails[k] 表示长度为 k+1 的递增子序列的最小结尾元素
 * 对每个 arr[i]，用二分查找 tails，替换或扩展
 */
function longestIncreasingSubsequence2(arr: number[]): number {
    if (arr.length === 0) return 0;
    const tails: number[] = [];
    for (let num of arr) {
      let left = 0, right = tails.length;
      while (left < right) {
        const mid = (left + right) >> 1;
        if (tails[mid] < num) {
          left = mid + 1;
        } else {
          right = mid;
        }
      }
      tails[left] = num;
    }
    return tails.length;
  }