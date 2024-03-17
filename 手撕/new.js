function _new(obj,...args){
    const newObj=Object.create(obj.prototype);
    const res=obj.apply(newObj,args);
    return res;
}