import types from '../mutationTypes';
import StatFederalService from '../../services/StatFederalService.js';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.UPDATE_STAT_FEDERAL_LISTE](state, payload) {
      state.liste = payload
        .slice(0)
        .sort((t1, t2) => t1.designation > t2.designation);
    },
  },
  actions: {
    fetchStatFederals({ commit, state }) {
      if (state.liste.length > 0) {
        return Promise.resolve();
      } else {
        return StatFederalService.getStats().then((data) =>
          commit(types.UPDATE_STAT_FEDERAL_LISTE, data)
        );
      }
    },
  },
};
