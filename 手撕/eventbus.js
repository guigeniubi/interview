<script>
  class EventBus {
    // 定义所有事件列表,格式如下：
    // {
    //   key: Array,
    //   key: Array,
    // } 
    // Array存储的是注册的回调函数
    constructor() {
        this.eventObj = {}; // 用于存储所有订阅事件
      }
      // 订阅事件,类似监听事件$on('key',()=>{})
      $on(name, callbcak) {
        // 判断是否存储过
        if (!this.eventObj[name]) {
          this.eventObj[name] = [];
        }
        this.eventObj[name].push(callbcak); // 往事件数组里面push
      }
      // 发布事件,类似于触发事件$emit('key')
      $emit(name, ...args) {
        // 获取存储的事件回调函数数组
        const eventList = this.eventObj[name];
        // 执行所有回调函数且传入参数
        for (const callbcak of eventList) {
          callback(...args);
        }
      }
  }
    
  
  // 初始化EventBus
  let EB = new EventBus();


  // 订阅事件
  EB.$on('key1', (name, age) => {
    console.info("我是订阅事件A:", name, age);
  })
  EB.$on("key1", (name, age) => {
    console.info("我是订阅事件B:", name, age);
  })
  EB.$on("key2", (name) => {
    console.info("我是订阅事件C:", name);
  })


  // 发布事件
  EB.$emit('key1', "小猪课堂", 26);
  EB.$emit('key2', "小猪课堂");
</script>
