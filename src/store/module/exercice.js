import types from '../mutationTypes'
import ExerciceService from '../../services/ExerciceService'

export default {
  state: {
    liste: [],
    currentExercice: {
      id: 0,
      sapeurs: [],
      data: {}
    }
  },
  mutations: {
    [types.UPDATE_EXERCICE_LIST](state, payload) {
      state.liste = payload
    },
    [types.ADD_EXERCICE](state, payload) {
      state.liste = [...state.liste, payload]
    },
    [types.SELECT_CURRENT_EXERCICE](state, payload) {
      state.currentExercice.id = payload
    },
    [types.UPDATE_CURRENT_EXERCICE_DATA](state, payload) {
      state.currentExercice.data = payload
    },
    [types.UPDATE_CURRENT_EXERCICE_SAPEURS](state, payload) {
      state.currentExercice.sapeurs = payload
    },
    [types.REMOVE_CURRENT_EXERCICE_SAPEURS](state, payload) {
      state.currentExercice.sapeurs = state.currentExercice.sapeurs.filter(
        p => !payload.includes(p.id)
      )
    }
  },
  getters: {
    listExercices: state => {
      return state.liste
        .slice(0)
        .sort((e1, e2) => new Date(e2.date) - new Date(e1.date))
    },
    activeExerciceId: state => {
      return state.currentExercice.id
    },
    activeExerciceSapeurs: state => {
      return state.currentExercice.sapeurs
    },
    activeExerciceData: state => {
      return state.currentExercice.data
    },
    getExercice: state => exercice_id => {
      return state.liste.filter(e => e.id === exercice_id)[0]
    }
  },
  actions: {
    fetchListExercice({ getters, commit }) {
      return ExerciceService.getExercices(
        getters.currentExerciceComptableId
      ).then(data => {
        return commit(types.UPDATE_EXERCICE_LIST, data)
      })
    },
    fetchExercice({ commit }, payload) {
      return ExerciceService.getExercice(payload).then(data => {
        return commit(types.UPDATE_CURRENT_EXERCICE_DATA, data)
      })
    },
    fetchExerciceSapeurs({ commit }, payload) {
      return ExerciceService.getSapeurs(payload).then(data => {
        return commit(types.UPDATE_CURRENT_EXERCICE_SAPEURS, data)
      })
    },
    selectExercice({ commit }, payload) {
      return commit(types.SELECT_CURRENT_EXERCICE, payload)
    },
    resetActiveExercice({ commit, getters }) {
      commit(types.SELECT_CURRENT_EXERCICE, null)
      return commit(types.UPDATE_CURRENT_EXERCICE_DATA, {
        id: null,
        localite_id: null,
        exercice_categorie_id: null,
        exercice_comptable_id: getters.currentExerciceComptableId,
        date: null,
        heure: null,
        lieu: '',
        communication: '',
        designation: '',
        duree: null,
        status: 0
      })
    },
    createExercice({ state, commit, getters }) {
      return ExerciceService.createExercice({
        ...state.currentExercice.data,
        exercice_comptable_id: getters.currentExerciceComptableId
      }).then(async data => {
        await commit(types.ADD_EXERCICE, data)
        await commit(types.SELECT_CURRENT_EXERCICE, data.id)
        await commit(types.UPDATE_CURRENT_EXERCICE_DATA, data)
        return data
      })
    },
    saveActiveExercice({ state, commit }) {
      return ExerciceService.saveExercice(
        state.currentExercice.id,
        ...state.currentExercice.data
      ).then(async data => {
        await commit(types.UPDATE_CURRENT_EXERCICE_DATA, data)
        return data
      })
    },

    addSapeurs({ state, commit }, payload) {
      return ExerciceService.addSapeurs(state.currentExercice.data.id, {
        sapeurs: payload
      }).then(async data => {
        await commit(types.UPDATE_CURRENT_EXERCICE_SAPEURS, data)
        return data
      })
    },
    editSapeurs({ state, commit }, payload) {
      return ExerciceService.editSapeurs(state.currentExercice.data.id, {
        sapeurs: payload
      }).then(async data => {
        await commit(types.UPDATE_CURRENT_EXERCICE_SAPEURS, data)
        return data
      })
    },
    removeSapeurs({ state, commit }, payload) {
      return ExerciceService.removeSapeurs(state.currentExercice.data.id, {
        sapeurs: payload
      }).then(async data => {
        await commit(types.REMOVE_CURRENT_EXERCICE_SAPEURS, payload)
        return data
      })
    }
  }
}
