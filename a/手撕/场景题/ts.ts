function debounce<T extends (...args: any[]) => void>(fn: T, timeout: number): (...args: Parameters<T>) => void {
    let timer: any = null;

    return function (...args: Parameters<T>) {
        const immediate = !timer; // 判断是否是第一次调用

        if (timer) {
            clearTimeout(timer);
        }

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