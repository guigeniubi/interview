// 递归
var array = [1, [2, [3, [4, 5]]]];
function flatDeep(arr, deepLen) {
  if (deepLen === 0) return arr;
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      result = result.concat(flatDeep(arr[i], deepLen - 1));
    } else {
      result.push(arr[i]);
    }
  }
  return result;
}
console.log(flatDeep(array));
//深搜flat
var array = [1, [2, [3, [4, 5]]]];
function flatDeep(arr) {
	return arr.flat(Infinity)/*层数
}
console.log(flatDeep(array)); // [ 1, 2, 3, 4, 5 ]

// toString 和spilt和map
var array = [1, [2, [3, [4, 5]]]];
function flatDeep(arr){
	let result = [];
	return result = arr.toString().split(',').map(Number)
}
console.log(flatDeep(array));
