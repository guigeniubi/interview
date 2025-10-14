function permuteArrays(...arrays) {
    let result = [];

    function generate(index, current) {
        if (index === arrays.length) {
            result.push(current.slice());
        } else {
            for (let i = 0; i < arrays[index].length; i++) {
                current.push(arrays[index][i]);
                generate(index + 1, current);
                current.pop();
            }
        }
    }

    generate(0, []);
    return result;
}

let arr1 = [1, 2];
let arr2 = ['a', 'b', 'c'];
let arr3 = ['X', 'Y'];

let permutations = permuteArrays(arr1, arr2, arr3);
console.log(permutations);
