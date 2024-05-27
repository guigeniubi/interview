function findChar(str) {
  let arr = str.split("")
  arr = arr.sort()
  var n = 1
  var arr1 = []
  var maxchar = ""
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] === arr[i + 1]) {
      maxchar = arr[i]
      n++
    } else {
      arr1[n] = maxchar
      n=1
    }
  }
  return maxchar
}
console.log(findChar("asdaasssb"));