async function fn(tasks, maxCount) {
    // write code here

    const results=[];
    const executingtask=[];

    for(task in tasks){
        const taskPromise=task();
        results.push(taskPromise);
        if(executingtask>maxCount){
            await Promise.race(executingtask);
        }
        executingtask.push(taskPromise);

        //删除完成了的正在进行的Promise
        await taskPromise.finally(()=>{
            const index =executingtask.indexOf(taskPromise);
            executingtask.splice(index,1)
        })
    }
  }
  
  // test:
  (async () => {
    const results = await fn([fetch1, fetch2, fetch3, fetch4], 2);
    console.log(results); // [1, 2, 3, 4]
  })();
  
