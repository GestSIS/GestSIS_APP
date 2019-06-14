import types from '../mutationTypes'
import VehiculeService from '../../services/VehiculeService'

export default {
  state: {
    liste: []
  },
  mutations: {
    [types.UPDATE_VEHICULE_LIST](state, payload) {
      state.liste = payload
    }
  },
  getters: {
    getVehicule: state => vehicule_id => {
      return state.liste.filter(m => m.id === vehicule_id)[0]
    }
  },
  actions: {
    fetchVehicules({ commit }) {
      return VehiculeService.getVehicules().then(data => {
        return commit(types.UPDATE_VEHICULE_LIST, data)
      })
    }
  }
}
