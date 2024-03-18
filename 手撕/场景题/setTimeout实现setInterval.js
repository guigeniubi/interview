function setInterval(fn, time){
    var interval = function(){
    // time时间过去，这个异步被执行，而内部执行的函数正是interval，就相当于进了一个循环
        setTimeout(interval, time);
    // 同步代码
        fn();
    }
    //interval被延迟time时间执行
    setTimeout(interval,time); 
}

