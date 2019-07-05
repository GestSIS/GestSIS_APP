import types from '../mutationTypes'
import ComptabiliteService from '../../services/ComptabiliteService'

export default {
  state: {
    indemnites: {
      exercices: [],
      interventions: [],
      annuels: []
    },
    listeFraisAnnuels: [],
    listeIndemnitesAnnuels: [],
    frais: {},
    ecritures: {
      annuels: []
    }
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
    },
    [types.UPDATE_ECRITURES_ANNUELS_LISTE](state, payload) {
      state.ecritures.annuels = [...payload]
    }
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
    fetchEcrituresAnnuels({ commit, getters }) {
      return ComptabiliteService.getEcrituresAnnuelsForExerciceComptable(
        getters.currentExerciceComptableId
      ).then(data => {
        return commit(types.UPDATE_ECRITURES_ANNUELS_LISTE, data)
      })
    },
    imputerExercice(context, payload) {
      return ComptabiliteService.imputerExercice(payload.exercice_id, payload)
    },
    imputerIntervention(context, payload) {
      return ComptabiliteService.imputerIntervention(
        payload.intervention_id,
        payload
      )
    }
  }
}
