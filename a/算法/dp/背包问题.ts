/**
 * 0-1背包问题
 * 给定n个物品，第i个物品的重量是w[i]，价值是v[i]
 * 给定一个容量为W的背包，求能装入背包的物品的最大价值
 */

// 基础版本 - 二维DP
function knapsack01Basic(
  weights: number[],
  values: number[],
  capacity: number
): number {
  const n = weights.length;
  // dp[i][w] 表示前i个物品，背包容量为w时的最大价值
  const dp: number[][] = Array(n + 1)
    .fill(null)
    .map(() => Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let w = 1; w <= capacity; w++) {
      // 不选第i个物品
      dp[i][w] = dp[i - 1][w];

      // 选第i个物品（如果能装下）
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          dp[i][w],
          dp[i - 1][w - weights[i - 1]] + values[i - 1]
        );
      }
    }
  }

  return dp[n][capacity];
}

// 空间优化版本 - 一维DP
function knapsack01Optimized(
  weights: number[],
  values: number[],
  capacity: number
): number {
  const dp: number[] = Array(capacity + 1).fill(0);

  for (let i = 0; i < weights.length; i++) {
    // 从后往前遍历，避免重复计算
    for (let w = capacity; w >= weights[i]; w--) {
      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);
    }
  }

  return dp[capacity];
}

// 测试用例
const weights = [2, 1, 3, 2];
const values = [12, 10, 20, 15];
const capacity = 5;

console.log("基础版本结果:", knapsack01Basic(weights, values, capacity)); // 37
console.log("优化版本结果:", knapsack01Optimized(weights, values, capacity)); // 37
