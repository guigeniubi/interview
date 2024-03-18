//  迭代版
function search(nums, target) {
    // write code here
      if(nums.length === 0)    return -1
      let left = 0,right = nums.length - 1
          // 注意这里的边界，有等号
      while(left <= right){
          let mid = Math.floor((left + right) / 2)
          if(nums[mid] < target)    left = mid + 1
          else if(nums[mid] > target)    right = mid - 1
          else    return mid
      }
      return -1
  }
  // 递归版
  function binary_search(arr, low, high, key) {
      if (low > high) {
          return -1;
      }
      var mid = parseInt((high + low) / 2);
      if (arr[mid] == key) {
          return mid;
      } else if (arr[mid] > key) {
          high = mid - 1;
          return binary_search(arr, low, high, key);
      } else if (arr[mid] < key) {
          low = mid + 1;
          return binary_search(arr, low, high, key);
      }
  };
