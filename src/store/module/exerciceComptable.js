import types from '../mutationTypes'
import ExerciceComptableService from '../../services/ExerciceComptableService'

export default {
  state: {
    exercicesComptables: [],
    activeExerciceComptableId: null
  },
  mutations: {
    [types.UPDATE_EXERCICE_COMPTABLE_LIST](state, payload) {
      state.exercicesComptables = payload
      if ((state.activeExerciceComptableId || 0) === 0) {
        state.activeExerciceComptableId = payload.sort(
          (e1, e2) => e2.annee - e1.annee
        )[0].id
      }
    },
    [types.SELECT_EXERCICE_COMPTABLE](state, payload) {
      state.activeExerciceComptableId = payload
    }
  },
  getters: {
    listExerciceComptable: state => {
      return state.exercicesComptables
    },
    currentExerciceComptableId: state => {
      return state.activeExerciceComptableId
    },
    getExerciceComptable: state => id => {
      return state.exercicesComptables.filter(e => e.id === id)[0]
    }
  },
  actions: {
    fetchExercicesComptables({ commit }) {
      return ExerciceComptableService.getExercices().then(data => {
        return commit(types.UPDATE_EXERCICE_COMPTABLE_LIST, data)
      })
    },
    selectExerciceComptable({ commit }, excuse_type_id) {
      return commit(types.SELECT_EXERCICE_COMPTABLE, excuse_type_id)
    }
  }
}
