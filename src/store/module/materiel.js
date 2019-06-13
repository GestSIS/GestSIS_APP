import types from '../mutationTypes'
import MaterielService from '../../services/MaterielService'

export default {
  state: {
    materiels: []
  },
  mutations: {
    [types.UPDATE_MATERIEL_LIST](state, payload) {
      state.materiels = payload
    }
  },
  getters: {
    listMateriels: state => {
      return state.materiels
    },
    getMateriel: state => materiel_id => {
      return state.materiels.filter(m => m.id === materiel_id)[0]
    }
  },
  actions: {
    fetchMateriels({ commit }) {
      return MaterielService.getMateriels().then(data => {
        return commit(types.UPDATE_MATERIEL_LIST, data)
      })
    }
  }
}
