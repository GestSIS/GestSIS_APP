import types from '../mutationTypes'
import PhaseTypeService from '../../services/PhaseTypeService'

export default {
  state: {
    liste: []
  },
  mutations: {
    [types.UPDATE_PHASE_TYPE_LIST](state, payload) {
      state.liste = payload
    }
  },
  getters: {
    getPhaseType: state => phase_type_id => {
      return state.liste.filter(t => t.id === phase_type_id)[0]
    }
  },
  actions: {
    fetchPhaseTypes({ commit }) {
      return PhaseTypeService.getPhases().then(data => {
        return commit(types.UPDATE_PHASE_TYPE_LIST, data)
      })
    }
  }
}
