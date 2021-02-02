import types from '../mutationTypes';
import StatInterventionService from '../../services/StatInterventionService';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.UPDATE_STAT_INTERVENTION_LISTE](state, payload) {
      state.liste = payload
        .slice(0)
        .sort((t1, t2) => t1.designation > t2.designation);
    },
  },
  actions: {
    fetchStatInterventions({ commit, state }) {
      if (state.liste.length > 0) {
        return Promise.resolve();
      } else {
        return StatInterventionService.getStats().then((data) =>
          commit(types.UPDATE_STAT_INTERVENTION_LISTE, data)
        );
      }
    },
  },
};
