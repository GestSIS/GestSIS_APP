import Vue from 'vue'
import Vuex from 'vuex'

import sapeurModule from './module/sapeur'
import baseDataModule from './module/baseData'
import localiteModule from './module/localite'
import gradeModule from './module/grade'
import fonctionModule from './module/fonction'
import coursModule from './module/cours'
import groupeModule from './module/groupe'
import modalModule from './module/modal'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {},
  mutations: {},
  actions: {},
  modules: {
    sapeur: sapeurModule,
    baseData: baseDataModule,
    localites: localiteModule,
    grade: gradeModule,
    fonction: fonctionModule,
    cours: coursModule,
    modal: modalModule,
    groupe: groupeModule
  }
})
