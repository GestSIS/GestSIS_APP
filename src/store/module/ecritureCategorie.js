import types from '../mutationTypes';
import EcritureCategorieService from '../../services/EcritureCategorieService';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.UPDATE_ECRITURE_CATEGORIE_LISTE](state, payload) {
      state.liste = payload;
    },
    [types.ADD_ECRITURE_CATEGORIE](state, categorie) {
      state.liste = [...state.liste, categorie];
    },
    [types.UPDATE_ECRITURE_CATEGORIE](state, categorie) {
      state.liste = [
        ...state.liste.map((m) => (m.id === categorie.id ? categorie : m)),
      ];
    },
    [types.REMOVE_ECRITURE_CATEGORIE](state, categorieId) {
      state.liste = state.liste.filter((m) => m.id != categorieId);
    },
  },
  actions: {
    fetchEcritureCategories({ commit, state }) {
      if (state.liste.length > 0) {
        return Promise.resolve();
      } else {
        return EcritureCategorieService.getCategories().then((data) =>
          commit(types.UPDATE_ECRITURE_CATEGORIE_LISTE, data)
        );
      }
    },
    addEcritureCategorie({ commit }, categorie) {
      return EcritureCategorieService.addCategorie(categorie).then((data) => {
        commit(types.ADD_ECRITURE_CATEGORIE, data);
        return data;
      });
    },
    updateEcritureCategorie({ commit }, categorie) {
      return EcritureCategorieService.updateCategorie(categorie).then(
        (data) => {
          commit(types.UPDATE_ECRITURE_CATEGORIE, data);
          return data;
        }
      );
    },
    removeEcritureCategorie({ commit }, categorie) {
      return EcritureCategorieService.removeCategorie(categorie).then(
        (data) => {
          commit(types.REMOVE_ECRITURE_CATEGORIE, data);
          return data;
        }
      );
    },
  },
};
