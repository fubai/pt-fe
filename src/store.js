import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    admin: {},
    confirm: {}
  },
  mutations: {
    admin (state, v) {
      state.admin = v
    },
    confirm (state, v) {
      state.confirm = v
    }
  }
})