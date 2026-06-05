function varTest() {
  var a = 1;
  if (true) {
    var a = 2;
    console.log(a);
  }
  console.log(a);
}