export default {
  install (Vue) {
    Vue.biz = {
      /**
       * 表单元素值的验证器，支持验证函数或正则表达式
       * 如果设置了验证函数，则正则表达式失效。
       * 验证函数如果返回true，表示验证通过，false表示验证失败
       *
       * 示例如下：
       *   validators: {
       *     idCard: { fn: Function, msg: '请输入正确的身份证号码' },
       *     number: { reg: /^\d+$/, msg: '请输入正确的数字' }
       *   }
       */
      validators: {}
    }
  }
}
