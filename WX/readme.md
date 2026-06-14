# btn 页面

## 先写结果
- 优秀的套路

## 再写样式


## BEM 国际命名规范
- .page 页面
  开启一个区块block，用于包裹页面的所有元素
- 分上下两部分？
  .page_hd 页面头部
  .page_bd 页面主体
  hd,bd 是block下的元素element
  block和element之间用_分隔
- Modifier 修饰符
  不同的状态
- .weui-btn weui 这个css框架中按钮组件
  weui 项目的标志  
  - 主要的，禁用的，默认的

## BEM 优势
- 国际规范，大家都遵循
- 结构清晰，方便维护
    - 有一个区块要表达block
    - 有几个元素要表达element
- 简单易读
- 解决了写页面命名难的问题
    最简单的英文单词，结构相关
    .page
      .page_hd
      .page_bd
    没有BEM规范，要写三个单词

## css 规则
- css reset重置样式
 有些元素默认样式不同，需要重置
 把页面编程一张干净的白纸

 ## AI prompt
 - 语义化标签
 - BEM 命名规范
 - cssreset 重置样式
  normalize.css
    * 不用的，列出要匹配的所有元素

## 微信界面细节
- ui 设计师设计出来
  标注大小
  font-size 17px
  button 高度 24px
  line-height 24/17=取八位小数1.41176471
