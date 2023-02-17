import types from '../mutationTypes';
import ExcuseParamService from '../../services/ExcuseParamService.js';

export default {
  state: {
    params: null,
  },
  mutations: {
    [types.CLEAR_CACHE](state) {
      state.params = null;
    },
    [types.UPDATE_EXCUSE_PARAMS](state, payload) {
      state.params = payload;
    },
  },
  actions: {
    fetchExcuseParams({ state, commit }) {
      if (state.params === null) {
        return ExcuseParamService.getParams().then((data) =>
          commit(types.UPDATE_EXCUSE_PARAMS, data)
        );
      }
    },
    updateExcuseParams({ commit }, params) {
      return ExcuseParamService.updateParams(params).then((data) => {
        commit(types.UPDATE_EXCUSE_PARAMS, data);
        return data;
      });
    },
  },
};
