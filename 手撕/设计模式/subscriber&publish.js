class Event {
    constructor() {
        this.eventEmitter = {};
    }

    // 订阅
    on(type, fn) {
        if (!this.eventEmitter[type]) {
            this.eventEmitter[type] = [];
        }
        this.eventEmitter[type].push(fn);
    }

    // 取消订阅
    off(type, fn) {
        if (!this.eventEmitter[type]) {
            return;
        }
        this.eventEmitter[type] = this.eventEmitter[type].filter((event) => {
            return event !== fn;
        });
    }

    // 发布
    emit(type) {
        if (!this.eventEmitter[type]) {
            return;
        }
        this.eventEmitter[type].forEach((event) => {
            event();
        });
    }
}
