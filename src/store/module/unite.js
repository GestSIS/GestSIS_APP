import types from '../mutationTypes';
import UniteService from '../../services/UniteService.js';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
    },
    [types.UPDATE_UNITE_LISTE](state, payload) {
      state.liste = payload;
    },
    [types.ADD_UNITE](state, unite) {
      state.liste = [...state.liste, unite];
    },
    [types.UPDATE_UNITE](state, unite) {
      state.liste = [
        ...state.liste.map((m) => (m.id === unite.id ? unite : m)),
      ];
    },
    [types.REMOVE_UNITE](state, uniteId) {
      state.liste = state.liste.filter((m) => m.id != uniteId);
    },
  },
  actions: {
    fetchUnites({ state, commit }) {
      if (state.liste.length === 0) {
        return UniteService.getUnites().then((data) =>
          commit(types.UPDATE_UNITE_LISTE, data)
        );
      }
    },
    addUnite({ commit }, unite) {
      return UniteService.addUnite(unite).then((data) => {
        commit(types.ADD_UNITE, data);
        return data;
      });
    },
    updateUnite({ commit }, unite) {
      return UniteService.updateUnite(unite).then((data) => {
        commit(types.UPDATE_UNITE, data);
        return data;
      });
    },
    removeUnite({ commit }, unite) {
      return UniteService.removeUnite(unite).then((data) => {
        commit(types.REMOVE_UNITE, data);
        return data;
      });
    },
  },
};
