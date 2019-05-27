import types from '../mutationTypes'
import CoursService from '../../services/CoursService'

export default {
  state: {
    cours: []
  },
  mutations: {
    [types.UPDATE_COURS_LIST](state, payload) {
      state.cours = payload
    }
  },
  getters: {
    listCours: state => {
      return state.cours
    },
    getCours: state => cours_id => {
      return state.cours.filter(c => c.id === cours_id)[0]
    }
  },
  actions: {
    fetchCours({ commit }) {
      return CoursService.getCours().then(data => {
        return commit(types.UPDATE_COURS_LIST, data)
      })
    }
  }
}
