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
      return state.currentSapeur.data
    },
    activeSapeurPermis: state => {
      return state.currentSapeur.permis
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
    },
    [types.UPDATE_CURRENT_SAPEUR_PERMIS](state, payload) {
      state.currentSapeur.permis = payload
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
      SapeurService.getData(payload)
        .then(res => {
          if (res.data.error !== undefined) {
            throw new Error(res.data.error)
          }
          return res.data.data
        })
        .then(data => {
          return commit(types.UPDATE_CURRENT_SAPEUR, data)
        })
    },
    fetchSapeurPermis({ commit }, payload) {
      SapeurService.getPermis(payload)
        .then(res => {
          if (res.data.error !== undefined) {
            throw new Error(res.data.error)
          }
          return res.data.data
        })
        .then(data => {
          return commit(types.UPDATE_CURRENT_SAPEUR_PERMIS, data)
        })
    },
    fetchSapeurTelephone({ commit }, payload) {
      SapeurService.getPermis(payload)
        .then(res => {
          if (res.data.error !== undefined) {
            throw new Error(res.data.error)
          }
          return res.data.data
        })
        .then(data => {
          return commit(types.UPDATE_CURRENT_SAPEUR_PERMIS, data)
        })
    },
    fetchSapeurGroupe({ commit }, payload) {
      SapeurService.getPermis(payload)
        .then(res => {
          if (res.data.error !== undefined) {
            throw new Error(res.data.error)
          }
          return res.data.data
        })
        .then(data => {
          return commit(types.UPDATE_CURRENT_SAPEUR_PERMIS, data)
        })
    },
    saveActiveSapeur({ state }) {
      return SapeurService.saveSapeur(state.currentSapeur.data.id, state.currentSapeur.data).then(res => {
        if (res.data.error !== undefined) {
          throw new Error(res.data.error)
        }
        return res.data.data
      })
    }
  }
}
