import Vue from 'vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import AjaxPlugin from './plugins/ajax'
import BizPlugin from './plugins/biz'
import App from './page/App'
import Login from './page/Login'
import StudentTrainDrawer from './page/train/StudentTrainDrawer'
import './scss/element-variables.scss'

require('es6-promise').polyfill()

Vue.use(ElementUI)
Vue.use(AjaxPlugin)
Vue.use(BizPlugin)
Vue.component('student-train-drawer', StudentTrainDrawer)
Vue.config.productionTip = false


let adminJSON = sessionStorage.getItem('admin')
if (adminJSON) {
  store.commit('admin', JSON.parse(adminJSON))
  enterApp()
} else {
  enterLogin()
}

function enterApp () {
  new Vue({
    store,
    router,
    render: h => h(App)
  }).$mount('#app')
}

function enterLogin () {
  new Vue({
    store,
    router,
    render: h => h(Login)
  }).$mount('#app')
}
