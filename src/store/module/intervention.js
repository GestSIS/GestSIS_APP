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
        .slice(0)
        .sort((i1, i2) => new Date(i1.date_debut) - new Date(i2.date_debut))
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
    },
    resetActiveIntervention({ commit, getters }) {
      commit(types.SELECT_CURRENT_INTERVENTION, null)
      return commit(types.UPDATE_CURRENT_INTERVENTION_DATA, {
        id: null,
        date_debut: null,
        heure_debut: null,
        lieu: '',
        objet: '',
        date_fin: null,
        heure_fin: null,
        rapport_police: 0,
        degre: null,
        sauve_personne: 0,
        sauve_animaux: 0,
        description: '',
        proprietaire: '',
        responsable: '',
        stat_nb: 0,
        imputer: 0,
        exercice_comptable_id: getters.currentExerciceComptableId,
        localite_id: null,
        type_intervention_id: null,
        sapeur_id: null,
        stat_federal_id: null,
        intervention_traitement_id: null
      })
    },
    createIntervention({ state, commit, getters }) {
      return InterventionService.createIntervention({
        ...state.currentIntervention.data,
        exercice_comptable_id: getters.currentExerciceComptableId
      }).then(async data => {
        await commit(types.ADD_INTERVENTION, data)
        await commit(types.SELECT_CURRENT_INTERVENTION, data.id)
        await commit(types.UPDATE_CURRENT_INTERVENTION_DATA, data)
        return data
      })
    },
    saveActiveIntervention({ state, commit }) {
      return InterventionService.saveIntervention(
        state.currentIntervention.id,
        state.currentIntervention.data
      ).then(async data => {
        await commit(types.UPDATE_CURRENT_INTERVENTION_DATA, data)
        return data
      })
    }

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
