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
