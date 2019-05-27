import types from '../mutationTypes'
import FonctionService from '../../services/FonctionService'

export default {
  state: {
    fonctions: []
  },
  mutations: {
    [types.UPDATE_FONCTION_LIST](state, payload) {
      state.fonctions = payload
    }
  },
  getters: {
    listFonctions: state => {
      return state.fonctions
    },
    getFonction: state => fonction_id => {
      return state.fonctions.filter(f => f.id === fonction_id)[0]
    }
  },
  actions: {
    fetchFonctions({ commit }) {
      return FonctionService.getFonctions().then(data => {
        return commit(types.UPDATE_FONCTION_LIST, data)
      })
    }
  }
}
