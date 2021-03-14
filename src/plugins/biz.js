export default {
  install (Vue) {
    Vue.biz = {

      loadDictionary: (dictionaryId, success) => {
        if (!dictionaryId) {
          return
        }

        Vue.http.request({
          method: 'get',
          url: `/app/api/dictionaries/${dictionaryId}`
        }).then((res) => {
          success((res.data.data || {}).items || [])
        })
      },

      calcAge (birthday) {
        const now = new Date()
        let y = now.getFullYear() - birthday.getFullYear()
        let m = now.getMonth() - birthday.getMonth() 
        let d = now.getDate() - birthday.getDate()
        if (d < 0) {
          m--
        }
        if (m < 0) { // 借一年 12个月
          y--
        }
        return y
      }

    }
  }
}
