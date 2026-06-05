var a = 1;
function show(a) {
  var a = 2;
  function a() { }
  var b = a
  console.log(a);
}
show(a)
