import types from '../mutationTypes'
import SapeurService from '../../services/SapeurService'

export default {
  state: {
    sapeurs: [],
    currentSapeur: {
      permis: [],
      data: {},
      telephones: []
    }
  },
  getters: {
    listSapeur: state => {
      return state.sapeurs
    },
    activeSapeur: state => {
      return state.currentSapeur.data || {}
    },
    activeSapeurId: state => {
      return state.currentSapeur.data.id || 0
    }
  },
  mutations: {
    [types.UPDATE_SAPEURS_LIST](state, payload) {
      state.sapeurs = payload
    },
    [types.UPDATE_CURRENT_SAPEUR](state, payload) {
      state.currentSapeur.data = payload
    }
  },
  actions: {
    fetchListSapeur({ commit }) {
      return SapeurService.getSapeurs()
        .then(res => {
          if (res.data.error !== undefined) {
            throw new Error(res.data.error)
          }
          return res.data.data
        })
        .then(data => {
          return commit(types.UPDATE_SAPEURS_LIST, data)
        })
    },
    fetchSapeur({ commit }, payload) {
      console.log(payload)
      SapeurService.getSapeur(payload)
        .then(res => {
          if (res.data.error !== undefined) {
            throw new Error(res.data.error)
          }
          console.log(res)
          return res.data.data
        })
        .then(data => {
          console.log(data)
          return commit(types.UPDATE_CURRENT_SAPEUR, data)
        })
    }
  }
}
