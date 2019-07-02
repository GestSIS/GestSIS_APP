import types from '../mutationTypes'
import ComptabiliteService from '../../services/ComptabiliteService'

export default {
  state: {
    indemnites: {
      exercices: [],
      interventions: [],
      annuels: []
    },
    frais: {},
    ecritures: []
  },
  mutations: {
    [types.UPDATE_INDEMNITES_TYPES](state, payload) {
      state.indemnites = {
        ...state.indemnites,
        ...payload
      }
    },
    [types.UPDATE_FRAIS_TYPES](state, payload) {
      state.frais = {
        ...state.frais,
        ...payload
      }
    }
  },
  getters: {
    //TODO
  },
  actions: {
    fetchIndemnitesTypes({ commit }) {
      return ComptabiliteService.getIndemniteTypes().then(data => {
        return commit(types.UPDATE_INDEMNITES_TYPES, data)
      })
    },
    fetchFraisTypes({ commit }) {
      return ComptabiliteService.getFraisTypes().then(data => {
        return commit(types.UPDATE_FRAIS_TYPES, data)
      })
    },
    imputerExercice({ commit }, payload) {
      console.log(payload)
      return ComptabiliteService.imputerExercice(payload.exercice_id, payload)
    }
  }
}
