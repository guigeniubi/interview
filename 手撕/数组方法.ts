// Array.prototype.concat()
declare interface Array<T> {

//遍历  callback第三个参数可以返回原数组,thisArg改变this指向
    map<U>(callback:(value:T,index:number,array:T[])=> U,thisArg?:any):U[],

    filter(callback:(value:T ,index:number, array:T[])=> unknown,thisArg?:any):T[];

    forEach(callback:(value:T,index:number,array:T[])=>void,thisArg?:any):void,

    reduce(callback:(pre:T,current:T,currentIndex:number,array:T[])=>T ,initialize ?: T):T;

    some(callback:(value:T,index:number,array:T[])=>unknown , thisArg?:any):boolean;

    every(callback: (value: T, index: number, array: T[]) => unknown, thisArg?:any): boolean;
// 增删改查
    push(item:T):number

    unshift(item:T):number;

    pop():T|undefined;

    shift():T|undefined;

    splice(startIndex: number, deleteCount?: number, ...incertItems: T[]): T[]

    slice(startIndex?: number, endIndex?: number): T[]

    concat<U extends T[]>(...concatItems: U[]): T[];
    

    find<S extends T>(predicate: (value: T, index: number, array: T[]) => value is S): S | undefined;

    find(predicate: (value: T, index: number, array: T[]) => unknown): T | undefined;
  
    findIndex(predicate: (value: T, index: number, array: T[]) => unknown): number;

  //字符串转换join是将数组中所有元素转换为一个字符串，分隔符可以用于连接数组元素，不改变原数组
    join(Separator ?:string):string;

    toString():string

    //判断
    isArray(arg:any): arg is any[];

    includes(searchElement:T):boolean;

  //其他
    reverse():T[]
    
    sort(compare?:(a:T,b:T)=>number):this;
  }
 
  
  
