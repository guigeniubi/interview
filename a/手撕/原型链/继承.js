
//寄生组合继承
function Parent(name) {
    this.name = name;
    this.say = () => {
      console.log(111);
    };
  }
  Parent.prototype.play = () => {
    console.log(222);
  };
  function Children(name,age) {
    Parent.call(this,name);
    this.age = age
  }
  Children.prototype = Object.create(Parent.prototype);
  Children.prototype.constructor = Children;
  