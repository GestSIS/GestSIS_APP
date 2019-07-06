import types from '../mutationTypes'
import GradeService from '../../services/GradeService'

export default {
  state: {
    liste: [],
    currentGrade: {
      id: 0,
      grade_id: 0,
      date: null,
      remarque: ''
    }
  },
  mutations: {
    [types.UPDATE_GRADE_LIST](state, payload) {
      state.liste = payload
    },
    [types.UPDATE_CURRENT_GRADE](state, payload) {
      state.currentGrade = payload
    }
  },
  getters: {
    getGrade: state => grade_id => {
      return state.liste.filter(g => g.id === grade_id)[0]
    },
    activeGrade: state => {
      return state.currentGrade
    }
  },
  actions: {
    fetchGrades({ commit }) {
      return GradeService.getGrades().then(data =>
        commit(types.UPDATE_GRADE_LIST, data)
      )
    },
    updateActiveGrade({ commit }, payload) {
      return commit(types.UPDATE_CURRENT_GRADE, payload)
    },
    resetActiveGrade({ commit }) {
      return commit(types.UPDATE_CURRENT_GRADE, {
        id: 0,
        grade_id: 0,
        date: null,
        remarque: ''
      })
    }
  }
}
