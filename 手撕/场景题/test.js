function debounce(fn, timeout) {
    let timer = null; 
    return function () {
        let args = arguments;
        const immediate = !timer; // 判断是否是第一次调用
        clearTimeout(timer);
        timer = setTimeout(() => {
            timer = null;
            if (!immediate) {
                fn.apply(this, args);
            }
        }, timeout);
        if (immediate) {
            fn.apply(this, args);
        }
    };
}
async function run() {
    const a1 = debounce(console.log, 50);

    a1(1, 2);
    await sleep(10);
    a1(2, 3);
    await sleep(20);
    a1(3, 4);
    await sleep(30);
    a1(4, 5);
    await sleep(40);
    a1(5, 6);
    await sleep(51);
    // 经过 150(10 + 20 + 30 + 40 + 50) 毫秒（近似）打印出 5 6

    a1(6, 7);
    await sleep(10);
    a1(7, 8);
    // 经过 60(10 + 50) 毫秒（近似）打印出 7 8
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

run();

