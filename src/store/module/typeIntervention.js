import types from '../mutationTypes';
import TypeInterventionService from '../../services/TypeInterventionService';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
    },
    [types.UPDATE_TYPE_INTERVENTION_LISTE](state, payload) {
      state.liste = payload
        .slice(0)
        .sort((t1, t2) => t1.designation > t2.designation);
    },
    [types.ADD_TYPE_INTERVENTION](state, type) {
      state.liste = [...state.liste, type];
    },
    [types.UPDATE_TYPE_INTERVENTION](state, type) {
      state.liste = [...state.liste.map((m) => (m.id === type.id ? type : m))];
    },
    [types.REMOVE_TYPE_INTERVENTION](state, typeId) {
      state.liste = state.liste.filter((m) => m.id != typeId);
    },
  },
  actions: {
    fetchTypeInterventions({ commit, state }) {
      if (state.liste.length > 0) {
        return Promise.resolve();
      } else {
        return TypeInterventionService.getTypes().then((data) =>
          commit(types.UPDATE_TYPE_INTERVENTION_LISTE, data)
        );
      }
    },
    addTypeIntervention({ commit }, type) {
      return TypeInterventionService.addType(type).then((data) => {
        commit(types.ADD_TYPE_INTERVENTION, data);
        return data;
      });
    },
    updateTypeIntervention({ commit }, type) {
      return TypeInterventionService.updateType(type).then((data) => {
        commit(types.UPDATE_TYPE_INTERVENTION, data);
        return data;
      });
    },
    removeTypeIntervention({ commit }, typeId) {
      return TypeInterventionService.removeType(typeId).then((data) => {
        commit(types.REMOVE_TYPE_INTERVENTION, typeId);
        return data;
      });
    },
  },
};
