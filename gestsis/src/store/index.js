import Vue from 'vue'
import Vuex from 'vuex'

import sapeurModule from './module/sapeur'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    sapeur: sapeurModule
  }
})
