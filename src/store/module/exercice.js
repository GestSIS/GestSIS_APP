import types from '../mutationTypes'
import ExerciceService from '../../services/ExerciceService'

export default {
  state: {
    exercices: [],
    currentExercice: {
      id: 0,
      sapeurs: [],
      data: {}
    }
  },
  mutations: {
    [types.UPDATE_EXERCICE_LIST](state, payload) {
      state.exercices = payload
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
    [types.ADD_CURRENT_EXERCICE_SAPEURS](state, payload) {
      state.currentExercice.sapeurs = [
        ...state.currentExercice.sapeurs,
        payload
      ]
    },
    [types.REMOVE_CURRENT_EXERCICE_SAPEURS](state, payload) {
      state.currentExercice.sapeurs = state.currentExercice.sapeurs.filter(
        p => p.id !== payload
      )
    },
    [types.EDIT_CURRENT_EXERCICE_SAPEURS](state, payload) {
      state.currentExercice.sapeurs = [
        ...state.currentExercice.sapeurs.filter(p => p.id !== payload.id),
        payload
      ]
    }
  },
  getters: {
    listExercices: state => {
      return state.exercices
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
      return state.exercices.filter(e => e.id === exercice_id)[0]
    }
  },
  actions: {
    fetchListExercice({ commit }) {
      return ExerciceService.getExercices().then(data => {
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

    addSapeurs({ state, commit }, payload) {
      return ExerciceService.addSapeurs(state.currentExercice.data.id, {
        sapeurs: payload
      }).then(async data => {
        await commit(types.ADD_CURRENT_EXERCICE_SAPEURS, data)
        return data
      })
    },
    editSapeurs({ state, commit }, payload) {
      return ExerciceService.editSapeurs(state.currentExercice.data.id, {
        sapeurs: payload
      }).then(async data => {
        await commit(types.EDIT_CURRENT_EXERCICE_SAPEURS, data)
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
