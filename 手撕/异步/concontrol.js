class RequestQueue {
    constructor(maxConcurrent) {
        this.queue = [];
        this.activeRequests = [];
        this.maxConcurrent = maxConcurrent;
    }
    add(request) {
        return new Promise((resolve, reject) => {
            this.queue.push(() => request().then(resolve, reject));
            this.runNext();
        });
    }
    async runNext() {
        if (this.queue.length === 0 || this.activeRequests.length >= this.maxConcurrent) {
            return;
        }
        const nextRequest = this.queue.shift();
        if (nextRequest) {
            const requestPromise = nextRequest().finally(() => {
                this.activeRequests = this.activeRequests.filter(p => p !== requestPromise);
                this.runNext();
            });
            this.activeRequests.push(requestPromise);
            if (this.activeRequests.length >= this.maxConcurrent) {
                await Promise.race(this.activeRequests);
            }
            this.runNext();
        }
    }
}
// 使用示例
const requestQueue = new RequestQueue(5);
function createRequest(id) {
    return () =>
        new Promise((resolve) => {
            console.log(`Starting request ${id}`);
            setTimeout(() => {
                console.log(`Finished request ${id}`);
                resolve(id);
            }, 1000); // 模拟1秒的请求时间
        });
}
async function runRequests() {
    const requests = [];
    for (let i = 0; i < 20; i++) {
        requests.push(requestQueue.add(createRequest(i)));
    }
    const results = await Promise.all(requests);
    console.log('All requests finished:', results);
}
runRequests();
