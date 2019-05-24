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
    }
  },
  actions: {
    fetchLocalites({ commit }) {
      return LocaliteService.getLocalites()
        .then(res => {
          if (res.data.error !== undefined) {
            throw new Error(res.data.error)
          }
          return res.data.data
        })
        .then(data => {
          return commit(types.UPDATE_LOCALITE_LIST, data)
        })
    }
  }
}
