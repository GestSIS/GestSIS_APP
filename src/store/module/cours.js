import types from '../mutationTypes'
import CoursService from '../../services/CoursService'

export default {
  state: {
    cours: [],
    currentCours: {
      id: 0,
      cours_id: 0,
      fonction_id: 0,
      fonction_sapeur_id: 0,
      grade_id: 0,
      localite_id: 0,
      precedent_id: 0,
      date: null
    }
  },
  mutations: {
    [types.UPDATE_COURS_LIST](state, payload) {
      state.cours = payload
    },
    [types.UPDATE_CURRENT_COURS](state, payload) {
      state.currentCours = payload
    }
  },
  getters: {
    listCours: state => {
      return state.cours
    },
    getCours: state => cours_id => {
      return state.cours.filter(c => c.id === cours_id)[0]
    },
    activeCours: state => {
      return state.currentCours
    }
  },
  actions: {
    fetchCours({ commit }) {
      return CoursService.getCours().then(data => {
        return commit(types.UPDATE_COURS_LIST, data)
      })
    },
    updateActiveCours({ commit }, payload) {
      return commit(types.UPDATE_CURRENT_COURS, payload)
    },
    resetActiveCours({ commit }) {
      return commit(types.UPDATE_CURRENT_COURS, {
        id: 0,
        cours_id: 0,
        fonction_id: 0,
        fonction_sapeur_id: 0,
        grade_id: 0,
        localite_id: 0,
        precedent_id: 0,
        date: null
      })
    }
  }
}
