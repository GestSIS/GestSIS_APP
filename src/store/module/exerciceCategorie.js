import types from '../mutationTypes'
import ExerciceCategorieService from '../../services/ExerciceCategorieService'

export default {
  state: {
    categories: []
  },
  mutations: {
    [types.UPDATE_EXERCICE_CATEGORIE_LIST](state, payload) {
      state.categories = payload
    }
  },
  getters: {
    listExerciceCategories: state => {
      return state.categories.slice(0).sort((c1,c2) => c1.designation > c2.designation)
    },
    getExerciceCategorie: state => categorie_id => {
      return state.categories.filter(c => c.id === categorie_id)[0]
    }
  },
  actions: {
    fetchExerciceCategories({ commit }) {
      return ExerciceCategorieService.getCategories().then(data => {
        return commit(types.UPDATE_EXERCICE_CATEGORIE_LIST, data)
      })
    }
  }
}
