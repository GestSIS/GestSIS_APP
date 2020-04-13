import types from '../mutationTypes';
import ExerciceCategorieService from '../../services/ExerciceCategorieService';

export default {
  state: {
    liste: []
  },
  mutations: {
    [types.UPDATE_EXERCICE_CATEGORIE_LIST](state, payload) {
      state.liste = payload;
    }
  },
  getters: {
    listExerciceCategories: state =>
      state.liste.slice(0).sort((c1, c2) => c1.designation > c2.designation),
    getExerciceCategorie: state => categorie_id =>
      state.liste.filter(c => c.id === categorie_id)[0]
  },
  actions: {
    fetchExerciceCategories({ commit, state }) {
      if (state.liste.size > 0) {
        return Promise.resolve();
      } else {
        return ExerciceCategorieService.getCategories().then(data =>
          commit(types.UPDATE_EXERCICE_CATEGORIE_LIST, data)
        );
      }
    }
  }
};
