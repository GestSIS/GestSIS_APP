import types from '../mutationTypes';
import MatPersoAlerteService from '../../services/MatPersoAlerteService.js';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
    },
    [types.UPDATE_MAT_PERSO_ALERTE_LISTE](state, payload) {
      state.liste = payload
        .slice(0)
        .sort((t1, t2) => t1.designation > t2.designation);
    },
    [types.ADD_MAT_PERSO_ALERTE](state, alerte) {
      state.liste = [...state.liste, alerte];
    },
    [types.UPDATE_MAT_PERSO_ALERTE](state, alerte) {
      state.liste = [
        ...state.liste.map((m) => (m.id === alerte.id ? alerte : m)),
      ];
    },
    [types.REMOVE_MAT_PERSO_ALERTE](state, alerteId) {
      state.liste = state.liste.filter((m) => m.id != alerteId);
    },
  },
  actions: {
    fetchMatPersoAlertes({ commit }) {
      return MatPersoAlerteService.getAlertes().then((data) =>
        commit(types.UPDATE_MAT_PERSO_ALERTE_LISTE, data)
      );
    },
    addMatPersoAlerte({ commit }, alerte) {
      return MatPersoAlerteService.addAlerte(alerte).then((data) => {
        commit(types.ADD_MAT_PERSO_ALERTE, data);
        return data;
      });
    },
    updateMatPersoAlerte({ commit }, alerte) {
      return MatPersoAlerteService.updateAlerte(alerte).then((data) => {
        commit(types.UPDATE_MAT_PERSO_ALERTE, data);
        return data;
      });
    },
    removeMatPersoAlerte({ commit }, alerteId) {
      return MatPersoAlerteService.removeAlerte(alerteId).then((data) => {
        commit(types.REMOVE_MAT_PERSO_ALERTE, alerteId);
        return data;
      });
    },
  },
};
