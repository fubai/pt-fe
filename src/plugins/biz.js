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
          let dictionary = res.data.data || {}
          let items = dictionary.items || []
          if (dictionary.keyType === 'INTEGER') {
            for (let i = items.length - 1; i >= 0; i--) {
              items[i].key = parseInt(items[i].key, 10)
            }
          }
          success(items)
        })
      }

    }
  }
}
