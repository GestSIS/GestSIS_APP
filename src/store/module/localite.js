import types from '../mutationTypes'
import LocaliteService from '../../services/LocaliteService'

export default {
  state: {
    liste: []
  },
  mutations: {
    [types.UPDATE_LOCALITE_LIST](state, payload) {
      state.liste = payload
    }
  },
  getters: {
    listLocalites: state => {
      return state.liste
    },
    listLocalitesSis: state => {
      return state.liste
    },
    getLocalite: state => localite_id => {
      return state.liste.filter(l => l.id === localite_id)[0]
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
