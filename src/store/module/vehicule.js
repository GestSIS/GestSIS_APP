import types from '../mutationTypes'
import VehiculeService from '../../services/VehiculeService'

export default {
  state: {
    vehicules: []
  },
  mutations: {
    [types.UPDATE_VEHICULE_LIST](state, payload) {
      state.vehicules = payload
    }
  },
  getters: {
    listVehicules: state => {
      return state.vehicules
    },
    getVehicule: state => vehicule_id => {
      return state.vehicules.filter(m => m.id === vehicule_id)[0]
    }
  },
  actions: {
    fetchVehicule({ commit }) {
      return VehiculeService.getVehicules().then(data => {
        return commit(types.UPDATE_VEHICULE_LIST, data)
      })
    }
  }
}
