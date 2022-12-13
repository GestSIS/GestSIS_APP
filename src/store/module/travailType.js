import types from '../mutationTypes';
import TravailType from '../../services/TravailTypeService.js';

export default {
  state: {
    liste: [],
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
    },
    [types.UPDATE_TRAVAIL_TYPE_LISTE](state, payload) {
      state.liste = payload
        .slice(0)
        .sort((t1, t2) => t1.designation > t2.designation);
    },
    [types.ADD_TRAVAIL_TYPE](state, type) {
      state.liste = [...state.liste, type];
    },
    [types.UPDATE_TRAVAIL_TYPE](state, type) {
      state.liste = [...state.liste.map((m) => (m.id === type.id ? type : m))];
    },
    [types.REMOVE_TRAVAIL_TYPE](state, typeId) {
      state.liste = state.liste.filter((m) => m.id != typeId);
    },
  },
  actions: {
    fetchTravailTypes({ commit, state }) {
      if (state.liste.length > 0) {
        return Promise.resolve();
      } else {
        return TravailType.getTypes().then((data) =>
          commit(types.UPDATE_TRAVAIL_TYPE_LISTE, data)
        );
      }
    },
    addTravailType({ commit }, type) {
      return TravailType.addType(type).then((data) => {
        commit(types.ADD_TRAVAIL_TYPE, data);
        return data;
      });
    },
    updateTravailType({ commit }, type) {
      return TravailType.updateType(type).then((data) => {
        commit(types.UPDATE_TRAVAIL_TYPE, data);
        return data;
      });
    },
    removeTravailType({ commit }, typeId) {
      return TravailType.removeType(typeId).then((data) => {
        commit(types.REMOVE_TRAVAIL_TYPE, typeId);
        return data;
      });
    },
  },
};
