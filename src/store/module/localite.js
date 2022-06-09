import types from '../mutationTypes';
import LocaliteService from '../../services/LocaliteService.js';

export default {
  state: {
    liste: [],
    listeSis: [],
  },
  mutations: {
    [types.UPDATE_LOCALITE_LISTE](state, payload) {
      state.liste = payload.sort((a, b) =>
        a.designation.localeCompare(b.designation)
      );
    },
    [types.UPDATE_LOCALITE_SIS_LISTE](state, payload) {
      state.listeSis = payload;
    },
  },
  getters: {
    listeLocalitesSis: (state) => {
      const index = new Set(state.listeSis);
      return state.liste.filter((l) => index.has(l.id));
    },
  },
  actions: {
    addLocalitesSis({ commit }, localiteIds) {
      return LocaliteService.addLocalitesSis(localiteIds).then((data) =>
        commit(types.UPDATE_LOCALITE_SIS_LISTE, data)
      );
    },
    removeLocalitesSis({ commit }, localiteIds) {
      return LocaliteService.removeLocalitesSis(localiteIds).then((data) =>
        commit(types.UPDATE_LOCALITE_SIS_LISTE, data)
      );
    },
    fetchLocalitesSis({ commit }) {
      return LocaliteService.getLocalitesSis().then((data) =>
        commit(types.UPDATE_LOCALITE_SIS_LISTE, data)
      );
    },
    fetchLocalites({ commit, state }) {
      if (state.liste.length > 0) {
        return Promise.resolve();
      }
      return LocaliteService.getLocalites().then((data) =>
        commit(types.UPDATE_LOCALITE_LISTE, data)
      );
    },
  },
};
