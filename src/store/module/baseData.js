import types from '../mutationTypes'
import BaseDataService from '../../services/BaseDataService'

export default {
  state: {
    permisTypes: [],
    civilites: []
  },
  mutations: {
    [types.UPDATE_PERMIS_LIST](state, payload) {
      state.permisTypes = payload
    },
    [types.UPDATE_CIVILITE_LIST](state, payload) {
      state.civilites = payload
    }
  },
  getters: {
    listPermisType: state => {
      return state.permisTypes
    },
    listCivilites: state => {
      return state.civilites
    }
  },
  actions: {
    fetchPermisType({ commit }) {
      return BaseDataService.getPermisType().then(data => {
        return commit(types.UPDATE_PERMIS_LIST, data)
      })
    },
    fetchCivilites({ commit }) {
      return BaseDataService.getCivilites().then(data => {
        return commit(types.UPDATE_CIVILITE_LIST, data)
      })
    }
  }
}
