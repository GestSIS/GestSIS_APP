import types from '../mutationTypes';
import MatPersoAlerteTypeService from '../../services/MatPersoAlerteTypeService.js';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
    },
    [types.UPDATE_MAT_PERSO_ALERTE_TYPE_LISTE](state, payload) {
      state.liste = payload
        .slice(0)
        .sort((t1, t2) => t1.designation > t2.designation);
    },
    [types.ADD_MAT_PERSO_ALERTE_TYPE](state, alerte) {
      state.liste = [...state.liste, alerte];
    },
    [types.UPDATE_MAT_PERSO_ALERTE_TYPE](state, alerte) {
      state.liste = [
        ...state.liste.map((m) => (m.id === alerte.id ? alerte : m)),
      ];
    },
    [types.REMOVE_MAT_PERSO_ALERTE_TYPE](state, alerteId) {
      state.liste = state.liste.filter((m) => m.id != alerteId);
    },
  },
  actions: {
    fetchMatPersoAlerteTypes({ commit, state }) {
      if (state.liste.length > 0) {
        return Promise.resolve();
      } else {
        return MatPersoAlerteTypeService.getAlertes().then((data) =>
          commit(types.UPDATE_MAT_PERSO_ALERTE_TYPE_LISTE, data)
        );
      }
    },
    addMatPersoAlerteType({ commit }, alerte) {
      return MatPersoAlerteTypeService.addAlerte(alerte).then((data) => {
        commit(types.ADD_MAT_PERSO_ALERTE_TYPE, data);
        return data;
      });
    },
    updateMatPersoAlerteType({ commit }, alerte) {
      return MatPersoAlerteTypeService.updateAlerte(alerte).then((data) => {
        commit(types.UPDATE_MAT_PERSO_ALERTE_TYPE, data);
        return data;
      });
    },
    removeMatPersoAlerteType({ commit }, alerteId) {
      return MatPersoAlerteTypeService.removeAlerte(alerteId).then((data) => {
        commit(types.REMOVE_MAT_PERSO_ALERTE_TYPE, alerteId);
        return data;
      });
    },
  },
};
