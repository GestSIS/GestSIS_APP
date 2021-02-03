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
  },
};
