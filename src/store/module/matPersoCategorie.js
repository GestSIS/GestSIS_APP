import types from '../mutationTypes';
import MatPersoCategorieService from '../../services/MatPersoCategorieService.js';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
    },
    [types.UPDATE_MAT_PERSO_CATEGORIE_LISTE](state, payload) {
      state.liste = payload
        .slice(0)
        .sort((t1, t2) => t1.designation > t2.designation);
    },
    [types.ADD_MAT_PERSO_CATEGORIE](state, categorie) {
      state.liste = [...state.liste, categorie];
    },
    [types.UPDATE_MAT_PERSO_CATEGORIE](state, categorie) {
      state.liste = [
        ...state.liste.map((m) => (m.id === categorie.id ? categorie : m)),
      ];
    },
    [types.REMOVE_MAT_PERSO_CATEGORIE](state, categorieId) {
      state.liste = state.liste.filter((m) => m.id != categorieId);
    },
  },
  actions: {
    fetchMatPersoCategories({ commit, state }) {
      if (state.liste.length > 0) {
        return Promise.resolve();
      } else {
        return MatPersoCategorieService.getCategories().then((data) =>
          commit(types.UPDATE_MAT_PERSO_CATEGORIE_LISTE, data)
        );
      }
    },
    addMatPersoCategorie({ commit }, categorie) {
      return MatPersoCategorieService.addCategorie(categorie).then((data) => {
        commit(types.ADD_MAT_PERSO_CATEGORIE, data);
        return data;
      });
    },
    updateMatPersoCategorie({ commit }, categorie) {
      return MatPersoCategorieService.updateCategorie(categorie).then(
        (data) => {
          commit(types.UPDATE_MAT_PERSO_CATEGORIE, data);
          return data;
        }
      );
    },
    removeMatPersoCategorie({ commit }, categorieId) {
      return MatPersoCategorieService.removeCategorie(categorieId).then(
        (data) => {
          commit(types.REMOVE_MAT_PERSO_CATEGORIE, categorieId);
          return data;
        }
      );
    },
  },
};
