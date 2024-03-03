function partition(arr, startIndex, endIndex) {
    let pivot = arr[startIndex] // 选择第一个元素为基准元素
    let left = startIndex
    let right = endIndex
    let index = startIndex
  
    while(right > left) {
      // right指针从右向左进行比较
      while(right > left) {
        // 在右边一直找，直到找到小于pivot，才退出
        if (arr[right] < pivot) {
          arr[left] = arr[right]
          index = right
          left++
          break
        }
        right--
      }
  
      // left指针从右向左进行比较
      while(right > left) {
        if (arr[left] > pivot) {
          arr[right] = arr[left]
          index = left
          right--
        }
        left++
      }
    }
    arr[index] = pivot
    return index
  }
  
  function quickSort(arr, startIndex, endIndex) {
    if (startIndex >= endIndex) {
      return
    }
    let pivotIndex = partition(arr, startIndex, endIndex)
    // 向左递归
    quickSort(arr, startIndex, pivotIndex - 1)
    // 向右递归
    quickSort(arr, pivotIndex + 1, endIndex)
  }
  
  