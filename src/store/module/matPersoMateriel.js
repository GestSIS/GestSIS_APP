import types from '../mutationTypes';
import MatPersoMaterielService from '../../services/MatPersoMaterielService.js';

export default {
  state: {
    aRecuperer: [],
    liste: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.aRecuperer = [];
      state.liste = [];
    },
    [types.UPDATE_MAT_PERSO_LISTE](state, payload) {
      state.liste = payload;
    },
    [types.UPDATE_MAT_PERSO_A_RECUPERER_LISTE](state, payload) {
      state.aRecuperer = payload;
    },
  },
  actions: {
    fetchMatPerso({ commit }) {
      return MatPersoMaterielService.getMateriel().then((data) =>
        commit(types.UPDATE_MAT_PERSO_LISTE, data)
      );
    },
    fetchMatPersoARecuperer({ commit }) {
      return MatPersoMaterielService.getARecuperer().then((data) =>
        commit(types.UPDATE_MAT_PERSO_A_RECUPERER_LISTE, data)
      );
    },
    // addMatPersoAlerte({ commit }, alerte) {
    //   return MatPersoMaterielService.addAlerte(alerte).then((data) => {
    //     commit(types.ADD_MAT_PERSO, data);
    //     return data;
    //   });
    // },
    // updateMatPersoAlerte({ commit }, alerte) {
    //   return MatPersoMaterielService.updateAlerte(alerte).then((data) => {
    //     commit(types.UPDATE_MAT_PERSO, data);
    //     return data;
    //   });
    // },
    // removeMatPersoAlerte({ commit }, alerteId) {
    //   return MatPersoMaterielService.removeAlerte(alerteId).then((data) => {
    //     commit(types.REMOVE_MAT_PERSO, alerteId);
    //     return data;
    //   });
    // },
  },
};
