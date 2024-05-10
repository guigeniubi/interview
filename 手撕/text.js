function foo() {
  this.print = () => {
    console.log(1);
  };
}

foo.prototype.print = () => {
  console.log(2);
};

function foo2() {
  this.print = () => {
    console.log(3);
  };
}
foo2.prototype = Object.create(foo.prototype);
var b = new foo2();
b.print();
