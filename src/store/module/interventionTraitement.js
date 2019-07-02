import types from '../mutationTypes'
import InterventionTraitementService from '../../services/InterventionTraitementService'

export default {
  state: {
    liste: []
  },
  mutations: {
    [types.UPDATE_INTERVENTION_TRAITEMENT_LIST](state, payload) {
      state.liste = payload
    }
  },
  getters: {
    listInterventionTraitement: state => {
      return state.liste
        .slice(0)
        .sort((t1, t2) => t1.designation > t2.designation)
    },
    getInterventionTraitement: state => intervention_traitement_id => {
      return state.liste.filter(
        t => t.id === intervention_traitement_id
      )[0]
    }
  },
  actions: {
    fetchInterventionTraitements({ commit }) {
      return InterventionTraitementService.getStats().then(data => {
        return commit(types.UPDATE_INTERVENTION_TRAITEMENT_LIST, data)
      })
    }
  }
}
