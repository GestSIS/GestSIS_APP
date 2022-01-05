import types from '../mutationTypes';
import LocaliteService from '../../services/LocaliteService';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.UPDATE_LOCALITE_LISTE](state, payload) {
      state.liste = payload.sort((a, b) =>
        a.designation.localeCompare(b.designation)
      );
    },
  },
  getters: {
    listeLocalitesSis: (state) => state.liste,
  },
  actions: {
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
