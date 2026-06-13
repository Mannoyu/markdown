let str = '13888888888'

// 一个字符一个字符的匹配
// [] 表示匹配的字符范围
let reg = /^1[3-9]\d{9}$/

//表示类型
console.log(reg.constructor)
console.log(
  Object.prototype.toString.call(reg)
)

console.log(reg.test(str))
