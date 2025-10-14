// 观察者模式 被观察者Subject 观察者Observer Subject变化 notify观察者
let observerIds = 0;

// 被观察者Subject
class Subject {
  constructor() {
    this.observers = [];
  }

  // 添加观察者
  addObserver(observer) {
    this.observers.push(observer);
  }

  // 移除观察者
  removeObserver(observer) {
    this.observers = this.observers.filter((obs) => {
      return obs.id !== observer.id;
    });
  }

  // 通知notify观察者
  notify() {
    this.observers.forEach((observer) => observer.update(this));
  }
}

// 观察者Observer
class Observer {
  constructor() {
    this.id = observerIds++;
  }

  update(subject) {
    // 更新
  }
}
