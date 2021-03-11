import axios from 'axios'
import { api } from '../config'

export default {
  install (Vue) {
    axios.defaults.baseURL = api
    axios.defaults.headers.post['Content-Type'] = 'application/json'
    axios.defaults.headers.post['Accept'] = 'application/json; charset=utf-8, text/plain, */*'
    axios.defaults.headers.put['Content-Type'] = 'application/json'
    axios.defaults.headers.put['Accept'] = 'application/json; charset=utf-8, text/plain, */*'
    axios.defaults.withCredentials = true

    axios.interceptors.request.use(function (request) {
      let url = request.url
      if (url.indexOf('?') === -1) {
        url = url + '?_t=' + parseInt(new Date().getTime() / 1000, 10)
      } else {
        url = url + '&_t=' + parseInt(new Date().getTime() / 1000, 10)
      }
      request.url = url

      return request
    }, error => Promise.reject(error))

    let last401Time = 0
    axios.interceptors.response.use(response => response, error => {
      let data = error.response.data || {}
      if (data.code === 401) {
        let currentDateTime = new Date().getTime()
        if (last401Time + 500 < currentDateTime) {
          last401Time = currentDateTime

          sessionStorage.removeItem('admin')
          Vue.prototype.$message.error('登录过期，请重新登录')

          setTimeout(function () {
            location.reload()
          }, 2000)
        } else {
          last401Time = currentDateTime
        }
      } else {
        if (data.message) {
          Vue.prototype.$message.error(data.message)
        } else {
          Vue.prototype.$message.error('网络请求失败:' + data.code)
        }
      }
      return Promise.reject(error)
    })

    Vue.prototype.$http = axios
    Vue.http = axios
  },
  $http: axios
}

export const $http = axios
