import Vue from 'vue'
import Vuex from 'vuex'

import sapeurModule from './module/sapeur'
import baseDataModule from './module/baseData'
import localiteModule from './module/localite'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    sapeur: sapeurModule,
    baseData: baseDataModule,
    localites: localiteModule
  }
})
