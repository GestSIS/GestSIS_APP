import traitements from '../mutationTypes'
import InterventionTraitementService from '../../services/InterventionTraitementService'

export default {
  state: {
    traitements: []
  },
  mutations: {
    [traitements.UPDATE_INTERVENTION_TRAITEMENT_LIST](state, payload) {
      state.traitements = payload
    }
  },
  getters: {
    listInterventionTraitement: state => {
      return state.traitements
        .slice(0)
        .sort((t1, t2) => t1.designation > t2.designation)
    },
    getInterventionTraitement: state => intervention_traitement_id => {
      return state.traitements.filter(
        t => t.id === intervention_traitement_id
      )[0]
    }
  },
  actions: {
    fetchInterventionTraitements({ commit }) {
      return InterventionTraitementService.getStats().then(data => {
        return commit(traitements.UPDATE_INTERVENTION_TRAITEMENT_LIST, data)
      })
    }
  }
}
