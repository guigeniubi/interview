/**
 * 最长公共子串（连续）
 * 找到两个字符串中最长的连续公共子串
 * 动态规划思路:
 * dp[i][j] 表示以 str1[i-1] 和 str2[j-1] 结尾的最长公共子串长度
 * 状态转移方程:
 *   当 str1[i-1] === str2[j-1] 时:
 *     dp[i][j] = dp[i-1][j-1] + 1
 *   当 str1[i-1] !== str2[j-1] 时:
 *     dp[i][j] = 0
 * 最终答案为 dp 数组中的最大值对应的子串
 */

// 动态规划解法
function longestCommonSubstring(str1: string, str2: string): string {
  const m = str1.length;
  const n = str2.length;
  // dp[i][j] 表示以str1[i-1]和str2[j-1]结尾的公共子串长度
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  let maxLength = 0;
  let endIndex = 0; // 记录最长子串在str1中的结束位置

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;

        if (dp[i][j] > maxLength) {
          maxLength = dp[i][j];
          endIndex = i;
        }
      }
      // 不相等时dp[i][j] = 0（已初始化）
    }
  }

  return str1.substring(endIndex - maxLength, endIndex);
}

// 空间优化版本 - 只用一维数组
function longestCommonSubstringOptimized(str1: string, str2: string): string {
  const m = str1.length;
  const n = str2.length;

  let dp: number[] = Array(n + 1).fill(0);
  let maxLength = 0;
  let endIndex = 0;

  for (let i = 1; i <= m; i++) {
    const newDp: number[] = Array(n + 1).fill(0);

    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        newDp[j] = dp[j - 1] + 1;

        if (newDp[j] > maxLength) {
          maxLength = newDp[j];
          endIndex = i;
        }
      }
    }

    dp = newDp;
  }

  return str1.substring(endIndex - maxLength, endIndex);
}

// 滑动窗口解法
function longestCommonSubstringSlidingWindow(
  str1: string,
  str2: string
): string {
  let maxLength = 0;
  let result = "";

  // 以str1为基准，枚举所有可能的起始位置
  for (let i = 0; i < str1.length; i++) {
    for (let j = 0; j < str2.length; j++) {
      let length = 0;

      // 从当前位置开始匹配
      while (
        i + length < str1.length &&
        j + length < str2.length &&
        str1[i + length] === str2[j + length]
      ) {
        length++;
      }

      if (length > maxLength) {
        maxLength = length;
        result = str1.substring(i, i + length);
      }
    }
  }

  return result;
}

// 测试用例
const test1 = "abcdxyz";
const test2 = "xyzabcd";

console.log("DP解法:", longestCommonSubstring(test1, test2)); // "abcd"
console.log("空间优化:", longestCommonSubstringOptimized(test1, test2)); // "abcd"
console.log("滑动窗口:", longestCommonSubstringSlidingWindow(test1, test2)); // "abcd"

const test3 = "GeeksforGeeks";
const test4 = "GeeksQuiz";
console.log("测试2:", longestCommonSubstring(test3, test4)); // "Geeks"
