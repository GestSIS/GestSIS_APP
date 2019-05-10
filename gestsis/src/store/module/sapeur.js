import types from '../mutationTypes'
import SapeurService from '../../services/SapeurService'

export default {
  state: {
    sapeurs: []
  },
  getters: {
    listSapeur: state => {
      return state.sapeurs
    }
  },
  mutations: {
    [types.UPDATE_SAPEURS_LIST](state, payload) {
      state.sapeurs = payload
    }
  },
  actions: {
    loadListSapeur({ commit }, payload) {
      SapeurService.getSapeurs()
        .then(data => {
          console.log(data)
        })
        .catch(() => {
          console.log('error')
        })
      commit(types.UPDATE_SAPEURS_LIST, payload)
    }
  }
}
