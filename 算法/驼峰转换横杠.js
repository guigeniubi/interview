var str = 'border-top-color';
console.log(str); // border-top-color
function toHumpName(str) {
  var arr = str.split('-'); // spilt切割,border,top,color
  console.log(arr); // [border,top,color]
  for (var i = 1; i < arr.length; i++) {
    // 循环遍历数组
    arr[i] = arr[i].charAt(0).toUpperCase() + arr[i].substring(1);
    console.log(arr[i]); // [border,Top,Color]
  }
  return arr.join(''); // 字符串给加起来
}
console.log(toHumpName(str)); // borderTopColor