import types from '../mutationTypes'
import BaseDataService from '../../services/BaseDataService'

export default {
  state: {
    permisTypes: [],
    civilites: [],
    telephoneTypes: []
  },
  mutations: {
    [types.UPDATE_PERMIS_LIST](state, payload) {
      state.permisTypes = payload
    },
    [types.UPDATE_CIVILITE_LIST](state, payload) {
      state.civilites = payload
    },
    [types.UPDATE_TELEPHONE_TYPE_LIST](state, payload) {
      state.telephoneTypes = payload
    }
  },
  getters: {
    listPermisType: state => {
      return state.permisTypes
    },
    listCivilites: state => {
      return state.civilites
    },
    listTelephoneTypes: state => {
      return state.telephoneTypes
    },
    getTelephone: state => id => {
      return state.telephoneTypes.filter(t => t.id === id)[0]
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
    },
    fetchTelephoneTypes({ commit }) {
      return BaseDataService.getTelephones().then(data => {
        return commit(types.UPDATE_TELEPHONE_TYPE_LIST, data)
      })
    }
  }
}
