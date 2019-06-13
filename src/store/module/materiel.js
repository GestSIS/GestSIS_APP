import types from '../mutationTypes'
import MaterielService from '../../services/MaterielService'

export default {
  state: {
    materiels: [],
    currentMateriel: {
      id: 0,
      materiel_id: null,
      quantite: 0
    }
  },
  mutations: {
    [types.UPDATE_MATERIEL_LIST](state, payload) {
      state.materiels = payload
    },
    [types.UPDATE_CURRENT_MATERIEL](state, payload) {
      state.currentMateriel = payload
    }
  },
  getters: {
    listMateriels: state => {
      return state.materiels
    },
    getMateriel: state => materiel_id => {
      return state.materiels.filter(m => m.id === materiel_id)[0]
    },
    activeMateriel: state => {
      return state.currentMateriel
    }
  },
  actions: {
    fetchMateriels({ commit }) {
      return MaterielService.getMateriels().then(data => {
        return commit(types.UPDATE_MATERIEL_LIST, data)
      })
    },
    updateActiveMateriel({ commit }, payload) {
      return commit(types.UPDATE_CURRENT_MATERIEL, payload)
    },
    resetActiveMateriel({ commit }) {
      return commit(types.UPDATE_CURRENT_MATERIEL, {
        id: 0,
        materiel_id: null,
        quantite: 0
      })
    }
  }
}
