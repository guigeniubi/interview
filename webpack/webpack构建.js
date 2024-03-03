((modules)=>{
    //实现require函数
    function require(modulesId){
        let fn = modules[modulesId];
        let modules={
            export:{}
        };
        fn(modules,modules.exports,require);

        return modules.exports;
    }
    require("./src/index.js");
})({
    "./src/a.js":function(modules,exports,require){
        console.log("module a");
        modules.exports="a";
    },
    "./src/index.js":function(module,exports,require){
        console.log("index");
        var a =require("./src/a.js");
        console.log("aaa",a);
    }
})