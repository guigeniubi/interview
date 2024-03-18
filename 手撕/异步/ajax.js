function ajax(url) {
    // 创建一个 XHR 对象
    return new Promise((resolve,reject) => {
        const xhr = new XMLHttpRequest()
        // 指定请求类型，请求URL，和是否异步
        xhr.open('GET', url, true)
        xhr.onreadystatechange = funtion() {
          // 表明数据已就绪
            if(xhr.readyState === 4) {
                if(xhr.status === 200){
                    // 回调
                    resolve(JSON.stringify(xhr.responseText))
                }
                else{
                    reject('error')
                }
            }
        }
        // 发送定义好的请求
        xhr.send(null)
    })
}
