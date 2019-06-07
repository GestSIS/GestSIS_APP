import types from '../mutationTypes'
import TypeInterventionService from '../../services/TypeInterventionService'

export default {
  state: {
    types: []
  },
  mutations: {
    [types.UPDATE_TYPE_INTERVENTION_LIST](state, payload) {
      state.types = payload
    }
  },
  getters: {
    listTypeIntervention: state => {
      return state.types
        .slice(0)
        .sort((t1, t2) => t1.designation > t2.designation)
    },
    getTypeIntervention: state => type_intervention_id => {
      return state.types.filter(t => t.id === type_intervention_id)[0]
    }
  },
  actions: {
    fetchTypeInterventions({ commit }) {
      return TypeInterventionService.getTypes().then(data => {
        return commit(types.UPDATE_TYPE_INTERVENTION_LIST, data)
      })
    }
  }
}
