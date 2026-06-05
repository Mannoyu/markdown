show()
console.log(myname);
var myname = '张三'
function show() {
  console.log(myname);
}
// 在编译器眼里
//声明提升
var myname = undefined; //变量提升
show = function () {
  console.log(myname);
}
