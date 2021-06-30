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
    [types.ADD_EXERCICE_CATEGORIE](state, categorie) {
      state.liste = [...state.liste, categorie];
    },
    [types.UPDATE_EXERCICE_CATEGORIE](state, categorie) {
      state.liste = [
        ...state.liste.map((m) => (m.id === categorie.id ? categorie : m)),
      ];
    },
    [types.REMOVE_EXERCICE_CATEGORIE](state, categorieId) {
      state.liste = state.liste.filter((m) => m.id != categorieId);
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
    addExerciceCategorie({ commit }, categorie) {
      return ExerciceCategorieService.addCategorie(categorie).then((data) => {
        commit(types.ADD_EXERCICE_CATEGORIE, data);
        return data;
      });
    },
    updateExerciceCategorie({ commit }, categorie) {
      return ExerciceCategorieService.updateCategorie(categorie).then(
        (data) => {
          commit(types.UPDATE_EXERCICE_CATEGORIE, data);
          return data;
        }
      );
    },
    removeExerciceCategorie({ commit }, categorie) {
      return ExerciceCategorieService.removeCategorie(categorie).then(
        (data) => {
          commit(types.REMOVE_EXERCICE_CATEGORIE, data);
          return data;
        }
      );
    },
  },
};
