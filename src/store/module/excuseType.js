import types from '../mutationTypes';
import ExcuseTypeService from '../../services/ExcuseTypeService';

export default {
  state: {
    liste: [],
    activeExcuseTypeId: null,
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.liste = [];
      state.activeExcuseTypeId = null;
    },
    [types.UPDATE_EXCUSE_TYPE_LISTE](state, payload) {
      state.liste = payload;
    },
    [types.SELECT_EXCUSE_TYPE](state, payload) {
      state.activeExcuseTypeId = payload;
    },
    [types.ADD_EXCUSE_TYPE](state, excuse) {
      state.liste = [...state.liste, excuse];
    },
    [types.UPDATE_EXCUSE_TYPE](state, excuse) {
      state.liste = [
        ...state.liste.map((m) => (m.id === excuse.id ? excuse : m)),
      ];
    },
    [types.REMOVE_EXCUSE_TYPE](state, excuseId) {
      state.liste = state.liste.filter((m) => m.id != excuseId);
    },
  },
  actions: {
    fetchExcuseTypes({ commit, state }) {
      if (state.liste.length == 0) {
        return ExcuseTypeService.getExcuses().then((data) =>
          commit(types.UPDATE_EXCUSE_TYPE_LISTE, data)
        );
      }
    },
    selectExcuseType({ commit }, excuse_excuse_id) {
      return commit(types.SELECT_EXCUSE_TYPE, excuse_excuse_id);
    },
    addExcuseType({ commit }, excuse) {
      return ExcuseTypeService.addExcuse(excuse).then((data) => {
        commit(types.ADD_EXCUSE_TYPE, data);
        return data;
      });
    },
    updateExcuseType({ commit }, excuse) {
      return ExcuseTypeService.updateExcuse(excuse).then((data) => {
        commit(types.UPDATE_EXCUSE_TYPE, data);
        return data;
      });
    },
    removeExcuseType({ commit }, excuse) {
      return ExcuseTypeService.removeExcuse(excuse).then((data) => {
        commit(types.REMOVE_EXCUSE_TYPE, data);
        return data;
      });
    },
  },
};
