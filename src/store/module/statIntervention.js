import types from '../mutationTypes';
import StatInterventionService from '../../services/StatInterventionService';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
    },
    [types.UPDATE_STAT_INTERVENTION_LISTE](state, payload) {
      state.liste = payload
        .slice(0)
        .sort((t1, t2) => t1.designation > t2.designation);
    },
    [types.ADD_STAT_INTERVENTION](state, stat) {
      state.liste = [...state.liste, stat];
    },
    [types.UPDATE_STAT_INTERVENTION](state, stat) {
      state.liste = [...state.liste.map((m) => (m.id === stat.id ? stat : m))];
    },
    [types.REMOVE_STAT_INTERVENTION](state, statId) {
      state.liste = state.liste.filter((m) => m.id != statId);
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
    addStatIntervention({ commit }, stat) {
      return StatInterventionService.addStat(stat).then((data) => {
        commit(types.ADD_STAT_INTERVENTION, data);
        return data;
      });
    },
    updateStatIntervention({ commit }, stat) {
      return StatInterventionService.updateStat(stat).then((data) => {
        commit(types.UPDATE_STAT_INTERVENTION, data);
        return data;
      });
    },
    removeStatIntervention({ commit }, stat) {
      return StatInterventionService.removeStat(stat).then((data) => {
        commit(types.REMOVE_STAT_INTERVENTION, data);
        return data;
      });
    },
  },
};
