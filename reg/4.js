let template=`我是{{name}}，我今年{{age}}岁，性别{{gender}},我来自{{city}}`
let person={
  name:'张三',
  age:18,
  gender:'男'
}
function render(template, person){
  const reg=/\{\{(\w+)\}\}/
  if(reg.test(template)){
    const name=reg.exec(template)[1]
    template=template.replace(reg, person[name] || '')
    return render(template, person)
  }
  return template
}
console.log(render(template, person))