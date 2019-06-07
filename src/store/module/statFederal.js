import stats from '../mutationTypes'
import StatFederalService from '../../services/StatFederalService'

export default {
  state: {
    stats: []
  },
  mutations: {
    [stats.UPDATE_STAT_FEDERAL_LIST](state, payload) {
      state.stats = payload
    }
  },
  getters: {
    listStatFederal: state => {
      return state.stats
        .slice(0)
        .sort((t1, t2) => t1.designation > t2.designation)
    },
    getStatFederal: state => type_intervention_id => {
      return state.stats.filter(t => t.id === type_intervention_id)[0]
    }
  },
  actions: {
    fetchStatFederals({ commit }) {
      return StatFederalService.getStats().then(data => {
        return commit(stats.UPDATE_STAT_FEDERAL_LIST, data)
      })
    }
  }
}
