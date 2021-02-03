import types from '../mutationTypes';
import ExerciceCategorieService from '../../services/ExerciceCategorieService';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.UPDATE_EXERCICE_CATEGORIE_LISTE](state, payload) {
      state.liste = payload
        .slice(0)
        .sort((c1, c2) => c1.designation > c2.designation);
    },
  },
  getters: {
    getExerciceCategorie: (state) => (categorie_id) =>
      state.liste.find((c) => c.id === categorie_id),
  },
  actions: {
    fetchExerciceCategories({ commit, state }) {
      if (state.liste.length > 0) {
        return Promise.resolve();
      } else {
        return ExerciceCategorieService.getCategories().then((data) =>
          commit(types.UPDATE_EXERCICE_CATEGORIE_LISTE, data)
        );
      }
    },
  },
};
