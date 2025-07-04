function limitQueue(urls, limit) {
  // 执行一个任务
  function run() {
    // 构造待执行任务 当该任务完成后 如果还有待完成的任务 继续执行任务
    new Promise((resolve, reject) => {
      const url = urls[i];
      i++;
      resolve(fn(url));
    }).then(() => {
      if (i < urls.length) run();
    });
  }
  // 完成任务数
  let i = 0;
  // 填充满执行队列
  for (let excuteCount = 0; excuteCount < limit; excuteCount++) {
    run();
  }
}
const fn = (url) => {
  // 实际场景这里用axios等请求库 发请求即可 也不用设置延时
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("完成一个任务", url, new Date());
      resolve({ url, date: new Date() });
    }, 1000);
  });
};
const urls = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

(async (_) => {
  await limitQueue(urls, 4);
})();
//这样没严格控制任务的执行顺序
// function limitQueue(urls, limit) {
//   let i = 0; // 完成任务数
//   const results = new Array(urls.length); // 用来保存任务结果

//   return new Promise((resolve) => {
//     // 填充满执行队列
//     for (let executeCount = 0; executeCount < limit; executeCount++) {
//       run();
//     }

//     // 执行一个任务
//     function run() {
//       if (i >= urls.length) return; // 如果所有任务都已完成，直接返回

//       const currentIndex = i;
//       const url = urls[i];
//       i++;

//       // 构造待执行任务 当该任务完成后 如果还有待完成的任务 继续执行任务
//       new Promise((resolve, reject) => {
//         resolve(fn(url));
//       }).then((result) => {
//         results[currentIndex] = result; // 保存任务结果
//         if (i < urls.length) {
//           run(); // 继续执行下一个任务
//         } else if (results.filter(Boolean).length === urls.length) {
//           resolve(results); // 所有任务完成后返回结果
//         }
//       });
//     }
//   });
// }

// const fn = (url) => {
//   // 实际场景这里用axios等请求库 发请求即可 也不用设置延时
//   return new Promise((resolve) => {
//     setTimeout(() => {
//       console.log("完成一个任务", url, new Date());
//       resolve({ url, date: new Date() });
//     }, 1000);
//   });
// };

// const urls = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

// (async (_) => {
//   const results = await limitQueue(urls, 4);
//   console.log("所有任务完成，结果如下：", results);
// })();
