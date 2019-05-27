import types from '../mutationTypes'
import LocaliteService from '../../services/LocaliteService'

export default {
  state: {
    localites: []
  },
  mutations: {
    [types.UPDATE_LOCALITE_LIST](state, payload) {
      state.localites = payload
    }
  },
  getters: {
    listLocalites: state => {
      return state.localites
    },
    listLocalitesSis: state => {
      return state.localites
    },
    getLocalite: state => localite_id => {
      return state.localites.filter(l => l.id === localite_id)[0]
    }
  },
  actions: {
    fetchLocalites({ commit }) {
      return LocaliteService.getLocalites().then(data => {
        return commit(types.UPDATE_LOCALITE_LIST, data)
      })
    }
  }
}
