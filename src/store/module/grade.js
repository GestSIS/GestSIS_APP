import types from '../mutationTypes'
import GradeService from '../../services/GradeService'

export default {
  state: {
    grades: []
  },
  mutations: {
    [types.UPDATE_GRADE_LIST](state, payload) {
      state.grades = payload
    }
  },
  getters: {
    listGrades: state => {
      return state.grades
    },
    getGrade: state => grade_id => {
      return state.grades.filter(g => g.id === grade_id)[0]
    }
  },
  actions: {
    fetchGrades({ commit }) {
      return GradeService.getGrades().then(data => {
        return commit(types.UPDATE_GRADE_LIST, data)
      })
    }
  }
}
