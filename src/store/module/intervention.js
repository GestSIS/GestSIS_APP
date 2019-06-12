import types from '../mutationTypes'
import InterventionService from '../../services/InterventionService'

export default {
  state: {
    interventions: [],
    currentIntervention: {
      id: 0,
      sapeurs: [],
      data: {},
      missions: [],
      appels: {},
      quittances: [],
      vehicules: [],
      materiels: []
    }
  },
  mutations: {
    [types.UPDATE_INTERVENTION_LIST](state, payload) {
      state.interventions = payload
    },
    // [types.ADD_INTERVENTION](state, payload) {
    //   state.interventions = [...state.interventions, payload]
    // },
    [types.SELECT_CURRENT_INTERVENTION](state, payload) {
      state.currentIntervention.id = payload
    },
    [types.UPDATE_CURRENT_INTERVENTION_DATA](state, payload) {
      state.currentIntervention.data = payload
    },
    [types.UPDATE_CURRENT_INTERVENTION_SAPEURS](state, payload) {
      state.currentIntervention.sapeurs = payload
    }
    // [types.ADD_CURRENT_INTERVENTION_SAPEURS](state, payload) {
    //   state.currentIntervention.sapeurs = [
    //     ...state.currentIntervention.sapeurs,
    //     payload
    //   ]
    // },
    // [types.REMOVE_CURRENT_INTERVENTION_SAPEURS](state, payload) {
    //   state.currentIntervention.sapeurs = state.currentIntervention.sapeurs.filter(
    //     p => p.id !== payload
    //   )
    // },
    // [types.EDIT_CURRENT_INTERVENTION_SAPEURS](state, payload) {
    //   state.currentIntervention.sapeurs = [
    //     ...state.currentIntervention.sapeurs.filter(p => p.id !== payload.id),
    //     payload
    //   ]
    // }
  },
  getters: {
    listInterventions: state => {
      return state.interventions
    },
    activeInterventionId: state => {
      return state.currentIntervention.id
    },
    activeInterventionSapeurs: state => {
      return state.currentIntervention.sapeurs
    },
    activeInterventionData: state => {
      return state.currentIntervention.data
    },
    getIntervention: state => intervention_id => {
      return state.interventions.filter(e => e.id === intervention_id)[0]
    }
  },
  actions: {
    fetchListIntervention({ getters, commit }) {
      return InterventionService.getInterventions(
        getters.currentExerciceComptableId
      ).then(data => {
        return commit(types.UPDATE_INTERVENTION_LIST, data)
      })
    },
    fetchIntervention({ commit }, payload) {
      return InterventionService.getIntervention(payload).then(data => {
        return commit(types.UPDATE_CURRENT_INTERVENTION_DATA, data)
      })
    },
    fetchInterventionSapeurs({ commit }, payload) {
      return InterventionService.getSapeurs(payload).then(data => {
        return commit(types.UPDATE_CURRENT_INTERVENTION_SAPEURS, data)
      })
    },
    selectIntervention({ commit }, payload) {
      return commit(types.SELECT_CURRENT_INTERVENTION, payload)
    }
    // resetActiveIntervention({ commit }) {
    //   commit(types.SELECT_CURRENT_INTERVENTION, null)
    //   return commit(types.UPDATE_CURRENT_INTERVENTION_DATA, {
    //     id: null,
    //     localite_id: null,
    //     exercice_categorie_id: null,
    //     exercice_comptable_id: 1,
    //     date: null,
    //     heure: null,
    //     lieu: '',
    //     communication: '',
    //     designation: '',
    //     duree: null,
    //     status: 0
    //   })
    // },
    // createIntervention({ state, commit }) {
    //   return InterventionService.createIntervention(
    //     state.currentIntervention.data
    //   ).then(async data => {
    //     await commit(types.ADD_INTERVENTION, data)
    //     await commit(types.SELECT_CURRENT_INTERVENTION, data.id)
    //     await commit(types.UPDATE_CURRENT_INTERVENTION_DATA, data)
    //     return data
    //   })
    // },
    // saveActiveIntervention({ state, commit }) {
    //   return InterventionService.saveIntervention(
    //     state.currentIntervention.id,
    //     state.currentIntervention.data
    //   ).then(async data => {
    //     await commit(types.UPDATE_CURRENT_INTERVENTION_DATA, data)
    //     return data
    //   })
    // },
    //
    // addSapeurs({ state, commit }, payload) {
    //   return InterventionService.addSapeurs(state.currentIntervention.data.id, {
    //     sapeurs: payload
    //   }).then(async data => {
    //     await commit(types.ADD_CURRENT_INTERVENTION_SAPEURS, data)
    //     return data
    //   })
    // },
    // editSapeurs({ state, commit }, payload) {
    //   return InterventionService.editSapeurs(
    //     state.currentIntervention.data.id,
    //     {
    //       sapeurs: payload
    //     }
    //   ).then(async data => {
    //     await commit(types.EDIT_CURRENT_INTERVENTION_SAPEURS, data)
    //     return data
    //   })
    // },
    // removeSapeurs({ state, commit }, payload) {
    //   return InterventionService.removeSapeurs(
    //     state.currentIntervention.data.id,
    //     {
    //       sapeurs: payload
    //     }
    //   ).then(async data => {
    //     await commit(types.REMOVE_CURRENT_INTERVENTION_SAPEURS, payload)
    //     return data
    //   })
    // }
  }
}
