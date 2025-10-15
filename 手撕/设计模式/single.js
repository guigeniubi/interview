// 1
class Singleton {    
    // let _instance = null;   
    constructor(){
        
    } 
	static getInstance() {
    if (!Singleton._instance) {
        Singleton.instance = new Singleton()
    }
    // 如果这个唯一的实例已经存在，则直接返回        
    return Singleton._instance
} 
	}
const s1 = Singleton.getInstance()
const s2 = Singleton.getInstance()
console.log(s1 === s2)  // true
// 2
let cache;
class A {
    constructor(name) {
        this.name = name
    }
    say() {
        console.log('hello')
    }
}
function getInstance(className) {
    if (cache) return cache;
    return cache = new className();
}
const x = getInstance(A);
const y = getInstance(A);