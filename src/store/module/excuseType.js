import types from '../mutationTypes'
import GroupeService from '../../services/GroupeService'
import ExcuseTypeService from "../../services/ExcuseTypeService";

export default {
  state: {
    excuses: []
  },
  mutations: {
    [types.UPDATE_EXERCICE_LIST](state, payload) {
      state.excuses = payload
    }
  },
  getters: {
    listExcuseTypes: state => {
      return state.excuses
    },
    getExcuseType: state => exercice_id => {
      return state.excuses.filter(e => e.id === exercice_id)[0]
    }
  },
  actions: {
    fetchGroupes({ commit }) {
      return ExcuseTypeService.getExcuses().then(data => {
        return commit(types.UPDATE_EXCUSE_TYPE_LIST, data)
      })
    }
  }
}
