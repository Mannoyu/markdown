const str = 'hello-world'
// 替换字符串
//分组 不匹配(),但是可以提取 ,\w 表示匹配字母数字下划线
// $1 表示提取的第一的分组
const reg = /-(\w)/g
console.log(str.match(reg))
// const result = str.replace(reg, '#')
// console.log(result)

// _ 表示匹配的字符串 c 表示提取的第一的分组
const res=str.replace(reg, (_,c) =>{
  console.log(_,c,"/////")
  return c.toUpperCase()
})
console.log(res)
