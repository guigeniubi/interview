/**
 * 计算数组的全排列（使用Heap's算法实现）
 * @param {Array} arr - 需要进行全排列的数组
 * @returns {Array} - 包含所有可能排列的二维数组
 */
function permute(arr) {
  let result = [];

  /**
   * 交换数组中两个元素的位置
   * @param {number} a - 第一个元素的索引
   * @param {number} b - 第二个元素的索引
   */
  function swap(a, b) {
    let temp = arr[a];
    arr[a] = arr[b];
    arr[b] = temp;
  }

  /**
   * 递归生成排列
   * 这是Heap's算法的核心实现
   * @param {number} n - 当前要处理的元素个数
   */
  function generate(n) {
    // 当只剩一个元素时，将当前排列加入结果数组
    if (n === 1) {
      result.push(arr.slice());
    } else {
      // 对于当前的n个元素，进行n次循环
      for (let i = 0; i < n; i++) {
        // 递归处理n-1个元素的排列
        generate(n - 1);

        // 根据n的奇偶性选择不同的交换方式
        // 这样可以确保生成所有可能的排列
        if (n % 2 === 0) {
          swap(i, n - 1);
        } else {
          swap(0, n - 1);
        }
      }
    }
  }

  // 开始生成全排列
  generate(arr.length);
  return result;
}

// 测试代码
let array = [1, 2, 3];
let permutations = permute(array);
console.log(permutations);
