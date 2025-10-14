var merge = function (nums1, m, nums2, n) {
  let i = m - 1
  let j = n - 1
  // 设置这个数组的指针
  let cur = m + n - 1

  while (i >= 0 || j >= 0) {
    //  说明nums1元素已经插入完了
    if (i < 0) {
      nums1[cur--] = nums2[j--]
      //  说明nums2元素已经插入完了
    } else if (j < 0) {
      nums1[cur--] = nums1[i--]
    } else {
      // 比较大小，大的先放
      if (nums1[i] >= nums2[j]) {
        nums1[cur--] = nums1[i--]
      } else {
        nums1[cur--] = nums2[j--]
      }
    }
  }
}
