class EventBus {
  constructor() {
    this.eventObj = {};
  }

  $on(name, callback) {
    if (!this.eventObj[name]) {
      this.eventObj[name] = [];
    }
    this.eventObj[name].push(callback);
  }

  $emit(name, ...args) {
    const eventList = this.eventObj[name];
    if (eventList) {
      for (const callback of eventList) {
        callback(...args);
      }
    }
  }

  $once(name, callback) {
    const onceCallback = (...args) => {
      this.$off(name, onceCallback);
      callback(...args);
    };
    this.$on(name, onceCallback);
  }

  $off(name, callback) {
    const eventList = this.eventObj[name];
    if (eventList) {
      if (callback) {
        const index = eventList.indexOf(callback);
        if (index !== -1) {
          eventList.splice(index, 1);
        }
      } else {
        // 没有传入回调函数，则移除该事件的所有回调函数
        delete this.eventObj[name];
      }
    }
  }
}

// 初始化EventBus
let EB = new EventBus();

// 订阅事件
EB.$on("key1", (name, age) => {
  console.info("我是订阅事件A:", name, age);
});
EB.$on("key1", (name, age) => {
  console.info("我是订阅事件B:", name, age);
});
EB.$on("key2", (name) => {
  console.info("我是订阅事件C:", name);
});

// 一次性订阅事件
EB.$once("key1", (name, age) => {
  console.info("我是一次性订阅事件:", name, age);
});

// 发布事件
EB.$emit("key1", "小猪课堂", 26);
EB.$emit("key2", "小猪课堂");

// 取消订阅事件
EB.$off("key1"); // 取消所有key1的订阅
EB.$emit("key1", "取消订阅后不会执行"); // 取消后不会再执行回调
