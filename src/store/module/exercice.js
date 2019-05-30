import types from '../mutationTypes'
import ExerciceService from '../../services/ExerciceService'

export default {
  state: {
    exercices: [],
    currentExercice: {
      id: 0
    }
  },
  mutations: {
    [types.UPDATE_EXERCICE_LIST](state, payload) {
      state.exercices = payload
    }
  },
  getters: {
    listExercices: state => {
      return state.exercices
    },
    activeExerciceId: state => {
      return state.currentExercice.id
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
    }
  }
}
