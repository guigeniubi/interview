function mergeSort(arr) {
  // 如果数组长度小于等于1，则不需要排序，直接返回
  if (arr.length <= 1) {
    return arr;
  }

  // 找到数组的中间位置
  const mid = Math.floor(arr.length / 2);

  // 分割数组为左右两个子数组
  const left = arr.slice(0, mid);
  const right = arr.slice(mid);

  // 递归地对左右两个子数组进行排序
  const sortedLeft = mergeSort(left);
  const sortedRight = mergeSort(right);
  // 合并左右两个已排序的子数组
  return merge(sortedLeft, sortedRight);
}

// 合并两个已排序的数组
function merge(left, right) {
  let result = [];
  let leftIndex = 0;
  let rightIndex = 0;

  // 比较两个数组的元素，依次放入结果数组中
  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] < right[rightIndex]) {
      result.push(left[leftIndex]);
      leftIndex++;
    } else {
      result.push(right[rightIndex]);
      rightIndex++;
    }
  }

  // 将剩余的元素放入结果数组中
  return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
}

// 示例用法
const arr = [38, 27, 43, 3, 9, 82, 10];
console.log(mergeSort(arr)); // 输出 [3, 9, 10, 27, 38, 43, 82]
