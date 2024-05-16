function permute(arr) {
    let result = [];
    function swap(a, b) {
        let temp = arr[a];
        arr[a] = arr[b];
        arr[b] = temp;
    }
    function generate(n) {
        if (n === 1) {
            result.push(arr.slice());
        } else {
            for (let i = 0; i < n; i++) {
                generate(n - 1);
                if (n % 2 === 0) {
                    swap(i, n - 1);
                } else {
                    swap(0, n - 1);
                }
            }
        }
    }
    generate(arr.length);
    return result;
}
let array = [1, 2, 3];
let permutations = permute(array);
console.log(permutations);
